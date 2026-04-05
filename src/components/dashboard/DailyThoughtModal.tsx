import { motion, AnimatePresence } from 'framer-motion'

const THOUGHTS: { quote: string; author: string }[] = [
  { quote: "Your subconscious mind does not argue with you. It accepts what your conscious mind decrees.", author: "Dr. Joseph Murphy" },
  { quote: "Whatever the mind can conceive and believe, it can achieve.", author: "Napoleon Hill" },
  { quote: "Ask, Believe, Receive — these are the three steps to everything you desire.", author: "Rhonda Byrne" },
  { quote: "The feeling of health produces health. The feeling of wealth produces wealth.", author: "Dr. Joseph Murphy" },
  { quote: "You become what you think about most of the time.", author: "Napoleon Hill" },
  { quote: "Thoughts become things. If you can see it in your mind, you can hold it in your hand.", author: "Rhonda Byrne" },
  { quote: "Every thought you think is a creative force in your life. Feed your mind only what you want to grow.", author: "Dr. Joseph Murphy" },
  { quote: "Desire is the starting point of all achievement, not a hope or a wish, but a keen pulsating desire.", author: "Napoleon Hill" },
  { quote: "The universe is responding to your dominant thoughts and feelings right now.", author: "Rhonda Byrne" },
  { quote: "Change your thoughts, and you change your destiny.", author: "Dr. Joseph Murphy" },
  { quote: "A burning desire to be and to do is the starting point from which the dreamer must take off.", author: "Napoleon Hill" },
  { quote: "Gratitude is the great multiplier. Be grateful for what you have and you will receive more.", author: "Rhonda Byrne" },
  { quote: "Whatever you impress upon your subconscious mind, it will move heaven and earth to bring it to pass.", author: "Dr. Joseph Murphy" },
  { quote: "The secret of getting ahead is getting started — in your mind first.", author: "Napoleon Hill" },
  { quote: "You are the most powerful transmission tower in the universe.", author: "Rhonda Byrne" },
  { quote: "Your subconscious mind works night and day to fulfil the pictures you give it.", author: "Dr. Joseph Murphy" },
  { quote: "Persistence is to the character of man as carbon is to steel.", author: "Napoleon Hill" },
  { quote: "Feelings are the language of the universe. Feel it real, and it becomes real.", author: "Rhonda Byrne" },
  { quote: "The law of your mind is the law of belief — not the belief of someone else, but your own deep belief.", author: "Dr. Joseph Murphy" },
  { quote: "There are no limitations to the mind except those we acknowledge.", author: "Napoleon Hill" },
  { quote: "Your power is in your thoughts, so stay awake. In other words, remember to remember.", author: "Rhonda Byrne" },
  { quote: "Sleep is the door to your subconscious. Go to sleep with beautiful, loving thoughts and wake up renewed.", author: "Dr. Joseph Murphy" },
  { quote: "The starting point of all achievement is DESIRE. Keep this constantly in mind.", author: "Napoleon Hill" },
  { quote: "It only takes a moment to shift your thoughts. One shift and the universe begins to rearrange.", author: "Rhonda Byrne" },
  { quote: "Think of the end result. Feel the joy of it now — your subconscious cannot tell the difference.", author: "Dr. Joseph Murphy" },
  { quote: "Faith is the head chemist of the mind. When it is blended with thought, the subconscious instantly acts.", author: "Napoleon Hill" },
  { quote: "Everything you want is already here. All you need to do is tune to the right frequency.", author: "Rhonda Byrne" },
  { quote: "Your imagination is your preview of life's coming attractions.", author: "Dr. Joseph Murphy" },
  { quote: "What you think and feel today is creating your tomorrow. Choose thoughts that serve you.", author: "Napoleon Hill" },
  { quote: "The law of attraction is always working. It never takes a day off.", author: "Rhonda Byrne" },
]

function getDailyThought() {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const diff = now.getTime() - start.getTime()
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24))
  return THOUGHTS[dayOfYear % THOUGHTS.length]
}

const TODAY_KEY = `axnoiz_thought_${new Date().toISOString().slice(0, 10)}`

export function shouldShowDailyThought(): boolean {
  return !localStorage.getItem(TODAY_KEY)
}

export function markDailyThoughtSeen() {
  localStorage.setItem(TODAY_KEY, '1')
}

interface Props {
  visible: boolean
  onDismiss: () => void
}

export default function DailyThoughtModal({ visible, onDismiss }: Props) {
  const thought = getDailyThought()

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(5,10,24,0.88)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '24px',
          }}
          onClick={onDismiss}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: '400px', width: '100%',
              background: '#060E1E',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '18px',
              padding: '36px 28px',
              textAlign: 'center',
            }}
          >
            {/* Glow orb */}
            <div style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: 'rgba(108,99,255,0.5)',
              margin: '0 auto 24px',
            }} />

            <p style={{
              fontSize: '11px', color: '#4A5A7A',
              letterSpacing: '0.18em', textTransform: 'uppercase',
              marginBottom: '20px',
            }}>
              Today's Thought
            </p>

            <p className="font-display-italic" style={{
              fontSize: '20px', color: '#F0F4FF',
              lineHeight: 1.65, marginBottom: '20px',
            }}>
              "{thought.quote}"
            </p>

            <p style={{
              fontSize: '12px', color: '#4A5A7A',
              letterSpacing: '0.06em', marginBottom: '32px',
            }}>
              — {thought.author}
            </p>

            <button
              onClick={onDismiss}
              style={{
                width: '100%', padding: '14px',
                background: 'rgba(108,99,255,0.15)',
                border: '1px solid rgba(108,99,255,0.22)',
                borderRadius: '10px',
                color: '#9A94F0', fontSize: '13px',
                fontWeight: 400, letterSpacing: '0.08em',
                textTransform: 'uppercase', cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Carry This With Me
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
