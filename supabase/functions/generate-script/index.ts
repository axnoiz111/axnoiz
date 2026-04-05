import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SYSTEM_PROMPT = `You are a subconscious conditioning specialist trained in the principles of Dr. Joseph Murphy (The Power of Your Subconscious Mind), Napoleon Hill (Think and Grow Rich), and Rhonda Byrne (The Secret).

Create a powerful personal affirmation script for the desire given to you.

Requirements:
- 200–280 words, first person, present tense ("I am", "I have", "I attract")
- Emotionally charged — the reader should feel conviction, not just read words
- Weave in all three approaches naturally:
  * Murphy: "My subconscious mind now..." (subconscious speaks directly to the deeper mind)
  * Hill: definiteness of purpose, burning desire, persistence that cannot be broken
  * Byrne: gratitude, "I attract", "The universe responds..."
- Flow naturally and beautifully when read aloud, like poetry of purpose
- End with a powerful closing affirmation of certainty and completion
- Generate a short evocative title (3–6 words)

Return ONLY valid JSON with no markdown: { "title": "...", "content": "..." }`

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Authenticate caller
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return new Response('Unauthorized', { status: 401, headers: CORS })

    const { data: { user }, error: authErr } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )
    if (authErr || !user) return new Response('Unauthorized', { status: 401, headers: CORS })

    const { goal } = await req.json()
    if (!goal?.trim()) return new Response('goal is required', { status: 400, headers: CORS })

    // Enforce 10-script limit
    const { count } = await supabase
      .from('scripts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if ((count ?? 0) >= 10) {
      return new Response(
        JSON.stringify({ error: 'You have 10 scripts saved. Delete one to generate a new one.' }),
        { status: 422, headers: { ...CORS, 'Content-Type': 'application/json' } }
      )
    }

    // Call OpenAI
    const openaiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiKey) return new Response('OpenAI key not configured', { status: 500, headers: CORS })

    const aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${openaiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `My desire: ${goal.trim()}` },
        ],
        temperature: 0.85,
        max_tokens: 600,
        response_format: { type: 'json_object' },
      }),
    })

    if (!aiRes.ok) throw new Error(`OpenAI error: ${await aiRes.text()}`)
    const aiJson = await aiRes.json()
    const parsed = JSON.parse(aiJson.choices[0].message.content)

    // Auto-save to database
    const { data: script, error: dbErr } = await supabase
      .from('scripts')
      .insert({
        user_id: user.id,
        goal_text: goal.trim(),
        title: parsed.title,
        content: parsed.content,
      })
      .select('id, title, content, goal_text, created_at')
      .single()

    if (dbErr) throw dbErr

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
