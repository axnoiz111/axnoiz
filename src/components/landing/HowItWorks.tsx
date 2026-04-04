import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const steps = [
  {
    num: '01',
    title: 'Declare',
    body: 'Write what you want. In the present tense. With certainty. Your subconscious responds to declared truth, not tentative wishes.',
  },
  {
    num: '02',
    title: 'Listen',
    body: 'Your personalized audio session — built from your exact goal — is ready each day. Five minutes. Immersive. Calibrated to reach you.',
  },
  {
    num: '03',
    title: 'Return',
    body: 'Show up daily. Every session is one more impression. The mind changes through repetition — not intensity.',
  },
]

function Step({ step, index }: { step: typeof steps[number]; index: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 1, delay: index * 0.18, ease: 'easeOut' }}
      style={{
        display: 'grid',
        gridTemplateColumns: '56px 1fr',
        gap: '24px',
        padding: '40px 0',
        borderTop: '1px solid var(--border)',
        alignItems: 'start',
      }}
    >
      {/* Number */}
      <span style={{
        fontFamily: 'Cormorant Garamond, serif',
        fontWeight: 300,
        fontSize: '13px',
        letterSpacing: '0.12em',
        color: 'var(--text-muted)',
        paddingTop: '5px',
      }}>
        {step.num}
      </span>

      {/* Content */}
      <div>
        <h3 style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontWeight: 300,
          fontSize: 'clamp(28px, 4vw, 40px)',
          color: 'var(--text-bright)',
          marginBottom: '16px',
          letterSpacing: '-0.01em',
          lineHeight: 1.1,
        }}>
          {step.title}
        </h3>
        <p style={{
          fontSize: '15px',
          color: 'var(--text-muted)',
          fontWeight: 300,
          lineHeight: 1.85,
          maxWidth: '440px',
        }}>
          {step.body}
        </p>
      </div>
    </motion.div>
  )
}

export default function HowItWorks() {
  return (
    <section className="section" id="how-it-works">
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>

        {/* Heading */}
        <div style={{ marginBottom: '16px' }}>
          <motion.p
            className="eyebrow"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 1 }}
            style={{ marginBottom: '0' }}
          >
            The practice
          </motion.p>
        </div>

        {/* Steps */}
        {steps.map((step, i) => (
          <Step key={step.num} step={step} index={i} />
        ))}

        {/* Closing line */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 1, delay: 0.4 }}
          style={{
            fontSize: '13px',
            color: 'var(--text-muted)',
            fontStyle: 'italic',
            fontFamily: 'Cormorant Garamond, serif',
            marginTop: '40px',
            letterSpacing: '0.02em',
          }}
        >
          Five minutes. Every day. The rest follows.
        </motion.p>

      </div>
    </section>
  )
}
