import { useRef, useState } from 'react'
import type { ReactElement } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { Target, Headphones, Flame } from 'lucide-react'

const steps = [
  {
    number: '01',
    icon: Target,
    color: '#6C63FF',
    glow: 'rgba(108,99,255,0.3)',
    title: 'Declare Your Desire',
    subtitle: 'The Burning Desire Principle',
    body: `Set your goal, your timeline, and your current blocks with absolute clarity.
Napoleon Hill called this "a burning desire" — the starting point of all achievement.
Your brain's Reticular Activating System activates around what you've declared real.`,
    quote: '"Whatever the mind can conceive and believe, it can achieve."',
    author: '— Napoleon Hill',
    visual: 'goal',
  },
  {
    number: '02',
    icon: Headphones,
    color: '#00D4FF',
    glow: 'rgba(0,212,255,0.3)',
    title: 'Listen Every Day',
    subtitle: 'The Law of Impression',
    body: `Your personalized 5-minute audio session is generated from your exact inputs.
Every word is calibrated to impress your subconscious in the present tense —
as Dr. Murphy taught: what you impress deeply, you will express outwardly.`,
    quote: '"Your subconscious accepts what is repeatedly impressed upon it."',
    author: '— Dr. Joseph Murphy',
    visual: 'audio',
  },
  {
    number: '03',
    icon: Flame,
    color: '#FFB347',
    glow: 'rgba(255,179,71,0.3)',
    title: 'Track Your Becoming',
    subtitle: 'The Law of Attraction in Motion',
    body: `Log your daily action and mood. Watch your streak grow.
Byrne described feeling as the language of attraction — when you feel it daily,
you signal to the universe that it is already yours. The streak is your proof.`,
    quote: '"The universe responds to frequency. Your feelings are the signal."',
    author: '— Rhonda Byrne',
    visual: 'tracker',
  },
]

// Step visual animations
function GoalVisual() {
  return (
    <div className="flex flex-col gap-3 p-4">
      {[
        { label: 'Your Goal', value: 'I am building a business...', filled: true },
        { label: 'Timeline', value: 'December 2026', filled: true },
        { label: 'Biggest Block', value: 'Fear of failure', filled: true },
      ].map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.2, duration: 0.5 }}
          className="rounded-xl p-3"
          style={{ background: 'rgba(108,99,255,0.08)', border: '1px solid rgba(108,99,255,0.15)' }}
        >
          <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: 'var(--text-dim)' }}>
            {item.label}
          </div>
          <div className="text-sm font-playfair italic" style={{ color: 'var(--text-primary)' }}>
            {item.value}
          </div>
        </motion.div>
      ))}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.7, duration: 0.4 }}
        className="rounded-full py-2 text-center text-xs font-semibold mt-1"
        style={{ background: 'linear-gradient(135deg, #6C63FF, #5A54E8)', color: 'white' }}
      >
        Create My Reality →
      </motion.div>
    </div>
  )
}

