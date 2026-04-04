import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const books = [
  {
    author: 'Dr. Joseph Murphy',
    book: 'The Power of Your Subconscious Mind',
    principle: 'Impression',
    color: '#6C63FF',
    icon: '🧠',
    quote: '"Whatever you impress on your subconscious mind, you will experience as conditions, experiences, and events."',
    howAxnoizUses: 'Every Axnoiz script is written in present tense, emotionally charged, to deeply impress your subconscious — not inform it.',
  },
  {
    author: 'Napoleon Hill',
    book: 'Think and Grow Rich',
    principle: 'Autosuggestion',
    color: '#00D4FF',
    icon: '⚡',
    quote: '"Repetition of affirmation of orders to your subconscious mind is the only known method of voluntary development of emotion and faith."',
    howAxnoizUses: 'Your daily streak is autosuggestion in practice. Each session compounds the impression — until belief becomes your default.',
  },
  {
    author: 'Rhonda Byrne',
    book: 'The Secret',
    principle: 'Frequency',
    color: '#FFB347',
    icon: '✨',
    quote: '"The law of attraction is responding to you all the time. It is responding to your thoughts. So that means whatever you think about most, you will attract."',
    howAxnoizUses: 'Mood tracking before and after each session shows your frequency shifting — from fear to clarity, doubt to certainty.',
  },
]

export default function Philosophy() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} id="philosophy" className="relative py-24 px-6">
      {/* Background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, transparent 0%, rgba(108,99,255,0.04) 50%, transparent 100%)',
        }}
      />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-6"
        >
          <p className="text-xs font-semibold tracking-widest uppercase mb-4"
            style={{ color: 'var(--accent-cyan)' }}>
            The Foundation
          </p>
          <h2 className="font-playfair font-bold"
            style={{ fontSize: 'clamp(28px, 5vw, 46px)', color: 'var(--text-primary)', lineHeight: 1.2 }}>
            Timeless principles.
            <br />
            <span className="gradient-text">Delivered daily.</span>
          </h2>
        </motion.div>

        {/* Central quote */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="max-w-2xl mx-auto text-center mb-16 px-4"
        >
          <p className="font-playfair italic leading-relaxed"
            style={{ fontSize: 'clamp(16px, 2.5vw, 20px)', color: 'var(--text-muted)' }}>
            "Your subconscious doesn't know the difference between what is real
            and what is vividly imagined. Feed it the right pictures — daily —
            and your outer world must change."
          </p>
          <p className="mt-3 text-sm font-medium" style={{ color: 'var(--text-dim)' }}>
            The unified teaching across all three books
          </p>
        </motion.div>

        {/* Book cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {books.map((book, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3 + i * 0.15, duration: 0.7 }}
              className="card p-6 flex flex-col gap-4 relative overflow-hidden group"
              style={{ borderColor: `${book.color}25` }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = book.color
                e.currentTarget.style.boxShadow = `0 0 30px ${book.color}20`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = `${book.color}25`
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              {/* BG accent */}
              <div
                className="absolute top-0 right-0 w-32 h-32 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: `radial-gradient(circle, ${book.color}15 0%, transparent 70%)`,
                  filter: 'blur(20px)',
                  transform: 'translate(30%, -30%)',
                }}
              />

              {/* Icon + principle */}
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                  style={{ background: `${book.color}15`, border: `1px solid ${book.color}40` }}
                >
                  {book.icon}
                </div>
                <div>
                  <div className="text-xs font-semibold tracking-widest uppercase"
                    style={{ color: book.color }}>
                    Principle: {book.principle}
                  </div>
                </div>
              </div>

              {/* Author + Book */}
              <div>
                <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {book.author}
                </div>
                <div className="text-sm italic mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {book.book}
                </div>
              </div>

              {/* Quote */}
              <div
                className="rounded-xl p-4"
                style={{ background: `${book.color}08`, border: `1px solid ${book.color}15` }}
              >
                <p className="text-xs italic leading-relaxed font-playfair"
                  style={{ color: 'var(--text-muted)' }}>
                  {book.quote}
                </p>
              </div>

              {/* How Axnoiz uses it */}
              <div className="mt-auto pt-4"
                style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: book.color, opacity: 0.8 }}>
                  How Axnoiz Applies This
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  {book.howAxnoizUses}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
