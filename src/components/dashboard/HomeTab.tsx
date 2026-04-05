import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUp, ChevronDown, ChevronUp, BookOpen } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

const PLACEHOLDERS = [
  'Tell me your wish, and I\'ll help you complete it...',
  'Tell me what you want, and I\'ll help you receive it...',
  'What does your heart truly desire?',
  'Speak your dream into existence...',
  'What would you ask, if you knew you couldn\'t fail?',
  'What would change everything for you?',
]

const LOADING_MESSAGES = [
  'Reading your desire...',
  'Consulting the principles...',
  'Crafting your script...',
  'Weaving in Murphy, Hill & Byrne...',
  'Almost ready...',
]

const OPENAI_KEY = import.meta.env.VITE_OPENAI_API_KEY as string

const SYSTEM_PROMPT = `You are a subconscious conditioning specialist trained in the principles of Dr. Joseph Murphy (The Power of Your Subconscious Mind), Napoleon Hill (Think and Grow Rich), and Rhonda Byrne (The Secret).

Create a powerful personal affirmation script for the desire given to you.

Requirements:
- 200–280 words, first person, present tense ("I am", "I have", "I attract")
- Emotionally charged — the reader should feel conviction, not just read words
- Weave in all three approaches naturally:
  * Murphy: "My subconscious mind now..." (speaks directly to the deeper mind)
  * Hill: definiteness of purpose, burning desire, persistence that cannot be broken
  * Byrne: gratitude, "I attract", "The universe responds..."
- Flow naturally and beautifully when read aloud, like poetry of purpose
- End with a powerful closing affirmation of certainty and completion
- Generate a short evocative title (3–6 words)

Return ONLY valid JSON with no markdown: { "title": "...", "content": "..." }`

async function generateScript(goal: string): Promise<{ title: string; content: string }> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `My desire: ${goal}` },
      ],
      temperature: 0.85,
      max_tokens: 700,
      response_format: { type: 'json_object' },
    }),
  })
  if (!res.ok) throw new Error(`OpenAI error: ${res.status} ${await res.text()}`)
  const json = await res.json()
  return JSON.parse(json.choices[0].message.content) as { title: string; content: string }
}

const METHOD_STEPS = [
  { n: '01', title: 'Find silence', body: 'Morning or evening — 2 minutes of stillness. Let the outer world fade.' },
  { n: '02', title: 'Read aloud with feeling', body: 'Your subconscious responds to conviction, not repetition. Speak each word as if it is already real.' },
  { n: '03', title: 'Visualise as you read', body: 'See yourself already living what you are declaring. Feel the emotion — joy, gratitude, certainty.' },
  { n: '04', title: 'Repeat daily for 21+ days', body: 'The subconscious accepts what is repeated with emotion. Consistency builds belief.' },
  { n: '05', title: 'Act as if it is done', body: 'Between readings, carry the feeling. Your actions align with your belief — and belief becomes reality.' },
]

interface Script {
  id: string
  title: string
  content: string
  goal_text: string
  created_at: string
}

interface Props {
  profileName: string | null
  userEmail: string
  scriptCount: number
  onScriptGenerated: (script: Script) => void
  onGoToScripts: () => void
}