function AudioVisual() {
  return (
    <div className="flex flex-col gap-3 p-4 items-center">
      {/* Audio waveform */}
      <div className="w-full flex items-center justify-center gap-1 h-12">
        {Array.from({ length: 28 }, (_, i) => (
          <motion.div
            key={i}
            className="rounded-full"
            style={{
              width: '3px',
              background: 'linear-gradient(to top, #6C63FF, #00D4FF)',
            }}
            animate={{
              height: [
                `${Math.random() * 20 + 8}px`,
                `${Math.random() * 36 + 12}px`,
                `${Math.random() * 20 + 8}px`,
              ],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              repeat: Infinity,
              duration: Math.random() * 1 + 0.8,
              delay: i * 0.05,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Script line */}
      <div className="w-full rounded-xl p-3 text-center"
        style={{ background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.15)' }}>
        <motion.p
          className="text-sm font-playfair italic"
          style={{ color: 'var(--text-primary)' }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        >
          "I am already in motion.<br />My subconscious knows the way."
        </motion.p>
      </div>

      {/* Progress bar */}
      <div className="w-full">
        <div className="flex justify-between text-[10px] mb-1" style={{ color: 'var(--text-dim)' }}>
          <span>Playing</span><span>3:42 left</span>
        </div>
        <div className="w-full h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(to right, #6C63FF, #00D4FF)' }}
            initial={{ width: '0%' }}
            animate={{ width: '58%' }}
            transition={{ delay: 0.5, duration: 2, ease: 'easeOut' }}
          />
        </div>
      </div>
    </div>
  )
}

function TrackerVisual() {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  const done = [true, true, true, true, true, false, false]

  return (
    <div className="flex flex-col gap-3 p-4">
      {/* Streak */}
      <div className="flex items-center justify-center gap-3 py-3 rounded-xl"
        style={{ background: 'rgba(255,179,71,0.08)', border: '1px solid rgba(255,179,71,0.15)' }}>
        <motion.span
          className="text-4xl"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >🔥</motion.span>
        <div>
          <div className="text-2xl font-bold" style={{ color: '#FFB347' }}>12</div>
          <div className="text-xs" style={{ color: 'var(--text-dim)' }}>Day Streak</div>
        </div>
      </div>

      {/* Week calendar */}
      <div className="flex justify-between gap-1">
        {days.map((d, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div className="text-[9px]" style={{ color: 'var(--text-dim)' }}>{d}</div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.1 + 0.3, type: 'spring', stiffness: 200 }}
              className="w-7 h-7 rounded-full flex items-center justify-center text-[11px]"
              style={{
                background: done[i] ? 'rgba(108,99,255,0.4)' : 'rgba(255,255,255,0.05)',
                border: done[i] ? '1px solid rgba(108,99,255,0.6)' : '1px solid rgba(255,255,255,0.08)',
                color: done[i] ? 'white' : 'var(--text-dim)',
              }}
            >
              {done[i] ? '✓' : ''}
            </motion.div>
          </div>
        ))}
      </div>

      {/* Mood chart */}
      <div className="flex items-end justify-between gap-1 h-10 px-1">
        {[2, 3, 4, 3, 5, 4, 4].map((h, i) => (
          <motion.div
            key={i}
            className="rounded-sm flex-1"
            style={{ background: 'linear-gradient(to top, #6C63FF, #00D4FF)', opacity: 0.7 }}
            initial={{ height: 0 }}
            animate={{ height: `${h * 20}%` }}
            transition={{ delay: i * 0.1 + 0.6, duration: 0.5, ease: 'easeOut' }}
          />
        ))}
      </div>
    </div>
  )
}

const visuals: Record<string, ReactElement> = {
  goal: <GoalVisual />,
  audio: <AudioVisual />,
  tracker: <TrackerVisual />,
}

export default function HowItWorks() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const [activeStep, setActiveStep] = useState(0)

  return (
    <section ref={ref} id="how-it-works" className="relative py-24 px-6">
      {/* Section bg glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, rgba(108,99,255,0.04) 0%, transparent 70%)',
        }}
      />

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <p className="text-xs font-semibold tracking-widest uppercase mb-4"
            style={{ color: 'var(--accent-cyan)' }}>
            How It Works
          </p>
          <h2 className="font-playfair font-bold"
            style={{ fontSize: 'clamp(28px, 5vw, 46px)', color: 'var(--text-primary)', lineHeight: 1.2 }}>
            Three steps.
            <br />
            <span className="gradient-text">One daily practice.</span>
          </h2>
        </motion.div>

        {/* Step tabs */}
        <div className="flex gap-2 justify-center mb-12">
          {steps.map((step, i) => (
            <button
              key={i}
              onClick={() => setActiveStep(i)}
              className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-300"
              style={{
                background: activeStep === i ? `rgba(${step.color === '#6C63FF' ? '108,99,255' : step.color === '#00D4FF' ? '0,212,255' : '255,179,71'},0.2)` : 'rgba(255,255,255,0.04)',
                border: activeStep === i ? `1px solid ${step.color}` : '1px solid rgba(255,255,255,0.08)',
                color: activeStep === i ? step.color : 'var(--text-dim)',
              }}
            >
              {step.number}
            </button>
          ))}
        </div>

        {/* Steps — desktop: all visible; mobile: tabbed */}
        <div className="hidden md:grid grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 + i * 0.15, duration: 0.7 }}
              className="card p-6 flex flex-col gap-5 cursor-pointer transition-all duration-300"
              style={{
                borderColor: `rgba(${step.color === '#6C63FF' ? '108,99,255' : step.color === '#00D4FF' ? '0,212,255' : '255,179,71'},0.2)`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = step.color
                e.currentTarget.style.boxShadow = `0 0 30px ${step.glow}`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = `rgba(${step.color === '#6C63FF' ? '108,99,255' : step.color === '#00D4FF' ? '0,212,255' : '255,179,71'},0.2)`
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              {/* Number + icon */}
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: `${step.glow}`, border: `1px solid ${step.color}` }}
                >
                  <step.icon size={18} style={{ color: step.color }} />
                </div>
                <span className="font-bold text-2xl font-playfair" style={{ color: step.color, opacity: 0.4 }}>
                  {step.number}
                </span>
              </div>

              {/* Visual */}
              <div className="rounded-xl overflow-hidden"
                style={{ background: '#050A18', border: '1px solid rgba(255,255,255,0.04)' }}>
                {visuals[step.visual]}
              </div>

              {/* Text */}
              <div>
                <div className="text-xs font-medium tracking-wider uppercase mb-1"
                  style={{ color: step.color }}>
                  {step.subtitle}
                </div>
                <h3 className="font-playfair font-bold text-lg mb-3"
                  style={{ color: 'var(--text-primary)' }}>
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  {step.body}
                </p>
              </div>

              {/* Quote */}
              <div className="mt-auto pt-4"
                style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-xs italic" style={{ color: 'var(--text-dim)' }}>
                  {step.quote}
                </p>
                <p className="text-xs mt-1" style={{ color: step.color, opacity: 0.7 }}>
                  {step.author}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mobile tabbed */}
        <div className="md:hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="card p-6 flex flex-col gap-5"
              style={{ borderColor: steps[activeStep].color }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: steps[activeStep].glow, border: `1px solid ${steps[activeStep].color}` }}
                >
                  {(() => { const Icon = steps[activeStep].icon; return <Icon size={18} style={{ color: steps[activeStep].color }} /> })()}
                </div>
                <div>
                  <div className="text-xs font-medium tracking-wider uppercase"
                    style={{ color: steps[activeStep].color }}>
                    {steps[activeStep].subtitle}
                  </div>
                  <h3 className="font-playfair font-bold text-lg"
                    style={{ color: 'var(--text-primary)' }}>
                    {steps[activeStep].title}
                  </h3>
                </div>
              </div>
              <div className="rounded-xl overflow-hidden"
                style={{ background: '#050A18', border: '1px solid rgba(255,255,255,0.04)' }}>
                {visuals[steps[activeStep].visual]}
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                {steps[activeStep].body}
              </p>
              <div className="pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-xs italic" style={{ color: 'var(--text-dim)' }}>
                  {steps[activeStep].quote}
                </p>
                <p className="text-xs mt-1" style={{ color: steps[activeStep].color, opacity: 0.7 }}>
                  {steps[activeStep].author}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
