import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function defaultVoice(gender: string | null): string {
  if (gender === 'male')   return 'onyx'
  if (gender === 'female') return 'nova'
  return 'alloy'
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

    const { script_id, text, voice: requestedVoice } = await req.json()
    if (!text?.trim()) return new Response('text is required', { status: 400, headers: CORS })

    // Fetch profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan, plan_expires_at, gender, total_audios_generated, monthly_audios_generated, monthly_reset_at')
      .eq('id', user.id)
      .single()

    const isPro = profile?.plan === 'pro' &&
      profile?.plan_expires_at &&
      new Date(profile.plan_expires_at) > new Date()

    if (isPro) {
      const monthlyCount = isCurrentMonth(profile?.monthly_reset_at)
        ? (profile?.monthly_audios_generated ?? 0)
        : 0
      if (monthlyCount >= 5) {
        return new Response(
          JSON.stringify({ error: 'upgrade_required', message: 'You\'ve used all 5 audio conversions this month. Your limit resets next month.' }),
          { status: 422, headers: { ...CORS, 'Content-Type': 'application/json' } }
        )
      }
    } else {
      // Free: 1 lifetime audio — deleting and re-generating is blocked
      if ((profile?.total_audios_generated ?? 0) >= 1) {
        return new Response(
          JSON.stringify({ error: 'upgrade_required', message: 'You\'ve used your 1 free audio conversion.' }),
          { status: 422, headers: { ...CORS, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Resolve voice
    let voice = requestedVoice ?? defaultVoice(profile?.gender ?? null)
    const VALID_VOICES = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer']
    if (!VALID_VOICES.includes(voice)) voice = 'alloy'

    // Get script title
    let scriptTitle = 'My Affirmation'
    if (script_id) {
      const { data: scriptRow } = await supabase
        .from('scripts')
        .select('title')
        .eq('id', script_id)
        .eq('user_id', user.id)
        .single()
      if (scriptRow) scriptTitle = scriptRow.title
    }

    const openaiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiKey) return new Response('OpenAI key not configured', { status: 500, headers: CORS })

    const spacedText = text.trim().replace(/([.!?])\s+/g, '$1\n\n')

    const ttsRes = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${openaiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'tts-1-hd',
        voice,
        input: spacedText,
        speed: 0.85,
      }),
    })

    if (!ttsRes.ok) throw new Error(`OpenAI TTS error: ${await ttsRes.text()}`)

    const audioBuffer = await ttsRes.arrayBuffer()
    const audioId = crypto.randomUUID()
    const storagePath = `${user.id}/${audioId}.mp3`

    const { error: uploadErr } = await supabase.storage
      .from('audio-files')
      .upload(storagePath, audioBuffer, { contentType: 'audio/mpeg', upsert: false })

    if (uploadErr) throw uploadErr

    const durationSeconds = Math.round(audioBuffer.byteLength / 16000)

    const { data: audioRecord, error: dbErr } = await supabase
      .from('audio_files')
      .insert({
        id: audioId,
        user_id: user.id,
        script_id: script_id ?? null,
        script_title: scriptTitle,
        storage_path: storagePath,
        duration_seconds: durationSeconds,
      })
      .select('id, script_title, storage_path, duration_seconds, created_at')
      .single()

    if (dbErr) throw dbErr

    // Increment counters — never decrements on delete
    if (isPro) {
      const newMonthly = isCurrentMonth(profile?.monthly_reset_at)
        ? (profile?.monthly_audios_generated ?? 0) + 1
        : 1
      await supabase.from('profiles').update({
        total_audios_generated: (profile?.total_audios_generated ?? 0) + 1,
        monthly_audios_generated: newMonthly,
        monthly_reset_at: new Date().toISOString().slice(0, 10),
      }).eq('id', user.id)
    } else {
      await supabase.from('profiles').update({
        total_audios_generated: (profile?.total_audios_generated ?? 0) + 1,
      }).eq('id', user.id)
    }

    const { data: urlData } = await supabase.storage
      .from('audio-files')
      .createSignedUrl(storagePath, 60 * 60 * 24 * 7)

    return new Response(
      JSON.stringify({ ...audioRecord, signed_url: urlData?.signedUrl }),
      { headers: { ...CORS, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }
})
