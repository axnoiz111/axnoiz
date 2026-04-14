import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ChevronDown, ChevronUp, BookOpen } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

// ── Constants ─────────────────────────────────────────────────────────────────

const PLACEHOLDERS = [
  'I am the owner of a thriving business that gives my family complete freedom...',
  'I am earning more than enough, doing work that lights me up every day...',
  'I am healthy, strong, and full of energy — my body is my greatest asset...',
  'I am deeply loved, and I give love freely and abundantly...',
  'I am living in my dream home, exactly where I always knew I belonged...',
  'I am free — free to choose, to create, to live exactly as I imagined...',
]

const LOADING_MESSAGES = [
  'Reading your desire...',
  'Consulting the principles...',
  'Crafting your script...',
  'Weaving in Murphy, Hill & Byrne...',
  'Almost ready...',
]

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]


// ── Sub-components ────────────────────────────────────────────────────────────

const METHOD_STEPS = [
  { n: '01', title: 'Find silence', body: 'Morning or evening — 2 minutes of stillness. Let the outer world fade.' },
  { n: '02', title: 'Read aloud with feeling', body: 'Your subconscious responds to conviction, not repetition. Speak each word as if it is already real.' },
  { n: '03', title: 'Visualise as you read', body: 'See yourself already living what you are declaring. Feel the emotion — joy, gratitude, certainty.' },
  { n: '04', title: 'Repeat daily for 21+ days', body: 'The subconscious accepts what is repeated with emotion. Consistency builds belief.' },
  { n: '05', title: 'Act as if it is done', body: 'Between readings, carry the feeling. Your actions align with your belief — and belief becomes reality.' },
]

function StepDots({ current }: { current: number }) {
  return (
    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '32px' }}>
      {[1, 2, 3].map(n => (
        <motion.div
          key={n}
          animate={{
            background: n <= current ? '#6C63FF' : 'transparent',
            borderColor: n <= current ? '#6C63FF' : 'rgba(108,99,255,0.3)',
          }}
          transition={{ duration: 0.3 }}
          style={{
            width: '8px', height: '8px', borderRadius: '50%',
            border: '1px solid',
          }}
        />
      ))}
    </div>
  )
}

function BackLink({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: 'none', border: 'none',
        color: '#4A5A7A', fontSize: '12px',
        cursor: 'pointer', fontFamily: 'inherit',
        padding: '0', marginBottom: '28px',
        display: 'flex', alignItems: 'center', gap: '6px',
        letterSpacing: '0.04em',
      }}
    >
      ← Back
    </button>
  )
}

function SkipLink({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: 'none', border: 'none',
        color: '#4A5A7A', fontSize: '11px',
        cursor: 'pointer', fontFamily: 'inherit',
        padding: '0', marginTop: '10px',
        letterSpacing: '0.04em', fontStyle: 'italic',
        display: 'block', width: '100%', textAlign: 'center',
      }}
    >
      {label}
    </button>
  )
}

// ── Types ─────────────────────────────────────────────────────────────────────

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

// ── Main Component ────────────────────────────────────────────────────────────

