import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

interface Session {
  id: string
  audio_title: string
  loops_completed: number
  created_at: string
  mood_after: string | null
  action_step: string | null
}

const MOOD_CONFIG: Record<string, { label: string; color: string; score: number }> = {
  okay:    { label: 'Okay',    color: '#8B9DC3', score: 1 },
  good:    { label: 'Good',    color: '#FFB347', score: 2 },
  great:   { label: 'Great',   color: '#6C63FF', score: 3 },
  amazing: { label: 'Amazing', color: '#4CAF82', score: 4 },
}

function toDateStr(iso: string) {
  return new Date(iso).toISOString().slice(0, 10)
}

function formatDateLabel(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  const today = new Date(); today.setHours(0,0,0,0)
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1)
  if (d.getTime() === today.getTime()) return 'Today'
  if (d.getTime() === yesterday.getTime()) return 'Yesterday'
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function calcStreak(sessions: Session[]): { current: number; best: number } {
  const dates = new Set(sessions.map(s => toDateStr(s.created_at)))
  const today = new Date(); today.setHours(0,0,0,0)

  let current = 0
  let cursor = new Date(today)
  while (dates.has(toDateStr(cursor.toISOString()))) {
    current++
    cursor.setDate(cursor.getDate() - 1)
  }

  // best streak
  const sorted = [...dates].sort()
  let best = 0, run = 0, prev: string | null = null
  for (const d of sorted) {
    if (prev) {
      const diff = (new Date(d).getTime() - new Date(prev).getTime()) / 86400000
      if (diff === 1) { run++; best = Math.max(best, run) }
      else run = 1
    } else { run = 1; best = 1 }
    prev = d
  }

  return { current, best }
}

// ── 28-day Activity Bars ──────────────────────────────────────────────────────

