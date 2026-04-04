import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { ArrowRight, Check } from 'lucide-react'

const included = [
  'Personalized affirmation script — daily',
  'AI-generated audio session (your words, your voice)',
  'Mood + action tracking',
  'Streak system with identity framing',
  'Weekly AI progress summary',
  'Grounded in Murphy, Hill & Byrne',
]

export default function FinalCTA() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} id="final-cta" className="relative py-28 px-6">
      {/* Strong ambient glow for the closing section */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, rgba(108,99,255,0.1) 0%, transparent 65%)',
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 80%, rgba(0,212,255,0.05) 0%, transparent 55%)',
        }}
      />

      <div className="max-w-2xl mx-auto relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="flex flex-col items-center gap-8"
        >
          {/* Pre-headline */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold tracking-widest uppercase"
            style={{
              background: 'rgba(108,99,255,0.1)',
              border: '1px solid rgba(108,99,255,0.25)',
              color: 'var(--accent-cyan)',
            }}
          >
            ✦ Your practice starts today
          </div>

          {/* Headline */}
          <h2
            className="font-playfair font-bold"
            style={{ fontSize: 'clamp(32px, 6vw, 54px)', color: 'var(--text-primary)', lineHeight: 1.15 }}
          >
            Your inner voice
            <br />
            <span className="gradient-text text-glow">
              is already speaking.
            </span>
            <br />
            Direct it.
          </h2>

          {/* Body */}
          <p className="max-w-lg leading-relaxed"
            style={{ fontSize: 'clamp(15px, 2vw, 18px)', color: 'var(--text-muted)' }}>
            2 minutes to set up your goal.
            5 minutes a day to reprogram your subconscious.
            That is the entire commitment.
          </p>

          {/* Included list */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="card p-6 text-left w-full"
            style={{ borderColor: 'rgba(108,99,255,0.2)' }}
          >
            <p className="text-xs font-semibold tracking-widest uppercase mb-4"
              style={{ color: 'var(--text-dim)' }}>
              What's included — free
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              {included.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.4 + i * 0.07, duration: 0.4 }}
                  className="flex items-start gap-2 text-sm"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <Check
                    size={15}
                    className="mt-0.5 flex-shrink-0"
                    style={{ color: 'var(--accent-cyan)' }}
                  />
                  {item}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex flex-col items-center gap-3 w-full"
          >
            <button
              className="btn-primary animate-pulse-ring flex items-center gap-2 w-full sm:w-auto justify-center"
              style={{ padding: '18px 48px', fontSize: '17px' }}
            >
              Create My Reality
              <ArrowRight size={20} />
            </button>
            <p className="text-xs" style={{ color: 'var(--text-dim)' }}>
              Free to begin. No credit card. 2-minute setup.
            </p>
          </motion.div>

          {/* Trust row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="flex flex-wrap justify-center gap-6 pt-4"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)', width: '100%' }}
          >
            {[
              { label: 'Grounded in science', icon: '🧠' },
              { label: 'Your data stays private', icon: '🔒' },
              { label: '5 min daily commitment', icon: '⏱' },
              { label: 'Cancel anytime', icon: '✓' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-xs"
                style={{ color: 'var(--text-dim)' }}>
                <span>{item.icon}</span>
                {item.label}
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