export default function HomeTab({ profileName, userEmail, scriptCount, onScriptGenerated, onGoToScripts }: Props) {
  const { user } = useAuth()

  // Wizard state
  const [step, setStep]                   = useState<1|2|3>(1)
  const [desire, setDesire]               = useState('')
  const [deadlineMonth, setDeadlineMonth] = useState('')
  const [deadlineYear, setDeadlineYear]   = useState('')
  const [currentReality, setCurrentReality] = useState('')

  // Popup (Step 1 — "Why present tense?")
  const [showPopup, setShowPopup]   = useState(false)
  const [popupDone, setPopupDone]   = useState(false)
  const popupTimer                  = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Generation state
  const [phase, setPhase]               = useState<'idle' | 'generating' | 'result'>('idle')
  const [generatedScript, setGeneratedScript] = useState<Script | null>(null)
  const [error, setError]               = useState('')
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0)
  const [methodOpen, setMethodOpen]     = useState(false)
  const [savedToast, setSavedToast]     = useState(false)
  const [placeholderIdx, setPlaceholderIdx] = useState(0)

  // Textarea refs
  const desireRef  = useRef<HTMLTextAreaElement>(null)
  const realityRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textareas
  const autoResize = (el: HTMLTextAreaElement | null) => {
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 180) + 'px'
  }

  useEffect(() => { autoResize(desireRef.current) }, [desire])
  useEffect(() => { autoResize(realityRef.current) }, [currentReality])

  // Placeholder cycling (idle only)
  useEffect(() => {
    if (phase !== 'idle' || step !== 1) return
    const iv = setInterval(() => setPlaceholderIdx(i => (i + 1) % PLACEHOLDERS.length), 6000)
    return () => clearInterval(iv)
  }, [phase, step])

  // Loading message cycling
  useEffect(() => {
    if (phase !== 'generating') return
    const iv = setInterval(() => setLoadingMsgIdx(i => (i + 1) % LOADING_MESSAGES.length), 2200)
    return () => clearInterval(iv)
  }, [phase])

  // Year options for deadline picker
  const currentYear = new Date().getFullYear()
  const yearOptions = Array.from({ length: 7 }, (_, i) => String(currentYear + i))

  const firstName = profileName?.trim().split(' ')[0] || userEmail.split('@')[0]
  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  })()

  // ── Popup handlers ──────────────────────────────────────────────────────────
  const handleDesireFocus = () => {
    if (popupDone) return
    popupTimer.current = setTimeout(() => setShowPopup(true), 3000)
  }
  const handleDesireBlur = () => {
    if (popupTimer.current) clearTimeout(popupTimer.current)
  }
  const dismissPopup = () => {
    setShowPopup(false)
    setPopupDone(true)
  }

  // ── Navigation ──────────────────────────────────────────────────────────────
  const goNext = () => {
    if (step < 3) setStep(s => (s + 1) as 1|2|3)
    else handleGenerate()
  }
  const goBack = () => {
    if (step > 1) setStep(s => (s - 1) as 1|2|3)
  }

  // ── Generate ────────────────────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!desire.trim() || !user) return
    if (scriptCount >= 10) {
      setError('You have 10 scripts saved. Delete one from the Scripts tab to generate a new one.')
      return
    }
    setError('')
    setPhase('generating')
    setLoadingMsgIdx(0)

    try {
      const { data, error: fnErr } = await supabase.functions.invoke('generate-script', {
        body: {
          desire: desire.trim(),
          deadline_month:   deadlineMonth   || undefined,
          deadline_year:    deadlineYear    || undefined,
          current_situation: currentReality || undefined,
        },
      })
      if (fnErr) {
        let msg = fnErr.message ?? 'Something went wrong. Please try again.'
        try {
          const body = await (fnErr as { context?: { json?: () => Promise<{ error?: string }> } }).context?.json?.()
          if (body?.error) msg = body.error
        } catch { /* ignore parse failure */ }
        throw new Error(msg)
      }
      if (data?.error) throw new Error(data.error)

      setGeneratedScript(data)
      onScriptGenerated(data)
      setPhase('result')
      setSavedToast(true)
      setTimeout(() => setSavedToast(false), 3000)
    } catch (err: unknown) {
      setPhase('idle')
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      setError(msg)
    }
  }

  const handleReset = () => {
    setStep(1)
    setDesire(''); setDeadlineMonth(''); setDeadlineYear('')
    setCurrentReality('')
    setGeneratedScript(null)
    setPhase('idle'); setMethodOpen(false); setError('')
    setShowPopup(false)
  }

  // ── GENERATING STATE ──────────────────────────────────────────────────────
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

  // ── RESULT STATE ────────────────────────────────────────────────────────────
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
            borderRadius: '14px', padding: '28px 24px', marginBottom: '12px',
          }}>
            <p style={{ fontSize: '10px', color: '#7585C0', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: '10px' }}>
              Your Script
            </p>
            <h2 className="font-display" style={{ fontSize: '24px', color: '#E8EDF8', fontWeight: 300, marginBottom: '20px' }}>
              {generatedScript.title}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {generatedScript.content
                .split(/(?<=[.!?])\s+/)
                .filter(s => s.trim())
                .map((sentence, i) => (
                  <p key={i} style={{
                    fontSize: '15px', color: '#B8C8E8',
                    lineHeight: 1.85, margin: 0,
                    fontFamily: 'Georgia, serif',
                    borderLeft: '2px solid rgba(108,99,255,0.2)',
                    paddingLeft: '14px',
                  }}>
                    {sentence.trim()}
                  </p>
                ))
              }
            </div>
          </div>

          {/* Method card */}
          <div style={{
            background: 'rgba(10,22,40,0.6)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '12px', marginBottom: '16px', overflow: 'hidden',
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
                <BookOpen size={14} color="#7DA0BA" />
                <span style={{ fontSize: '12px', color: '#9ABCE0', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  How to Use This Script
                </span>
              </div>
              {methodOpen ? <ChevronUp size={14} color="#5D7090" /> : <ChevronDown size={14} color="#5D7090" />}
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
                        <span style={{ fontSize: '10px', color: '#5D7090', fontWeight: 500, minWidth: '22px', paddingTop: '3px' }}>
                          {step.n}
                        </span>
                        <div>
                          <p style={{ fontSize: '13px', color: '#D8E4F8', marginBottom: '3px' }}>{step.title}</p>
                          <p style={{ fontSize: '12px', color: '#8AA0BA', lineHeight: 1.6 }}>{step.body}</p>
                        </div>
                      </div>
                    ))}
                    <p style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px', fontStyle: 'italic' }}>
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
                borderRadius: '10px', color: '#9A94F0',
                fontSize: '12px', letterSpacing: '0.07em', textTransform: 'uppercase',
                cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.2s',
              }}
            >
              View in Scripts →
            </button>
            <button
              onClick={handleReset}
              style={{
                padding: '13px 18px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px', color: 'var(--text-muted)',
                fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              New
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  // ── IDLE STATE — 4-step wizard ─────────────────────────────────────────────
  return (
    <div className="home-center">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: '100%', maxWidth: '560px' }}
      >
        {/* Greeting */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: '10px' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h1 className="font-display" style={{ fontSize: '36px', color: '#D8E4F8', fontWeight: 300, lineHeight: 1.2 }}>
            {greeting}, {firstName}.
          </h1>
        </div>

        {/* Step dots */}
        <StepDots current={step} />

        {/* Step content */}
        <AnimatePresence mode="wait">
          {/* ── STEP 1: DESIRE ─────────────────────────────────────────────── */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="font-display" style={{ fontSize: '28px', color: '#E8EDF8', fontWeight: 300, textAlign: 'center', marginBottom: '10px' }}>
                What do you desire?
              </h2>
              <p style={{ fontSize: '13px', color: '#5A6A8A', textAlign: 'center', lineHeight: 1.7, marginBottom: '28px' }}>
                Describe it as if it's already yours — the clearer the picture, the more powerful your session.
              </p>

              {/* Textarea with animated placeholder */}
              <div style={{
                background: 'rgba(8,18,34,0.75)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '14px', padding: '16px 16px 12px',
                marginBottom: '16px', position: 'relative',
              }}>
                {/* Popup */}
                <AnimatePresence>
                  {showPopup && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ duration: 0.25 }}
                      style={{
                        position: 'absolute',
                        bottom: 'calc(100% + 10px)', left: 0, right: 0,
                        background: '#0A1628',
                        border: '1px solid rgba(108,99,255,0.2)',
                        borderRadius: '12px', padding: '16px 18px',
                        zIndex: 20,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                      }}
                    >
                      <p style={{ fontSize: '12px', color: '#9ABCE0', marginBottom: '8px', fontWeight: 500 }}>
                        💡 A small tip
                      </p>
                      <p style={{ fontSize: '12px', color: '#6A7A9A', lineHeight: 1.75 }}>
                        Try starting with "I am" or "I have" — as if it's already yours. Not "I want a Mercedes," but "I drive my Mercedes every day." Your mind responds better to ownership than wishing.
                      </p>
                      <button
                        onClick={dismissPopup}
                        style={{
                          marginTop: '12px',
                          background: 'rgba(108,99,255,0.15)',
                          border: '1px solid rgba(108,99,255,0.25)',
                          borderRadius: '6px', padding: '6px 16px',
                          color: '#9A94F0', fontSize: '11px',
                          cursor: 'pointer', fontFamily: 'inherit',
                          letterSpacing: '0.06em',
                        }}
                      >
                        Got it
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Animated placeholder overlay */}
                <div style={{ position: 'relative' }}>
                  <AnimatePresence mode="wait">
                    {!desire && (
                      <motion.p
                        key={placeholderIdx}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.9, ease: 'easeInOut' }}
                        style={{
                          position: 'absolute', top: 0, left: 0, right: 0,
                          pointerEvents: 'none', margin: 0,
                          fontSize: '15px', lineHeight: 1.65,
                          color: '#2C3D5C',
                          fontFamily: "'Cormorant Garamond', Georgia, serif",
                          fontStyle: 'italic', fontWeight: 300,
                        }}
                      >
                        {PLACEHOLDERS[placeholderIdx]}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  <textarea
                    ref={desireRef}
                    value={desire}
                    onChange={e => setDesire(e.target.value)}
                    onFocus={handleDesireFocus}
                    onBlur={handleDesireBlur}
                    placeholder=""
                    rows={1}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey && desire.trim()) {
                        e.preventDefault()
                        goNext()
                      }
                    }}
                    style={{
                      width: '100%', background: 'transparent',
                      border: 'none', outline: 'none',
                      color: 'var(--text-bright)', fontSize: '15px',
                      lineHeight: 1.65, resize: 'none',
                      fontFamily: 'inherit', minHeight: '28px',
                      maxHeight: '180px', overflowY: 'auto',
                      display: 'block', position: 'relative', zIndex: 1,
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-dim)', letterSpacing: '0.05em' }}>
                    Shift+Enter for new line
                  </span>
                  <motion.button
                    type="button"
                    disabled={!desire.trim()}
                    onClick={goNext}
                    whileTap={{ scale: 0.94 }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      padding: '8px 16px', borderRadius: '8px',
                      background: desire.trim() ? 'rgba(108,99,255,0.25)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${desire.trim() ? 'rgba(108,99,255,0.4)' : 'rgba(255,255,255,0.06)'}`,
                      cursor: desire.trim() ? 'pointer' : 'not-allowed',
                      color: desire.trim() ? '#9A94F0' : 'var(--text-dim)',
                      fontSize: '12px', letterSpacing: '0.08em',
                      fontFamily: 'inherit', transition: 'all 0.2s',
                    }}
                  >
                    Next <ArrowRight size={13} />
                  </motion.button>
                </div>
              </div>

              {error && (
                <p style={{ fontSize: '12px', color: '#CC6666', textAlign: 'center', marginTop: '8px' }}>{error}</p>
              )}

              <div style={{ fontSize: '10px', color: 'var(--text-dim)', textAlign: 'center', marginTop: '24px', letterSpacing: '0.08em', lineHeight: 1.8 }}>
                <p style={{ marginBottom: '4px', fontSize: '11px' }}>Powered by the principles of...</p>
                <p>The Power Of Your Subconscious Mind — Dr. Joseph Murphy</p>
                <p>Think And Grow Rich — Napoleon Hill</p>
                <p>The Secret — Rhonda Byrne</p>
              </div>
            </motion.div>
          )}

          {/* ── STEP 2: DEADLINE ───────────────────────────────────────────── */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <BackLink onClick={goBack} />

              <h2 className="font-display" style={{ fontSize: '28px', color: '#E8EDF8', fontWeight: 300, textAlign: 'center', marginBottom: '12px' }}>
                Is there a date that matters to you?
              </h2>
              <p style={{
                fontSize: '13px', color: '#6A7A9A', textAlign: 'center',
                lineHeight: 1.8, marginBottom: '32px', fontStyle: 'italic',
                maxWidth: '380px', margin: '0 auto 32px',
              }}>
                A deadline transforms a wish into a decision.
              </p>

              <div style={{ display: 'flex', gap: '12px', marginBottom: '8px' }}>
                <select
                  value={deadlineMonth}
                  onChange={e => setDeadlineMonth(e.target.value)}
                  style={selectStyle}
                >
                  <option value="">Month</option>
                  {MONTHS.map((m, i) => (
                    <option key={m} value={String(i + 1).padStart(2, '0')}>{m}</option>
                  ))}
                </select>
                <select
                  value={deadlineYear}
                  onChange={e => setDeadlineYear(e.target.value)}
                  style={selectStyle}
                >
                  <option value="">Year</option>
                  {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>

              <motion.button
                type="button"
                onClick={goNext}
                whileTap={{ scale: 0.97 }}
                style={nextBtnStyle}
              >
                Next <ArrowRight size={14} />
              </motion.button>

              <SkipLink label="Skip — I will focus on progress, not a deadline" onClick={goNext} />
            </motion.div>
          )}

          {/* ── STEP 3: CURRENT REALITY ────────────────────────────────────── */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <BackLink onClick={goBack} />

              <h2 className="font-display" style={{ fontSize: '28px', color: '#E8EDF8', fontWeight: 300, textAlign: 'center', marginBottom: '10px' }}>
                What's your current situation?
              </h2>
              <p style={{ fontSize: '13px', color: '#5A6A8A', textAlign: 'center', lineHeight: 1.7, marginBottom: '28px' }}>
                Just a brief snapshot of where you are today — a few words is enough.
              </p>

              <div style={{
                background: 'rgba(8,18,34,0.75)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '14px', padding: '16px', marginBottom: '12px',
                position: 'relative',
              }}>
                <textarea
                  ref={realityRef}
                  value={currentReality}
                  onChange={e => setCurrentReality(e.target.value)}
                  placeholder="e.g. Currently working a job I don't feel called to, some savings, no clear path yet..."
                  rows={3}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      goNext()
                    }
                  }}
                  style={{
                    width: '100%', background: 'transparent',
                    border: 'none', outline: 'none',
                    color: 'var(--text-bright)', fontSize: '15px',
                    lineHeight: 1.65, resize: 'none',
                    fontFamily: 'inherit',
                    minHeight: '80px', maxHeight: '180px',
                  }}
                />
              </div>

              {error && (
                <p style={{ fontSize: '12px', color: '#CC6666', textAlign: 'center', marginBottom: '12px' }}>{error}</p>
              )}

              <motion.button
                type="button"
                onClick={handleGenerate}
                whileTap={{ scale: 0.97 }}
                animate={{ boxShadow: ['0 0 20px rgba(108,99,255,0.3)', '0 0 36px rgba(108,99,255,0.5)', '0 0 20px rgba(108,99,255,0.3)'] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  width: '100%', padding: '16px',
                  background: 'linear-gradient(135deg, #6C63FF, #8B83FF)',
                  border: 'none', borderRadius: '10px',
                  color: '#fff', fontSize: '13px',
                  fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                  cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                Create My Reality <ArrowRight size={15} />
              </motion.button>

              <p style={{ fontSize: '11px', color: '#4A5A7A', textAlign: 'center', marginTop: '10px', fontStyle: 'italic' }}>
                Your personalized session is being built now.
              </p>

              <SkipLink label="Skip — I prefer to focus on where I am going" onClick={handleGenerate} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

// ── Shared styles ─────────────────────────────────────────────────────────────

const selectStyle: React.CSSProperties = {
  flex: 1,
  background: 'rgba(8,18,34,0.75)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '10px',
  padding: '13px 14px',
  color: '#C8D4F0',
  fontSize: '14px',
  fontFamily: 'inherit',
  outline: 'none',
  cursor: 'pointer',
  appearance: 'none',
  WebkitAppearance: 'none',
}

const nextBtnStyle: React.CSSProperties = {
  width: '100%', padding: '14px',
  background: 'rgba(108,99,255,0.18)',
  border: '1px solid rgba(108,99,255,0.3)',
  borderRadius: '10px',
  color: '#9A94F0', fontSize: '13px',
  fontWeight: 500, letterSpacing: '0.1em',
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
  cursor: 'pointer', fontFamily: 'inherit',
  marginBottom: '4px',
}