function ActivityChart({ sessions }: { sessions: Session[] }) {
  const days = 28
  const today = new Date(); today.setHours(0,0,0,0)

  const dayCounts: number[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const ds = toDateStr(d.toISOString())
    dayCounts.push(sessions.filter(s => toDateStr(s.created_at) === ds).length)
  }

  const max = Math.max(...dayCounts, 1)

  return (
    <div>
      <p style={{ fontSize: '10px', color: 'var(--text-dim)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '10px' }}>
        28-Day Activity
      </p>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '48px' }}>
        {dayCounts.map((count, i) => {
          const isToday = i === days - 1
          const height = count === 0 ? 4 : Math.max(8, (count / max) * 48)
          return (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={{ height }}
              transition={{ delay: i * 0.01, duration: 0.4, ease: 'easeOut' }}
              title={`${count} session${count !== 1 ? 's' : ''}`}
              style={{
                flex: 1,
                borderRadius: '2px 2px 0 0',
                background: count === 0
                  ? 'rgba(255,255,255,0.04)'
                  : isToday
                  ? 'linear-gradient(180deg, #8B83FF, #6C63FF)'
                  : `rgba(108,99,255,${0.2 + (count / max) * 0.7})`,
                cursor: count > 0 ? 'default' : 'default',
                minHeight: '4px',
              }}
            />
          )
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
        <span style={{ fontSize: '9px', color: 'var(--text-dim)' }}>28 days ago</span>
        <span style={{ fontSize: '9px', color: '#6C63FF' }}>Today</span>
      </div>
    </div>
  )
}

// ── Mood Trend (SVG line chart) ───────────────────────────────────────────────

function MoodTrendChart({ sessions }: { sessions: Session[] }) {
  const withMood = sessions.filter(s => s.mood_after).slice(0, 14).reverse()
  if (withMood.length < 3) return null

  const W = 280, H = 56, PAD = 8
  const scores = withMood.map(s => MOOD_CONFIG[s.mood_after!]?.score ?? 0)
  const points = scores.map((score, i) => {
    const x = PAD + (i / (scores.length - 1)) * (W - PAD * 2)
    const y = H - PAD - ((score - 1) / 3) * (H - PAD * 2)
    return `${x},${y}`
  })

  const lastMood = withMood[withMood.length - 1]?.mood_after
  const cfg = lastMood ? MOOD_CONFIG[lastMood] : null

  return (
    <div style={{ marginTop: '16px' }}>
      <p style={{ fontSize: '10px', color: 'var(--text-dim)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '10px' }}>
        Mood Trend — last {withMood.length} sessions
      </p>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
        {/* Grid lines */}
        {[1,2,3,4].map(score => {
          const y = H - PAD - ((score - 1) / 3) * (H - PAD * 2)
          return <line key={score} x1={PAD} y1={y} x2={W - PAD} y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
        })}
        {/* Area fill */}
        <defs>
          <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={cfg?.color ?? '#6C63FF'} stopOpacity="0.2" />
            <stop offset="100%" stopColor={cfg?.color ?? '#6C63FF'} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon
          points={`${PAD},${H} ${points.join(' ')} ${W - PAD},${H}`}
          fill="url(#moodGrad)"
        />
        {/* Line */}
        <polyline
          points={points.join(' ')}
          fill="none"
          stroke={cfg?.color ?? '#6C63FF'}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Dots */}
        {points.map((pt, i) => {
          const [x, y] = pt.split(',').map(Number)
          const moodCfg = MOOD_CONFIG[withMood[i]?.mood_after ?? '']
          return (
            <circle key={i} cx={x} cy={y} r="3"
              fill={moodCfg?.color ?? '#6C63FF'}
              stroke="#060E1E" strokeWidth="1.5"
            />
          )
        })}
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
        {Object.entries(MOOD_CONFIG).map(([, cfg]) => (
          <span key={cfg.label} style={{ fontSize: '9px', color: cfg.color, opacity: 0.7 }}>{cfg.label}</span>
        ))}
      </div>
    </div>
  )
}

// ── Mood Distribution Bar ─────────────────────────────────────────────────────

function MoodDistribution({ sessions }: { sessions: Session[] }) {
  const withMood = sessions.filter(s => s.mood_after)
  if (withMood.length < 2) return null

  const counts: Record<string, number> = { okay: 0, good: 0, great: 0, amazing: 0 }
  withMood.forEach(s => { if (s.mood_after) counts[s.mood_after] = (counts[s.mood_after] || 0) + 1 })
  const total = withMood.length

  const dominant = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]
  const domCfg = MOOD_CONFIG[dominant[0]]

  return (
    <div style={{ marginTop: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
        <p style={{ fontSize: '10px', color: 'var(--text-dim)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
          Mood Distribution
        </p>
        <span style={{ fontSize: '11px', color: domCfg.color }}>
          Mostly {domCfg.label} — {Math.round((dominant[1] / total) * 100)}%
        </span>
      </div>
      <div style={{ display: 'flex', height: '6px', borderRadius: '3px', overflow: 'hidden', gap: '1px' }}>
        {Object.entries(counts).map(([key, count]) => {
          if (!count) return null
          const cfg = MOOD_CONFIG[key]
          return <div key={key} style={{ flex: count / total, background: cfg.color, borderRadius: '1px' }} />
        })}
      </div>
    </div>
  )
}

// ── Date-grouped history ──────────────────────────────────────────────────────

function SessionHistory({ sessions }: { sessions: Session[] }) {
  const groups: Record<string, Session[]> = {}
  sessions.forEach(s => {
    const d = toDateStr(s.created_at)
    if (!groups[d]) groups[d] = []
    groups[d].push(s)
  })

  const sortedDates = Object.keys(groups).sort((a, b) => b.localeCompare(a))

  return (
    <div style={{ marginTop: '24px' }}>
      <p style={{ fontSize: '10px', color: 'var(--text-dim)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '14px' }}>
        Session History
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {sortedDates.map((date, di) => (
          <motion.div
            key={date}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: di * 0.06 }}
          >
            {/* Date header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', color: '#8A9ABE', fontWeight: 500 }}>{formatDateLabel(date)}</span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.05)' }} />
              <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>
                {groups[date].length} session{groups[date].length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Sessions for this date */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {groups[date].map(session => {
                const moodCfg = session.mood_after ? MOOD_CONFIG[session.mood_after] : null
                return (
                  <div key={session.id} style={{
                    background: 'rgba(8,18,34,0.7)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '10px',
                    padding: '12px 14px',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: session.action_step ? '8px' : 0 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '13px', color: '#C8D4F0', marginBottom: '2px' }}>{session.audio_title}</p>
                        <p style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                          {new Date(session.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          {session.loops_completed > 1 ? ` · ${session.loops_completed} plays` : ''}
                        </p>
                      </div>
                      {moodCfg && (
                        <span style={{
                          fontSize: '10px', padding: '3px 9px', borderRadius: '9999px',
                          background: `${moodCfg.color}18`, border: `1px solid ${moodCfg.color}40`,
                          color: moodCfg.color, letterSpacing: '0.06em', flexShrink: 0,
                        }}>
                          {moodCfg.label}
                        </span>
                      )}
                    </div>
                    {session.action_step && (
                      <p style={{
                        fontSize: '12px', color: '#6A7A9A',
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.04)',
                        borderRadius: '6px', padding: '8px 10px',
                        lineHeight: 1.6, fontStyle: 'italic',
                      }}>
                        "{session.action_step}"
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ── Insight Message ───────────────────────────────────────────────────────────

function InsightMessage({ sessions }: { sessions: Session[] }) {
  const withMood = sessions.filter(s => s.mood_after)
  if (withMood.length < 5) return null

  const recent5 = withMood.slice(0, 5)
  const older5 = withMood.slice(5, 10)
  if (older5.length < 3) return null

  const avgScore = (arr: Session[]) =>
    arr.reduce((s, x) => s + (MOOD_CONFIG[x.mood_after!]?.score ?? 0), 0) / arr.length

  const recentAvg = avgScore(recent5)
  const olderAvg = avgScore(older5)
  const diff = recentAvg - olderAvg

  let msg = ''
  if (diff > 0.5) msg = `Your mood has improved by ${Math.round(diff * 25)}% compared to your earlier sessions. The repetition is working.`
  else if (diff < -0.5) msg = `Your recent sessions feel heavier. That's okay — showing up is the practice.`
  else msg = `You're consistent. Consistency is how the subconscious rewires.`

  return (
    <div style={{
      background: 'rgba(108,99,255,0.05)',
      border: '1px solid rgba(108,99,255,0.15)',
      borderRadius: '10px',
      padding: '14px 16px',
      marginTop: '16px',
    }}>
      <p style={{ fontSize: '11px', color: '#A09AFF', lineHeight: 1.7, fontStyle: 'italic' }}>
        ✦ {msg}
      </p>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

interface Props { refreshKey: number }

export default function TrackerTab({ refreshKey }: Props) {
  const { user } = useAuth()
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    setLoading(true)
    supabase
      .from('listening_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(100)
      .then(({ data }) => {
        setSessions(data ?? [])
        setLoading(false)
      })
  }, [user, refreshKey])

  if (loading) {
    return <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '13px' }}>Loading...</div>
  }

  if (sessions.length === 0) {
    return (
      <div style={{ padding: '40px 28px' }}>
        <div style={{ border: '1px dashed rgba(255,255,255,0.07)', borderRadius: '14px', padding: '56px 24px', textAlign: 'center' }}>
          <p style={{ fontSize: '15px', color: 'var(--text-muted)', marginBottom: '8px' }}>Nothing tracked yet.</p>
          <p style={{ fontSize: '13px', color: 'var(--text-dim)', lineHeight: 1.7 }}>
            Complete your first listening session<br />and your progress will appear here.
          </p>
        </div>
      </div>
    )
  }

  const { current: streak, best: bestStreak } = calcStreak(sessions)
  const weekCount = sessions.filter(s => {
    const d = new Date(); d.setDate(d.getDate() - 7)
    return new Date(s.created_at) > d
  }).length

  return (
    <div style={{ padding: '28px 28px 120px', maxWidth: '720px' }}>

      {/* ── Streak & Stats ── */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <div style={{
          flex: 2,
          background: streak > 0 ? 'rgba(108,99,255,0.08)' : 'rgba(8,18,34,0.7)',
          border: `1px solid ${streak > 0 ? 'rgba(108,99,255,0.2)' : 'rgba(255,255,255,0.07)'}`,
          borderRadius: '12px', padding: '16px',
        }}>
          <p style={{ fontSize: '32px', color: streak > 0 ? '#A09AFF' : '#4A5A7A', fontWeight: 600, lineHeight: 1, marginBottom: '4px' }}>
            {streak}{streak > 0 ? ' 🔥' : ''}
          </p>
          <p style={{ fontSize: '10px', color: 'var(--text-dim)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Day Streak
          </p>
        </div>
        {[
          { label: 'Total', value: sessions.length },
          { label: 'This Week', value: weekCount },
          { label: 'Best', value: `${bestStreak}d` },
        ].map(s => (
          <div key={s.label} style={{
            flex: 1,
            background: 'rgba(8,18,34,0.7)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '12px', padding: '16px',
            textAlign: 'center',
          }}>
            <p style={{ fontSize: '20px', color: '#C8D4F0', fontWeight: 500, lineHeight: 1, marginBottom: '4px' }}>{s.value}</p>
            <p style={{ fontSize: '10px', color: 'var(--text-dim)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Charts Card ── */}
      <div style={{
        background: 'rgba(8,18,34,0.7)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '12px',
        padding: '18px 20px',
      }}>
        <ActivityChart sessions={sessions} />
        <MoodTrendChart sessions={sessions} />
        <MoodDistribution sessions={sessions} />
      </div>

      {/* ── AI Insight ── */}
      <InsightMessage sessions={sessions} />

      {/* ── History ── */}
      <SessionHistory sessions={sessions} />
    </div>
  )
}
