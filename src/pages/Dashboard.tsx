import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, Play, BarChart2, User, Flame, ChevronRight, Sparkles } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import UniverseBackground from '../components/ui/UniverseBackground'

// ── Design tokens ──────────────────────────────────────────────────
const C = {
  bg:       '#050A18',
  card:     '#0A1628',
  elevated: '#0F1F3D',
  violet:   '#6C63FF',
  cyan:     '#00D4FF',
  amber:    '#FFB347',
  text:     '#F0F4FF',
  muted:    '#8B9DC3',
  dim:      '#4A5A7A',
  border:   'rgba(108, 99, 255, 0.12)',
  glow:     '0 0 40px rgba(108, 99, 255, 0.08)',
}

// ── Helpers ─────────────────────────────────────────────────────────
function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function getFirstName(fullName: string | null, email: string) {
  if (fullName?.trim()) return fullName.trim().split(' ')[0]
  return email.split('@')[0]
}

function getInitials(fullName: string | null, email: string) {
  if (fullName?.trim()) {
    const parts = fullName.trim().split(' ')
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0][0].toUpperCase()
  }
  return email[0].toUpperCase()
}

function formatToday() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

// Last 14 days for streak calendar (placeholder — will be filled once sessions are implemented)
function buildCalendar() {
  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (13 - i))
    return { date: d, complete: false, isToday: i === 13 }
  })
}

// ── Bottom Nav Item ──────────────────────────────────────────────────
function NavItem({ icon: Icon, label, active, onClick }: { icon: any; label: string; active?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
        background: 'none', border: 'none', cursor: 'pointer',
        color: active ? C.violet : C.dim,
        padding: '12px 0',
        transition: 'color 0.2s',
      }}
    >
      <Icon size={20} />
      <span style={{ fontSize: '10px', letterSpacing: '0.06em' }}>{label}</span>
    </button>
  )
}

// ── Card wrapper ─────────────────────────────────────────────────────
function Card({ children, style = {}, accentColor }: { children: React.ReactNode; style?: React.CSSProperties; accentColor?: string }) {
  return (
    <div style={{
      background: C.card,
      border: `1px solid ${C.border}`,
      borderRadius: '16px',
      padding: '20px',
      boxShadow: C.glow,
      borderLeft: accentColor ? `3px solid ${accentColor}` : `1px solid ${C.border}`,
      ...style,
    }}>
      {children}
    </div>
  )
}

