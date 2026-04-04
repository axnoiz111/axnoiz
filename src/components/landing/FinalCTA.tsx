import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

export default function FinalCTA() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} className="section" id="begin" style={{ textAlign: 'center' }}>

      {/* Nebula behind CTA */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '600px', height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(80,70,160,0.08) 0%, transparent 65%)',
        pointerEvents: 'none',
        filter: 'blur(20px)',
      }} />

      <div style={{ position: 'relative', maxWidth: '520px', margin: '0 auto' }}>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 1 }}
          style={{ marginBottom: '40px' }}
        >
          <div className="divider" style={{ marginBottom: '40px' }} />
        </motion.div>

        <motion.p
          className="eyebrow"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 0.1 }}
          style={{ marginBottom: '32px' }}
        >
          Begin today
        </motion.p>

        <motion.h2
          className="font-display"
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.1, delay: 0.2, ease: 'easeOut' }}
          style={{
            fontSize: 'clamp(36px, 6vw, 64px)',
            color: 'var(--text-bright)',
            marginBottom: '12px',
            lineHeight: 1.1,
          }}
        >
          Your practice starts
        </motion.h2>
        <motion.h2
          className="font-display-italic"
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.1, delay: 0.35, ease: 'easeOut' }}
          style={{
            fontSize: 'clamp(36px, 6vw, 64px)',
            color: 'var(--text-muted)',
            marginBottom: '48px',
            lineHeight: 1.1,
          }}
        >
          with one decision.
        </motion.h2>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 0.55 }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}
        >
          <button
            className="btn"
            style={{ padding: '18px 56px', fontSize: '12px', letterSpacing: '0.2em' }}
          >
            Start Your Manifestation
          </button>
          <p className="eyebrow" style={{ opacity: 0.45, letterSpacing: '0.1em' }}>
            Free · 2 minutes to set up · No card needed
          </p>
        </motion.div>

      </div>
    </section>
  )
}
