import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const voices = [
  {
    quote: `By day 30 my inner dialogue had completely changed. I wasn't even aware it was happening until I read my weekly summary.`,
    name: 'James K.',
    detail: '47-day streak',
  },
  {
    quote: `On day 31 my business deal closed — the one I had been affirming for months. I'm not saying it's magic. I'm saying I showed up differently.`,
    name: 'Sara M.',
    detail: '31-day streak',
  },
  {
    quote: `The script references my goal, my fear. It doesn't feel like an app. It feels like a mentor who knows me.`,
    name: 'Thomas N.',
    detail: '63-day streak',
  },
]

function Voice({ v, index }: { v: typeof voices[number]; index: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 1, delay: index * 0.2, ease: 'easeOut' }}
      style={{
        padding: '40px 0',
        borderTop: '1px solid var(--border)',
      }}
    >
      <p style={{
        fontFamily: 'Cormorant Garamond, serif',
        fontStyle: 'italic',
        fontWeight: 300,
        fontSize: 'clamp(16px, 2.5vw, 22px)',
        color: 'var(--text)',
        lineHeight: 1.65,
        marginBottom: '20px',
      }}>
        &ldquo;{v.quote}&rdquo;
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
          {v.name}
        </span>
        <span style={{ width: '1px', height: '10px', background: 'var(--border)' }} />
        <span style={{ fontSize: '11px', color: 'var(--text-dim)', letterSpacing: '0.04em' }}>
          {v.detail}
        </span>
      </div>
    </motion.div>
  )
}

export default function SocialProof() {
  return (
    <section className="section" id="voices">
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>

        <motion.p
          className="eyebrow"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 1 }}
          style={{ marginBottom: '8px' }}
        >
          From practitioners
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 1, delay: 0.1 }}
          style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontWeight: 300,
            fontSize: 'clamp(13px, 1.8vw, 15px)',
            color: 'var(--text-muted)',
            marginBottom: '8px',
          }}
        >
          Identity shifts before results do.
        </motion.p>

        {voices.map((v, i) => (
          <Voice key={i} v={v} index={i} />
        ))}

      </div>
    </section>
  )
}
