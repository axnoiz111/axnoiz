import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.7, ease: 'easeOut' as const },
  }),
}

export default function Hero() {
  const scrollToCTA = () =>
    document.getElementById('final-cta')?.scrollIntoView({ behavior: 'smooth' })

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-16"
    >
      {/* Ambient orb behind hero */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(108,99,255,0.12) 0%, rgba(0,212,255,0.04) 50%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center gap-6">

        {/* Eyebrow badge */}
        <motion.div
          custom={0} variants={fadeUp} initial="hidden" animate="visible"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold tracking-widest uppercase"
          style={{
            background: 'rgba(108,99,255,0.1)',
            border: '1px solid rgba(108,99,255,0.25)',
            color: 'var(--accent-cyan)',
          }}
        >
          <Sparkles size={12} />
          Daily Subconscious Conditioning
        </motion.div>

        {/* H1 */}
        <motion.h1
          custom={1} variants={fadeUp} initial="hidden" animate="visible"
          className="font-playfair font-bold leading-tight"
          style={{ fontSize: 'clamp(38px, 7vw, 68px)', color: 'var(--text-primary)' }}
        >
          Access your inner voice.
          <br />
          <span className="gradient-text text-glow">
            Remove the noise.
          </span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          custom={2} variants={fadeUp} initial="hidden" animate="visible"
          className="max-w-xl leading-relaxed"
          style={{ fontSize: 'clamp(16px, 2.5vw, 19px)', color: 'var(--text-muted)' }}
        >
          Every day your subconscious is being programmed — by fear, by doubt,
          by other people's voices. Axnoiz gives you back the pen.
          <br />
          <span style={{ color: 'var(--text-primary)', opacity: 0.9 }}>
            5 minutes. Personalized. Daily.
          </span>
        </motion.p>

        {/* CTA group */}
        <motion.div
          custom={3} variants={fadeUp} initial="hidden" animate="visible"
          className="flex flex-col sm:flex-row items-center gap-4 mt-2 w-full sm:w-auto"
        >
          <button
            onClick={scrollToCTA}
            className="btn-primary animate-pulse-ring flex items-center gap-2 w-full sm:w-auto justify-center"
            style={{ padding: '16px 36px', fontSize: '16px' }}
          >
            Start Your Manifestation
            <ArrowRight size={18} />
          </button>
          <p className="text-xs" style={{ color: 'var(--text-dim)' }}>
            Free to begin. No credit card needed.
          </p>
        </motion.div>

        {/* Social proof bar */}
        <motion.div
          custom={4} variants={fadeUp} initial="hidden" animate="visible"
          className="flex flex-wrap justify-center items-center gap-6 mt-4"
        >
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {['#6C63FF', '#00D4FF', '#FFB347', '#4CAF82'].map((c, i) => (
                <div
                  key={i}
                  className="w-7 h-7 rounded-full border-2 border-[#050A18]"
                  style={{ background: c, opacity: 0.9 }}
                />
              ))}
            </div>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              2,400+ practitioners
            </span>
          </div>
          <div className="flex items-center gap-1">
            {'★★★★★'.split('').map((s, i) => (
              <span key={i} style={{ color: '#FFB347', fontSize: '14px' }}>{s}</span>
            ))}
            <span className="text-xs ml-1" style={{ color: 'var(--text-muted)' }}>4.9 rating</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs font-semibold" style={{ color: 'var(--accent-cyan)' }}>
              94%
            </span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>return daily</span>
          </div>
        </motion.div>
      </div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        style={{ color: 'var(--text-dim)' }}
      >
        <span className="text-xs tracking-widest uppercase">Discover</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
          className="w-px h-8"
          style={{ background: 'linear-gradient(to bottom, rgba(108,99,255,0.6), transparent)' }}
        />
      </motion.div>
    </section>
  )
}
