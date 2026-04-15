import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]

const SYSTEM_PROMPT = `You are an affirmation script writer grounded in Dr. Joseph Murphy, Napoleon Hill, and Rhonda Byrne.

Write a personal affirmation script of 100–120 words. Rules:
- First person, present tense only ("I am", "I have", "I attract")
- Murphy: address the subconscious directly ("My subconscious mind now...")
- Hill: burning desire, certainty, persistence
- Byrne: gratitude and trust ("I am grateful", "The universe provides...")
- If TARGET DATE given: state it with certainty ("By [month] [year]...")
- If CURRENT SITUATION given: bridge from it toward the desire
- Every sentence must feel personal to THIS desire — never generic
- Close with one powerful sentence of absolute certainty
- Title: 3–5 evocative words

Return ONLY valid JSON: {"title":"...","content":"..."}`

function buildPrompt(desire: string, month: string, year: string, reality: string): string {
  let p = `DESIRE: ${desire}`
  if (month && year) p += `\nTARGET DATE: ${MONTHS[+month - 1]} ${year}`
  if (reality?.trim()) p += `\nCURRENT SITUATION: ${reality}`
  return p
}

function isCurrentMonth(dateStr: string | null): boolean {
  if (!dateStr) return false
  const d = new Date(dateStr)
  const now = new Date()
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return new Response('Unauthorized', { status: 401, headers: CORS })

    const { data: { user }, error: authErr } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )
    if (authErr || !user) return new Response('Unauthorized', { status: 401, headers: CORS })

    const { desire, deadline_month, deadline_year, current_situation } = await req.json()
    if (!desire?.trim()) return new Response('desire is required', { status: 400, headers: CORS })

    // Fetch profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan, plan_expires_at, total_scripts_generated, monthly_scripts_generated, monthly_reset_at')
      .eq('id', user.id)
      .single()

    const isPro = profile?.plan === 'pro' &&
      profile?.plan_expires_at &&
      new Date(profile.plan_expires_at) > new Date()

    if (isPro) {
      const monthlyCount = isCurrentMonth(profile?.monthly_reset_at)
        ? (profile?.monthly_scripts_generated ?? 0)
        : 0
      if (monthlyCount >= 10) {
        return new Response(
          JSON.stringify({ error: 'upgrade_required', message: 'You\'ve used all 10 scripts this month. Your limit resets next month.' }),
          { status: 422, headers: { ...CORS, 'Content-Type': 'application/json' } }
        )
      }
    } else {
      // Free: 3 lifetime scripts
      if ((profile?.total_scripts_generated ?? 0) >= 3) {
        return new Response(
          JSON.stringify({ error: 'upgrade_required', message: 'You\'ve used your 3 free scripts.' }),
          { status: 422, headers: { ...CORS, 'Content-Type': 'application/json' } }
        )
      }
    }

    const openaiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiKey) return new Response(
      JSON.stringify({ error: 'OpenAI key not configured' }),
      { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } }
    )

    const prompt = buildPrompt(
      desire.trim(),
      deadline_month ?? '',
      deadline_year ?? '',
      current_situation ?? '',
    )

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user',   content: prompt },
        ],
        temperature: 0.85,
        max_tokens: 500,
        response_format: { type: 'json_object' },
      }),
    })

    if (!openaiRes.ok) {
      const errText = await openaiRes.text()
      return new Response(
        JSON.stringify({ error: `OpenAI error ${openaiRes.status}: ${errText}` }),
        { status: 502, headers: { ...CORS, 'Content-Type': 'application/json' } }
      )
    }

    const openaiData = await openaiRes.json()
    const parsed = JSON.parse(openaiData.choices[0].message.content)

    const { data: script, error: dbErr } = await supabase
      .from('scripts')
      .insert({
        user_id:   user.id,
        goal_text: desire.trim(),
        title:     parsed.title,
        content:   parsed.content,
      })
      .select('id, title, content, goal_text, created_at')
      .single()

    if (dbErr) throw dbErr

    // Increment counters — never decrements on delete
    if (isPro) {
      const newMonthly = isCurrentMonth(profile?.monthly_reset_at)
        ? (profile?.monthly_scripts_generated ?? 0) + 1
        : 1
      await supabase.from('profiles').update({
        total_scripts_generated: (profile?.total_scripts_generated ?? 0) + 1,
        monthly_scripts_generated: newMonthly,
        monthly_reset_at: new Date().toISOString().slice(0, 10),
      }).eq('id', user.id)
    } else {
      await supabase.from('profiles').update({
        total_scripts_generated: (profile?.total_scripts_generated ?? 0) + 1,
      }).eq('id', user.id)
    }

    return new Response(JSON.stringify(script), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }
})
