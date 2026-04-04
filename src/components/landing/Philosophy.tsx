import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const quotes = [
  {
    text: 'Whatever you impress on your subconscious mind, you will experience as the conditions, circumstances, and events of your life.',
    author: 'Dr. Joseph Murphy',
    work: 'The Power of Your Subconscious Mind',
  },
  {
    text: 'Whatever the mind can conceive and believe, it can achieve.',
    author: 'Napoleon Hill',
    work: 'Think and Grow Rich',
  },
  {
    text: 'Your feelings are your signal. The universe responds to frequency, not words.',
    author: 'Rhonda Byrne',
    work: 'The Secret',
  },
]

function Quote({ q, index }: { q: typeof quotes[number]; index: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 1.1, delay: index * 0.2, ease: 'easeOut' }}
      style={{
        padding: '48px 0',
        borderTop: '1px solid var(--border)',
      }}
    >
      <p style={{
        fontFamily: 'Cormorant Garamond, serif',
        fontStyle: 'italic',
        fontWeight: 300,
        fontSize: 'clamp(18px, 3vw, 26px)',
        color: 'var(--text)',
        lineHeight: 1.6,
        marginBottom: '24px',
        maxWidth: '560px',
      }}>
        "{q.text}"
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
          — {q.author}
        </span>
        <span style={{ fontSize: '11px', color: 'var(--text-dim)', letterSpacing: '0.04em', fontStyle: 'italic' }}>
          {q.work}
        </span>
      </div>
    </motion.div>
  )
}

export default function Philosophy() {
  return (
    <section className="section" id="foundation">
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>

        <motion.p
          className="eyebrow"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 1 }}
          style={{ marginBottom: '8px' }}
        >
          The foundation
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
            letterSpacing: '0.04em',
          }}
        >
          Three books. One truth. Built into every session.
        </motion.p>

        {quotes.map((q, i) => (
          <Quote key={i} q={q} index={i} />
        ))}

      </div>
    </section>
  )
}
