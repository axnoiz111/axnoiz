import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const rows = [
  { left: 'Generic affirmation quotes', right: 'Script built from YOUR goal & blocks' },
  { left: 'No philosophy grounding', right: 'Rooted in Murphy, Hill & Byrne' },
  { left: 'Motivation theater', right: 'Belief reprogramming + action alignment' },
  { left: 'No accountability', right: 'Streak + mood + daily action tracking' },
  { left: 'Static content forever', right: 'AI-generated session unique to today' },
  { left: 'No memory of your progress', right: 'Weekly AI summary of your growth' },
]

// Animated phone mockup showing the app
function PhoneMockup() {
  const lines = [
    'I am becoming the person',
    'who already has this.',
    '',
    'My subconscious works',
    'for me — right now.',
    '',
    'I release every fear.',
    'I step forward in faith.',
  ]

  return (
    <div
      className="relative mx-auto animate-float"
      style={{ width: 'min(280px, 75vw)' }}
    >
      {/* Glow behind phone */}
      <div
        className="absolute inset-0 rounded-[2rem] -z-10"
        style={{
          background: 'radial-gradient(ellipse, rgba(108,99,255,0.3) 0%, transparent 70%)',
          filter: 'blur(30px)',
          transform: 'scale(1.3)',
        }}
      />

      {/* Phone frame */}
      <div
        className="relative rounded-[2.2rem] overflow-hidden"
        style={{
          background: '#080f20',
          border: '1px solid rgba(108,99,255,0.35)',
          boxShadow: '0 0 40px rgba(108,99,255,0.2), 0 30px 60px rgba(0,0,0,0.5)',
          aspectRatio: '9/19',
          padding: '0',
        }}
      >
        {/* Status bar */}
        <div className="flex justify-between items-center px-6 pt-4 pb-2">
          <span className="text-[10px]" style={{ color: 'rgba(240,244,255,0.4)' }}>9:41</span>
          <div
            className="w-16 h-4 rounded-full"
            style={{ background: 'rgba(255,255,255,0.08)' }}
          />
          <span className="text-[10px]" style={{ color: 'rgba(240,244,255,0.4)' }}>●●●</span>
        </div>

        {/* Screen content */}
        <div className="flex-1 flex flex-col items-center px-6 py-4 gap-4">
          {/* Mini star field inside phone */}
          <div className="w-full h-16 rounded-xl relative overflow-hidden flex items-center justify-center"
            style={{ background: '#050A18' }}>
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: `${Math.random() * 2 + 1}px`,
                  height: `${Math.random() * 2 + 1}px`,
                  background: 'white',
                  opacity: Math.random() * 0.6 + 0.2,
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animation: `twinkle ${Math.random() * 3 + 2}s ease-in-out infinite`,
                  animationDelay: `${Math.random() * 2}s`,
                }}
              />
            ))}
            <div className="text-center z-10">
              <div className="text-[9px] tracking-widest uppercase mb-1" style={{ color: 'var(--accent-cyan)' }}>
                Day 12
              </div>
              <div className="flex gap-1 justify-center">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: i <= 4 ? 'rgba(108,99,255,0.6)' : 'rgba(255,255,255,0.08)' }}>
                    <span className="text-[8px]">{i <= 4 ? '✓' : ''}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Script lines */}
          <div className="w-full rounded-xl p-3"
            style={{ background: 'rgba(108,99,255,0.06)', border: '1px solid rgba(108,99,255,0.15)' }}>
            <div className="text-[8px] tracking-widest uppercase mb-2" style={{ color: 'var(--accent-cyan)' }}>
              Your Script
            </div>
            {lines.map((line, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: line ? 0.85 : 0, x: 0 }}
                transition={{ delay: 0.5 + i * 0.25, duration: 0.5 }}
                className="text-[10px] leading-relaxed font-playfair italic"
                style={{ color: 'var(--text-primary)', minHeight: '12px' }}
              >
                {line}
              </motion.div>
            ))}
          </div>

          {/* Mood row */}
          <div className="w-full flex justify-between px-1">
            {['😔','😐','🙂','😊','🔥'].map((e, i) => (
              <div
                key={i}
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm"
                style={{
                  background: i === 4 ? 'rgba(108,99,255,0.3)' : 'rgba(255,255,255,0.05)',
                  border: i === 4 ? '1px solid rgba(108,99,255,0.6)' : '1px solid rgba(255,255,255,0.08)',
                }}
              >
                {e}
              </div>
            ))}
          </div>

          {/* Play button */}
          <div
            className="w-full py-2 rounded-full text-center text-[11px] font-semibold"
            style={{
              background: 'linear-gradient(135deg, #6C63FF, #00D4FF)',
              color: 'white',
              boxShadow: '0 0 20px rgba(108,99,255,0.4)',
            }}
          >
            ▶  Play My Session
          </div>
        </div>
      </div>
    </div>
  )
}

export default function WhatIsAxnoiz() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} className="relative py-24 px-6" id="what-is-axnoiz">
      <div className="max-w-6xl mx-auto">

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <p className="text-xs font-semibold tracking-widest uppercase mb-4"
            style={{ color: 'var(--accent-cyan)' }}>
            What Axnoiz Does
          </p>
          <h2 className="font-playfair font-bold"
            style={{ fontSize: 'clamp(28px, 5vw, 46px)', color: 'var(--text-primary)', lineHeight: 1.2 }}>
            Not affirmations.
            <br />
            <span className="gradient-text">A reprogramming system.</span>
          </h2>
          <p className="mt-5 max-w-xl mx-auto" style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>
            Most apps hand you generic quotes. Axnoiz builds a personalized audio session
            from your goal, your fears, and your current reality — delivered daily,
            grounded in Dr. Joseph Murphy, Napoleon Hill, and Rhonda Byrne.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-center">

          {/* Phone mockup */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex justify-center"
          >
            <PhoneMockup />
          </motion.div>

          {/* Comparison table */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col gap-0"
          >
            <div className="grid grid-cols-2 gap-px mb-3">
              <div className="text-xs font-semibold uppercase tracking-wider px-4 pb-2"
                style={{ color: 'var(--text-dim)' }}>Generic App</div>
              <div className="text-xs font-semibold uppercase tracking-wider px-4 pb-2"
                style={{ color: 'var(--accent-cyan)' }}>AXNOIZ</div>
            </div>
            {rows.map((row, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.4 + i * 0.08, duration: 0.5 }}
                className="grid grid-cols-2 gap-px"
              >
                <div
                  className="px-4 py-3 text-sm rounded-l-lg"
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    color: 'var(--text-dim)',
                    textDecoration: 'line-through',
                    textDecorationColor: 'rgba(255,107,107,0.4)',
                  }}
                >
                  {row.left}
                </div>
                <div
                  className="px-4 py-3 text-sm rounded-r-lg"
                  style={{
                    background: 'rgba(108,99,255,0.06)',
                    borderBottom: '1px solid rgba(108,99,255,0.08)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <span style={{ color: 'var(--accent-cyan)', marginRight: '6px' }}>✓</span>
                  {row.right}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
