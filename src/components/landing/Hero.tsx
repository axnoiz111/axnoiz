import { motion } from 'framer-motion'

export default function Hero() {
  return (
    <section
      style={{
        minHeight: '100svh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '0 24px',
        position: 'relative',
      }}
    >
      {/* Radial nebula — very subtle */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '70vw', height: '70vw',
        maxWidth: '700px', maxHeight: '700px',
        borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(80,70,160,0.07) 0%, rgba(40,30,100,0.04) 40%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '680px' }}>

        {/* Eyebrow */}
        <motion.p
          className="eyebrow"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.4, delay: 0.3 }}
          style={{ marginBottom: '40px', letterSpacing: '0.25em' }}
        >
          A daily practice for the mind
        </motion.p>

        {/* Main headline */}
        <motion.h1
          className="font-display"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.6, ease: 'easeOut' }}
          style={{
            fontSize: 'clamp(54px, 10vw, 104px)',
            color: 'var(--text-bright)',
            marginBottom: '8px',
          }}
        >
          Access your
        </motion.h1>

        <motion.h1
          className="font-display-italic"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.85, ease: 'easeOut' }}
          style={{
            fontSize: 'clamp(54px, 10vw, 104px)',
            color: 'var(--text)',
            marginBottom: '48px',
          }}
        >
          inner voice.
        </motion.h1>

        {/* Subline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 1.2 }}
          style={{
            fontSize: 'clamp(15px, 2vw, 18px)',
            color: 'var(--text-muted)',
            fontWeight: 300,
            letterSpacing: '0.02em',
            lineHeight: 1.8,
            marginBottom: '64px',
          }}
        >
          Remove the noise. What remains is your truth.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}
        >
          <button
            className="btn"
            id="begin"
            onClick={() => document.getElementById('what')?.scrollIntoView({ behavior: 'smooth' })}
            style={{ padding: '16px 48px', fontSize: '12px', letterSpacing: '0.18em' }}
          >
            Begin
          </button>
          <span className="eyebrow" style={{ letterSpacing: '0.1em', opacity: 0.5 }}>
            Free · 5 minutes a day
          </span>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 1 }}
        style={{
          position: 'absolute',
          bottom: '40px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <div className="divider" style={{ height: '40px' }} />
        <div className="scroll-dot" />
      </motion.div>
    </section>
  )
}