export default function HomeTab({ profileName, userEmail, scriptCount, onScriptGenerated, onGoToScripts }: Props) {
  const { user } = useAuth()
  const [goal, setGoal] = useState('')
  const [phase, setPhase] = useState<'idle' | 'generating' | 'result'>('idle')
  const [generatedScript, setGeneratedScript] = useState<Script | null>(null)
  const [error, setError] = useState('')
  const [placeholderIdx, setPlaceholderIdx] = useState(0)
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0)
  const [methodOpen, setMethodOpen] = useState(false)
  const [savedToast, setSavedToast] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Cycle placeholder — 6s per phrase, pure opacity fade via AnimatePresence
  useEffect(() => {
    if (phase !== 'idle') return
    const iv = setInterval(() => {
      setPlaceholderIdx(i => (i + 1) % PLACEHOLDERS.length)
    }, 6000)
    return () => clearInterval(iv)
  }, [phase])

  // Cycle loading messages
  useEffect(() => {
    if (phase !== 'generating') return
    const iv = setInterval(() => {
      setLoadingMsgIdx(i => (i + 1) % LOADING_MESSAGES.length)
    }, 2200)
    return () => clearInterval(iv)
  }, [phase])

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 180) + 'px'
  }, [goal])

  const firstName = profileName?.trim().split(' ')[0] || userEmail.split('@')[0]
  const greeting  = (() => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  })()

  const handleGenerate = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!goal.trim() || !user) return
    if (scriptCount >= 10) {
      setError('You have 10 scripts saved. Delete one from the Scripts tab to generate a new one.')
      return
    }
    setError('')
    setPhase('generating')
    setLoadingMsgIdx(0)

    try {
      // Call OpenAI to generate the script
      const script = await generateScript(goal.trim())

      // Auto-save to Supabase
      const { data, error: dbErr } = await supabase
        .from('scripts')
        .insert({
          user_id:   user.id,
          goal_text: goal.trim(),
          title:     script.title,
          content:   script.content,
        })
        .select('id, title, content, goal_text, created_at')
        .single()

      if (dbErr) throw dbErr
      setGeneratedScript(data)
      onScriptGenerated(data)
      setPhase('result')
      setSavedToast(true)
      setTimeout(() => setSavedToast(false), 3000)
    } catch (err: unknown) {
      setPhase('idle')
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    }
  }

  const handleReset = () => {
    setGoal(''); setGeneratedScript(null)
    setPhase('idle'); setMethodOpen(false); setError('')
  }

  // ── GENERATING STATE ──────────────────────────────────────────────
  if (phase === 'generating') {
    return (
      <div className="home-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '28px' }}
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.85, 0.5] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              width: '72px', height: '72px', borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(108,99,255,0.6) 0%, rgba(108,99,255,0.05) 70%)',
            }}
          />
          <AnimatePresence mode="wait">
            <motion.p
              key={loadingMsgIdx}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.3 }}
              style={{ fontSize: '15px', color: '#7A8AAA', fontStyle: 'italic' }}
            >
              {LOADING_MESSAGES[loadingMsgIdx]}
            </motion.p>
          </AnimatePresence>
        </motion.div>
      </div>
    )
  }

  // ── RESULT STATE ──────────────────────────────────────────────────
  if (phase === 'result' && generatedScript) {
    return (
      <div className="home-scroll" style={{ maxWidth: '680px', margin: '0 auto' }}>

        <AnimatePresence>
          {savedToast && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                background: 'rgba(76,175,130,0.08)',
                border: '1px solid rgba(76,175,130,0.2)',
                borderRadius: '8px', padding: '10px 16px',
                fontSize: '12px', color: '#4CAF82',
                textAlign: 'center', marginBottom: '20px',
                letterSpacing: '0.05em',
              }}
            >
              Saved to Scripts ✓
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

          {/* Script card */}
          <div style={{
            background: 'rgba(10,22,40,0.7)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '14px',
            padding: '28px 24px',
            marginBottom: '12px',
          }}>
            <p style={{ fontSize: '10px', color: '#5060A0', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: '10px' }}>
              Your Script
            </p>
            <h2 className="font-display" style={{ fontSize: '24px', color: '#E8EDF8', fontWeight: 300, marginBottom: '20px' }}>
              {generatedScript.title}
            </h2>
            <p style={{
              fontSize: '15px', color: '#A8B8D8',
              lineHeight: 1.9, whiteSpace: 'pre-wrap',
              fontFamily: 'Georgia, serif',
            }}>
              {generatedScript.content}
            </p>
          </div>

          {/* Method card */}
          <div style={{
            background: 'rgba(10,22,40,0.6)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '12px',
            marginBottom: '16px',
            overflow: 'hidden',
          }}>
            <button
              onClick={() => setMethodOpen(o => !o)}
              style={{
                width: '100%', padding: '14px 20px',
                background: 'none', border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <BookOpen size={14} color="#5D7A9A" />
                <span style={{ fontSize: '12px', color: '#7A9ABE', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  How to Use This Script
                </span>
              </div>
              {methodOpen ? <ChevronUp size={14} color="#3D5070" /> : <ChevronDown size={14} color="#3D5070" />}
            </button>

            <AnimatePresence>
              {methodOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.28 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {METHOD_STEPS.map(step => (
                      <div key={step.n} style={{ display: 'flex', gap: '14px' }}>
                        <span style={{ fontSize: '10px', color: '#3D5070', fontWeight: 500, minWidth: '22px', paddingTop: '3px' }}>
                          {step.n}
                        </span>
                        <div>
                          <p style={{ fontSize: '13px', color: '#C8D4F0', marginBottom: '3px' }}>{step.title}</p>
                          <p style={{ fontSize: '12px', color: '#6A7A9A', lineHeight: 1.6 }}>{step.body}</p>
                        </div>
                      </div>
                    ))}
                    <p style={{ fontSize: '11px', color: '#2E3D5A', marginTop: '4px', fontStyle: 'italic' }}>
                      Based on Dr. Joseph Murphy — The Power of Your Subconscious Mind
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={onGoToScripts}
              style={{
                flex: 1, padding: '13px',
                background: 'rgba(108,99,255,0.15)',
                border: '1px solid rgba(108,99,255,0.2)',
                borderRadius: '10px',
                color: '#9A94F0', fontSize: '12px',
                letterSpacing: '0.07em', textTransform: 'uppercase',
                cursor: 'pointer', fontFamily: 'inherit',
                transition: 'background 0.2s',
              }}
            >
              View in Scripts →
            </button>
            <button
              onClick={handleReset}
              style={{
                padding: '13px 18px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '10px',
                color: '#6A7A9A', fontSize: '12px',
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              New
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  // ── IDLE STATE ────────────────────────────────────────────────────
  return (
    <div className="home-center">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: '100%', maxWidth: '620px' }}
      >
        {/* Greeting */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <p style={{ fontSize: '11px', color: '#2E3D5A', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: '10px' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h1 className="font-display" style={{ fontSize: '38px', color: '#D8E4F8', fontWeight: 300, lineHeight: 1.2 }}>
            {greeting}, {firstName}.
          </h1>
        </div>

        {/* Input box */}
        <form onSubmit={handleGenerate}>
          <div style={{
            background: 'rgba(8,18,34,0.75)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '14px',
            padding: '16px 16px 12px',
          }}>
            {/* Custom animated placeholder — shown only when textarea is empty */}
            <div style={{ position: 'relative' }}>
              <AnimatePresence mode="wait">
                {!goal && (
                  <motion.p
                    key={placeholderIdx}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.9, ease: 'easeInOut' }}
                    style={{
                      position: 'absolute',
                      top: 0, left: 0, right: '44px',
                      pointerEvents: 'none',
                      margin: 0,
                      fontSize: '16px',
                      lineHeight: 1.65,
                      color: '#2C3D5C',
                      fontFamily: "'Cormorant Garamond', Georgia, serif",
                      fontStyle: 'italic',
                      fontWeight: 300,
                    }}
                  >
                    {PLACEHOLDERS[placeholderIdx]}
                  </motion.p>
                )}
              </AnimatePresence>

              <textarea
                ref={textareaRef}
                value={goal}
                onChange={e => setGoal(e.target.value)}
                placeholder=""
                rows={1}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none', outline: 'none',
                  color: '#C8D4F0',
                  fontSize: '15px',
                  lineHeight: 1.65,
                  resize: 'none',
                  fontFamily: 'inherit',
                  minHeight: '28px',
                  maxHeight: '180px',
                  overflowY: 'auto',
                  display: 'block',
                  position: 'relative',
                  zIndex: 1,
                }}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleGenerate()
                }
              }}
            />
            </div>{/* end relative wrapper */}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
              <span style={{ fontSize: '11px', color: '#1E2D46', letterSpacing: '0.06em' }}>
                Press Enter to generate · Shift+Enter for new line
              </span>
              <motion.button
                type="submit"
                disabled={!goal.trim()}
                whileTap={{ scale: 0.94 }}
                style={{
                  width: '34px', height: '34px', borderRadius: '8px',
                  background: goal.trim() ? 'rgba(108,99,255,0.3)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${goal.trim() ? 'rgba(108,99,255,0.4)' : 'rgba(255,255,255,0.06)'}`,
                  cursor: goal.trim() ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: goal.trim() ? '#8B83FF' : '#2E3D5A',
                  transition: 'all 0.2s',
                  flexShrink: 0,
                }}
              >
                <ArrowUp size={15} />
              </motion.button>
            </div>
          </div>

          {error && (
            <p style={{ fontSize: '12px', color: '#CC6666', textAlign: 'center', marginTop: '12px' }}>{error}</p>
          )}

          <p style={{ fontSize: '11px', color: '#1E2D46', textAlign: 'center', marginTop: '14px', letterSpacing: '0.06em' }}>
            Powered by the principles of Murphy, Hill &amp; Byrne
          </p>
        </form>
      </motion.div>
    </div>
  )
}
