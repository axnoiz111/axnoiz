import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const testimonials = [
  {
    initials: 'JK',
    name: 'James K.',
    streak: '47 days',
    quote: `I stopped waiting for motivation. Axnoiz became my morning anchor.
            By day 30 my inner dialogue had completely changed — I wasn't even
            aware it was happening until I read my weekly summary.`,
    result: 'Got the promotion he had been working toward for 2 years.',
    color: '#6C63FF',
  },
  {
    initials: 'SM',
    name: 'Sara M.',
    streak: '31 days',
    quote: `The scripts are different every day. They reference MY goal, MY fear.
            On day 31 my business deal closed — the one I had been affirming
            for months. I'm not saying that's magic. I'm saying I showed up differently.`,
    result: 'Closed a $40K consulting deal.',
    color: '#00D4FF',
  },
  {
    initials: 'RD',
    name: 'Rachel D.',
    streak: '22 days',
    quote: `The weekly summary hit me in a way I didn't expect. Seeing my mood
            chart improve week over week made it undeniable. Something was
            genuinely shifting — not just motivation, but belief.`,
    result: 'Lost 18 lbs, started running her first 5K.',
    color: '#FFB347',
  },
  {
    initials: 'TN',
    name: 'Thomas N.',
    streak: '63 days',
    quote: `I've tried every app. Every book. This is the first system that made
            me feel like the session was written for me by someone who actually
            understood my specific fear. That's what makes it different.`,
    result: 'Left corporate job, launched a product business.',
    color: '#4CAF82',
  },
  {
    initials: 'PM',
    name: 'Priya M.',
    streak: '19 days',
    quote: `The mood tracking alone is worth it. I discovered I always feel better
            after the session — without fail. That consistency made me trust the
            process on the days I didn't feel like showing up.`,
    result: 'Rebuilt confidence after a career setback.',
    color: '#6C63FF',
  },
  {
    initials: 'AK',
    name: 'Alex K.',
    streak: '55 days',
    quote: `What Murphy calls impression through repetition — Axnoiz delivers it
            daily. I didn't believe this would work. My streak hit 55 days.
            My belief changed before my circumstances did. Then my circumstances changed.`,
    result: 'Revenue up 3× in 6 months.',
    color: '#00D4FF',
  },
]

const stats = [
  { value: '12,400+', label: 'Sessions completed' },
  { value: '94%', label: 'Return the next day' },
  { value: '47', label: 'Average streak days' },
  { value: '4.9★', label: 'Average rating' },
]

export default function SocialProof() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} id="social-proof" className="relative py-24 px-6">
      <div className="max-w-6xl mx-auto">

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <p className="text-xs font-semibold tracking-widest uppercase mb-4"
            style={{ color: 'var(--accent-cyan)' }}>
            Practitioner Stories
          </p>
          <h2 className="font-playfair font-bold"
            style={{ fontSize: 'clamp(28px, 5vw, 46px)', color: 'var(--text-primary)', lineHeight: 1.2 }}>
            Results speak.
            <br />
            <span className="gradient-text">But identity shifts first.</span>
          </h2>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16"
        >
          {stats.map((stat, i) => (
            <div
              key={i}
              className="card p-5 text-center"
              style={{ borderColor: 'rgba(108,99,255,0.12)' }}
            >
              <div
                className="font-bold text-2xl mb-1 gradient-text"
                style={{ fontSize: 'clamp(22px, 4vw, 32px)' }}
              >
                {stat.value}
              </div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Testimonial grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3 + i * 0.1, duration: 0.6 }}
              className="card p-5 flex flex-col gap-4 relative overflow-hidden group"
            >
              {/* Subtle bg accent on hover */}
              <div
                className="absolute top-0 left-0 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: `radial-gradient(circle at top left, ${t.color}08 0%, transparent 60%)`,
                }}
              />

              {/* Header */}
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
                  style={{
                    background: `${t.color}20`,
                    border: `1px solid ${t.color}40`,
                    color: t.color,
                  }}
                >
                  {t.initials}
                </div>
                <div>
                  <div className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                    {t.name}
                  </div>
                  <div className="flex items-center gap-1">
                    <span>🔥</span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {t.streak} streak
                    </span>
                  </div>
                </div>
                <div className="ml-auto flex gap-0.5">
                  {'★★★★★'.split('').map((s, j) => (
                    <span key={j} style={{ color: '#FFB347', fontSize: '12px' }}>{s}</span>
                  ))}
                </div>
              </div>

              {/* Quote */}
              <p className="text-sm leading-relaxed flex-1 font-playfair italic"
                style={{ color: 'var(--text-muted)' }}>
                "{t.quote}"
              </p>

              {/* Result chip */}
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium self-start"
                style={{
                  background: `${t.color}12`,
                  border: `1px solid ${t.color}30`,
                  color: t.color,
                }}
              >
                ✦ {t.result}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
