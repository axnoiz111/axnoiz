import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

interface Session {
  id: string
  audio_title: string
  loops_completed: number
  completed_at: string
  mood_after: string | null
  action_step: string | null
}

const MOOD_CONFIG: Record<string, { label: string; color: string }> = {
  okay:    { label: 'Okay',    color: '#8B9DC3' },
  good:    { label: 'Good',    color: '#FFB347' },
  great:   { label: 'Great',   color: '#6C63FF' },
  amazing: { label: 'Amazing', color: '#4CAF82' },
}

function MoodBadge({ mood }: { mood: string | null }) {
  if (!mood) return null
  const cfg = MOOD_CONFIG[mood] ?? { label: mood, color: '#4A5A7A' }
  return (
    <span style={{
      fontSize: '10px', padding: '3px 8px', borderRadius: '9999px',
      background: `${cfg.color}18`,
      border: `1px solid ${cfg.color}40`,
      color: cfg.color, letterSpacing: '0.06em',
    }}>
      {cfg.label}
    </span>
  )
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days === 1) return 'yesterday'
  if (days < 7) return `${days} days ago`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function thisWeekCount(sessions: Session[]) {
  const start = new Date()
  start.setDate(start.getDate() - 7)
  return sessions.filter(s => new Date(s.completed_at) > start).length
}

function MoodBar({ sessions }: { sessions: Session[] }) {
  const withMood = sessions.filter(s => s.mood_after)
  if (withMood.length < 3) return null
  const counts: Record<string, number> = { okay: 0, good: 0, great: 0, amazing: 0 }
  withMood.forEach(s => { if (s.mood_after) counts[s.mood_after] = (counts[s.mood_after] || 0) + 1 })
  const total = withMood.length

  return (
    <div style={{
      background: 'rgba(8,18,34,0.7)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '10px',
      padding: '16px 18px',
      marginBottom: '16px',
    }}>
      <p style={{ fontSize: '11px', color: '#4A5A7A', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '12px' }}>
        Mood Distribution
      </p>
      <div style={{ display: 'flex', height: '8px', borderRadius: '4px', overflow: 'hidden', gap: '2px', marginBottom: '10px' }}>
        {Object.entries(counts).map(([key, count]) => {
          if (!count) return null
          const cfg = MOOD_CONFIG[key]
          return (
            <div
              key={key}
              style={{ flex: count / total, background: cfg.color, borderRadius: '2px' }}
              title={`${cfg.label}: ${count}`}
            />
          )
        })}
      </div>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        {Object.entries(counts).map(([key, count]) => {
          if (!count) return null
          const cfg = MOOD_CONFIG[key]
          const pct = Math.round((count / total) * 100)
          return (
            <span key={key} style={{ fontSize: '11px', color: '#4A5A7A' }}>
              <span style={{ color: cfg.color }}>{cfg.label}</span> {pct}%
            </span>
          )
        })}
      </div>
    </div>
  )
}

interface Props {
  refreshKey: number
}

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
      .order('completed_at', { ascending: false })
      .limit(30)
      .then(({ data }) => {
        setSessions(data ?? [])
        setLoading(false)
      })
  }, [user, refreshKey])

  if (loading) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', color: '#4A5A7A', fontSize: '13px' }}>
        Loading...
      </div>
    )
  }

  if (sessions.length === 0) {
    return (
      <div style={{ padding: '40px 28px' }}>
        <div style={{
          border: '1px dashed rgba(255,255,255,0.07)',
          borderRadius: '14px', padding: '56px 24px',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: '15px', color: '#8A9ABE', marginBottom: '8px' }}>Nothing tracked yet.</p>
          <p style={{ fontSize: '13px', color: '#2E3D5A', lineHeight: 1.7 }}>
            Complete your first listening session<br />and your progress will appear here.
          </p>
        </div>
      </div>
    )
  }

  const weekCount = thisWeekCount(sessions)
  const lastSession = sessions[0]

  return (
    <div style={{ padding: '28px 28px 120px', maxWidth: '720px' }}>
      <h2 style={{ fontSize: '17px', color: '#C8D4F0', fontWeight: 400, marginBottom: '20px' }}>Your Progress</h2>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
        {[
          { label: 'Total listens', value: sessions.length },
          { label: 'This week', value: weekCount },
          { label: 'Last session', value: timeAgo(lastSession.completed_at), small: true },
        ].map(stat => (
          <div key={stat.label} style={{
            flex: 1,
            background: 'rgba(8,18,34,0.7)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '10px',
            padding: '14px 10px',
            textAlign: 'center',
          }}>
            <p style={{ fontSize: stat.small ? '12px' : '22px', color: '#C8D4F0', fontWeight: stat.small ? 400 : 500, marginBottom: '4px' }}>
              {stat.value}
            </p>
            <p style={{ fontSize: '10px', color: '#2E3D5A', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      <MoodBar sessions={sessions} />

      <p style={{ fontSize: '11px', color: '#2E3D5A', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '12px' }}>
        Recent Sessions
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {sessions.map((session, i) => (
          <motion.div
            key={session.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            style={{
              background: 'rgba(8,18,34,0.7)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '10px',
              padding: '13px 16px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: session.action_step ? '8px' : 0 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '13px', color: '#C8D4F0', marginBottom: '3px' }}>
                  {session.audio_title}
                </p>
                <p style={{ fontSize: '11px', color: '#2E3D5A' }}>
                  {timeAgo(session.completed_at)}
                  {session.loops_completed > 1 ? ` · ${session.loops_completed} loops` : ''}
                </p>
              </div>
              <MoodBadge mood={session.mood_after} />
            </div>
            {session.action_step && (
              <p style={{
                fontSize: '12px', color: '#6A7A9A',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.04)',
                borderRadius: '6px', padding: '8px 10px',
                lineHeight: 1.5, fontStyle: 'italic',
              }}>
                "{session.action_step}"
              </p>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}