// ── Main Component ───────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [profileName, setProfileName] = useState<string | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)

  const streak = 0 // Will be live when sessions are built
  const sessionComplete = false // Will be live when sessions are built
  const calendar = buildCalendar()

  useEffect(() => {
    if (!user) return
    supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (!data?.full_name) {
          navigate('/complete-profile', { replace: true })
          return
        }
        setProfileName(data.full_name)
        setLoadingProfile(false)
      })
  }, [user])

  if (!user) return null

  const firstName = getFirstName(profileName, user.email!)
  const initials = getInitials(profileName, user.email!)

  return (
    <div style={{ minHeight: '100svh', background: C.bg, color: C.text, position: 'relative', paddingBottom: '80px' }}>

      {/* Stars */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <UniverseBackground />
      </div>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '480px', margin: '0 auto', padding: '0 20px' }}>

        {/* ── Header ── */}
        <header style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '20px 0 8px',
        }}>
          <span className="font-display" style={{ fontSize: '22px', color: C.text, letterSpacing: '0.04em' }}>
            AXNOIZ
          </span>

          {/* Profile avatar */}
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate('/profile')}
            style={{
              width: '40px', height: '40px', borderRadius: '50%',
              background: `linear-gradient(135deg, ${C.violet}, #9B8FF5)`,
              border: `2px solid rgba(108,99,255,0.4)`,
              boxShadow: '0 0 16px rgba(108,99,255,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#fff',
              fontSize: '14px', fontWeight: 600, fontFamily: 'inherit',
            }}
            title="View Profile"
          >
            {initials}
          </motion.button>
        </header>

        {/* ── Greeting ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{ padding: '24px 0 8px' }}
        >
          <p style={{ fontSize: '12px', color: C.dim, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '6px' }}>
            {formatToday()}
          </p>
          <h1 className="font-display" style={{ fontSize: '32px', color: C.text, fontWeight: 300 }}>
            {loadingProfile ? `${getGreeting()}.` : `${getGreeting()}, ${firstName}.`}
          </h1>
        </motion.div>

        {/* ── Cards ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '20px' }}>

          {/* CARD 1 — Today's Status */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
            <Card accentColor={sessionComplete ? '#4CAF82' : C.violet}>
              {sessionComplete ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ fontSize: '28px' }}>✅</div>
                  <div>
                    <p style={{ fontSize: '15px', fontWeight: 600, color: C.text, marginBottom: '2px' }}>You showed up today.</p>
                    <p style={{ fontSize: '12px', color: '#4CAF82' }}>Session complete · 🔥 Day {streak}</p>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <div style={{ fontSize: '20px' }}>⏳</div>
                    <p style={{ fontSize: '13px', color: C.muted }}>Your session is waiting.</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => navigate('/session')}
                    style={{
                      width: '100%', padding: '15px 20px',
                      background: `linear-gradient(135deg, ${C.violet}, #8B83FF)`,
                      border: 'none', borderRadius: '10px',
                      color: '#fff', fontSize: '13px', fontWeight: 600,
                      letterSpacing: '0.08em', textTransform: 'uppercase',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      cursor: 'pointer', boxShadow: '0 0 24px rgba(108,99,255,0.4)',
                      fontFamily: 'inherit',
                    }}
                  >
                    <Play size={15} fill="white" />
                    Begin Today's Session
                    <ChevronRight size={15} />
                  </motion.button>
                  <p style={{ fontSize: '11px', color: C.dim, textAlign: 'center', marginTop: '10px' }}>
                    5 minutes. One step forward.
                  </p>
                </>
              )}
            </Card>
          </motion.div>

          {/* CARD 2 — Streak */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.18 }}>
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Flame size={22} color={C.amber} />
                  <div>
                    <p style={{ fontSize: '28px', fontWeight: 700, color: C.text, lineHeight: 1 }}>{streak}</p>
                    <p style={{ fontSize: '11px', color: C.muted, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Day Streak</p>
                  </div>
                </div>
                {streak === 0 && (
                  <span style={{
                    fontSize: '10px', padding: '4px 10px', borderRadius: '9999px',
                    background: 'rgba(108,99,255,0.12)', color: C.violet,
                    letterSpacing: '0.08em', textTransform: 'uppercase',
                  }}>
                    Start today
                  </span>
                )}
              </div>

              {/* 14-day mini calendar */}
              <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                {calendar.map((day, i) => (
                  <div
                    key={i}
                    title={day.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    style={{
                      width: '20px', height: '20px', borderRadius: '50%',
                      background: day.complete
                        ? C.violet
                        : day.isToday
                        ? 'transparent'
                        : 'rgba(255,255,255,0.04)',
                      border: day.isToday
                        ? `2px solid ${C.violet}`
                        : '2px solid transparent',
                      boxShadow: day.isToday ? `0 0 8px rgba(108,99,255,0.6)` : 'none',
                      animation: day.isToday ? 'pulse 2s infinite' : 'none',
                      flexShrink: 0,
                    }}
                  />
                ))}
              </div>

              <p style={{ fontSize: '12px', color: C.dim, marginTop: '14px', lineHeight: 1.6 }}>
                "Every day you show up, you cast a vote for the person you are becoming."
              </p>
            </Card>
          </motion.div>

          {/* CARD 3 — Declared Desire */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.26 }}>
            <Card accentColor={C.cyan}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <p style={{ fontSize: '10px', color: C.cyan, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                  What you are building
                </p>
                <Sparkles size={14} color={C.cyan} />
              </div>
              <p style={{ fontSize: '14px', color: C.muted, lineHeight: 1.7, fontStyle: 'italic' }}>
                You haven't set your goal yet.
              </p>
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/onboarding')}
                style={{
                  marginTop: '14px', width: '100%', padding: '12px 16px',
                  background: 'rgba(0,212,255,0.08)', border: `1px solid rgba(0,212,255,0.2)`,
                  borderRadius: '8px', color: C.cyan,
                  fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase',
                  cursor: 'pointer', fontFamily: 'inherit',
                  transition: 'border-color 0.2s',
                }}
              >
                Declare Your Desire →
              </motion.button>
            </Card>
          </motion.div>

          {/* CARD 4 — Philosophy quote */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.34 }}>
            <div style={{
              background: C.elevated, borderRadius: '16px', padding: '24px 20px',
              border: `1px solid rgba(108,99,255,0.15)`,
              boxShadow: '0 0 60px rgba(108,99,255,0.05)',
              textAlign: 'center',
            }}>
              <p className="font-display-italic" style={{ fontSize: '18px', color: C.text, lineHeight: 1.6, marginBottom: '12px' }}>
                "Whatever the mind of man can conceive and believe, it can achieve."
              </p>
              <p style={{ fontSize: '11px', color: C.dim, letterSpacing: '0.08em' }}>
                — Napoleon Hill, Think and Grow Rich
              </p>
            </div>
          </motion.div>

        </div>
      </div>

      {/* ── Bottom Navigation ── */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: `rgba(5, 10, 24, 0.92)`,
        backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        borderTop: `1px solid ${C.border}`,
        display: 'flex', zIndex: 50,
        maxWidth: '480px', margin: '0 auto',
      }}>
        <NavItem icon={Home}     label="Home"    active onClick={() => navigate('/dashboard')} />
        <NavItem icon={Play}     label="Session"        onClick={() => navigate('/session')} />
        <NavItem icon={BarChart2} label="Tracker"       onClick={() => navigate('/tracker')} />
        <NavItem icon={User}     label="Profile"        onClick={() => navigate('/profile')} />
      </nav>

      {/* Pulse keyframe for today dot */}
      <style>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 8px rgba(108,99,255,0.6); }
          50% { box-shadow: 0 0 16px rgba(108,99,255,1); }
        }
      `}</style>
    </div>
  )
}
