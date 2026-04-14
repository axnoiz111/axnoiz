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
      {/* Radial nebula glow */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '60vw', height: '60vw',
        maxWidth: '600px', maxHeight: '600px',
        borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(80,70,160,0.06) 0%, rgba(40,30,100,0.03) 45%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '560px' }}>

        {/* Eyebrow */}
        <motion.p
          className="eyebrow"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.6, delay: 0.2 }}
          style={{ marginBottom: '48px', letterSpacing: '0.3em', fontSize: '10px' }}
        >
          A daily practice for the mind
        </motion.p>

        {/* Headline group */}
        <div style={{ marginBottom: '20px' }}>
          <motion.h1
            className="font-display"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.4, delay: 0.5, ease: 'easeOut' }}
            style={{
              fontSize: 'clamp(32px, 5vw, 52px)',
              color: 'var(--text-bright)',
              fontWeight: 400,
              lineHeight: 1.25,
              marginBottom: '4px',
            }}
          >
            Access your <em className="font-display-italic" style={{ fontStyle: 'normal' }}>inner voice.</em>
          </motion.h1>

          <motion.h1
            className="font-display"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.4, delay: 0.8, ease: 'easeOut' }}
            style={{
              fontSize: 'clamp(32px, 5vw, 52px)',
              color: 'var(--text)',
              fontWeight: 400,
              lineHeight: 1.25,
            }}
          >
            Remove the noise.
          </motion.h1>
        </div>

        {/* Thin divider */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 1.2, delay: 1.1 }}
          style={{
            width: '40px',
            height: '1px',
            background: 'rgba(255,255,255,0.12)',
            margin: '28px auto',
          }}
        />

        {/* Subline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.4, delay: 1.3 }}
          style={{
            fontSize: 'clamp(13px, 1.6vw, 15px)',
            color: 'var(--text-dim)',
            fontWeight: 300,
            letterSpacing: '0.06em',
            lineHeight: 1.9,
            marginBottom: '56px',
          }}
        >
          What remains is your new reality.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.6 }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}
        >
          <button
            className="btn"
            id="begin"
            onClick={() => document.getElementById('what')?.scrollIntoView({ behavior: 'smooth' })}
            style={{ padding: '14px 44px', fontSize: '11px', letterSpacing: '0.2em' }}
          >
            Begin
          </button>
          <span className="eyebrow" style={{ letterSpacing: '0.12em', opacity: 0.4, fontSize: '10px' }}>
            Free · 5 minutes a day
          </span>
        </motion.div>
      </div>
    </section>
  )
}
