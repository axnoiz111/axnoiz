import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, Square, Trash2, Music } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

interface AudioFile {
  id: string
  script_id: string | null
  script_title: string
  storage_path: string
  duration_seconds: number | null
  created_at: string
}

const MOODS = [
  { value: 'okay',    label: 'Okay',       color: '#8B9DC3' },
  { value: 'good',    label: 'Good',       color: '#FFB347' },
  { value: 'great',   label: 'Great',      color: '#6C63FF' },
  { value: 'amazing', label: 'Amazing ✨', color: '#4CAF82' },
]

function formatDuration(secs: number | null) {
  if (!secs) return '—'
  return `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`
}

// ── Mood Sheet (post-session) ─────────────────────────────────────────────────

interface MoodSheetProps {
  cycleCount: number
  audioTitles: string[]
  onDone: (mood: string, note: string) => void
  onSkip: () => void
}

function SessionMoodSheet({ cycleCount, audioTitles, onDone, onSkip }: MoodSheetProps) {
  const [mood, setMood] = useState<string | null>(null)
  const [note, setNote] = useState('')

  const summary = audioTitles.length === 1
    ? audioTitles[0]
    : `${audioTitles.length} audios · ${cycleCount} cycle${cycleCount !== 1 ? 's' : ''}`

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 28, stiffness: 300 }}
      style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: '#060E1E',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '18px 18px 0 0',
        padding: '24px 24px 48px',
        zIndex: 50,
        maxWidth: '100vw',
      }}
    >
      <div style={{ width: '36px', height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.1)', margin: '0 auto 24px' }} />

      <p style={{ fontSize: '15px', color: '#F0F4FF', textAlign: 'center', marginBottom: '4px' }}>How do you feel?</p>
      <p style={{ fontSize: '12px', color: 'var(--text-dim)', textAlign: 'center', marginBottom: '20px' }}>
        After listening to {summary}
      </p>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {MOODS.map(m => (
          <button key={m.value} onClick={() => setMood(m.value)} style={{
            flex: 1, padding: '12px 4px',
            background: mood === m.value ? `${m.color}22` : 'rgba(255,255,255,0.03)',
            border: `1px solid ${mood === m.value ? m.color : 'rgba(255,255,255,0.08)'}`,
            borderRadius: '10px',
            color: mood === m.value ? m.color : 'var(--text-muted)',
            fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit',
            transition: 'all 0.15s',
          }}>
            {m.label}
          </button>
        ))}
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
          What did you feel or decide? <span style={{ color: 'var(--text-dim)', fontSize: '10px' }}>(optional)</span>
        </label>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="A realisation, a decision, a shift you noticed…"
          rows={2}
          style={{
            width: '100%', background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '8px', padding: '12px',
            color: '#F0F4FF', fontSize: '13px',
            outline: 'none', resize: 'none',
            fontFamily: 'inherit', boxSizing: 'border-box',
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => mood && onDone(mood, note.trim())}
          disabled={!mood}
          style={{
            flex: 1, padding: '14px',
            background: mood ? 'linear-gradient(135deg, #6C63FF, #8B83FF)' : 'rgba(108,99,255,0.15)',
            border: 'none', borderRadius: '10px',
            color: mood ? '#fff' : 'var(--text-dim)',
            fontSize: '13px', fontWeight: 600,
            cursor: mood ? 'pointer' : 'not-allowed',
            fontFamily: 'inherit',
            boxShadow: mood ? '0 0 20px rgba(108,99,255,0.3)' : 'none',
          }}
        >
          Save Session
        </motion.button>
        <button onClick={onSkip} style={{
          padding: '14px 18px', background: 'transparent',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '10px', color: 'var(--text-dim)',
          fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit',
        }}>
          Skip
        </button>
      </div>
    </motion.div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────

interface Props {
  refreshKey: number
  onSessionSaved: () => void
}

export default function AudioTab({ refreshKey, onSessionSaved }: Props) {
  const { user } = useAuth()
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([])
  const [loading, setLoading] = useState(true)
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({})

  // Session state
  const [sessionActive, setSessionActive] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loopCount, setLoopCount] = useState(0)       // total plays across all audios
  const [playTrigger, setPlayTrigger] = useState(0)   // increments every time we need to (re)play
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [showMoodSheet, setShowMoodSheet] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const audioRef = useRef<HTMLAudioElement>(null)

  // Load audio files
  useEffect(() => {
    if (!user) return
    setLoading(true)
    supabase.from('audio_files').select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setAudioFiles(data ?? [])
        setLoading(false)
      })
  }, [user, refreshKey])

  // Pre-load all signed URLs
  useEffect(() => {
    if (audioFiles.length === 0) return
    audioFiles.forEach(af => {
      supabase.storage.from('audio-files').createSignedUrl(af.storage_path, 3600)
        .then(({ data }) => {
          if (data?.signedUrl) setSignedUrls(prev => ({ ...prev, [af.id]: data.signedUrl }))
        })
    })
  }, [audioFiles])

  // Fire whenever playTrigger increments — loads the current track and plays it
  useEffect(() => {
    if (!sessionActive || playTrigger === 0) return
    const el = audioRef.current
    const audio = audioFiles[currentIndex]
    if (!el || !audio || !signedUrls[audio.id]) return
    el.load()
    el.play().catch(() => {})
  }, [playTrigger])

  // When signed URLs arrive for the first track, start playing
  useEffect(() => {
    if (!sessionActive) return
    const audio = audioFiles[currentIndex]
    if (!audio || !signedUrls[audio.id]) return
    const el = audioRef.current
    if (el && el.paused) el.play().catch(() => {})
  }, [signedUrls])

  const currentAudio = audioFiles[currentIndex]

  const handleTimeUpdate = () => {
    const el = audioRef.current
    if (!el || !el.duration) return
    setProgress((el.currentTime / el.duration) * 100)
  }

  const handleEnded = () => {
    const nextIndex = (currentIndex + 1) % audioFiles.length
    setLoopCount(c => c + 1)
    setProgress(0)
    setCurrentIndex(nextIndex)
    setTimeout(() => setPlayTrigger(t => t + 1), 1500)
  }

  const startSession = () => {
    if (audioFiles.length === 0) return
    setCurrentIndex(0)
    setLoopCount(0)
    setProgress(0)
    setPlayTrigger(0)
    setSessionActive(true)
  }

  const togglePlayPause = () => {
    const el = audioRef.current
    if (!el) return
    if (isPlaying) { el.pause() } else { el.play().catch(() => {}) }
  }

  const stopSession = () => {
    audioRef.current?.pause()
    setIsPlaying(false)
    setSessionActive(false)
    setShowMoodSheet(true)
  }

  const handleSessionSave = async (mood: string, note: string) => {
    if (!user) return
    setShowMoodSheet(false)
    const titles = audioFiles.map(a => a.script_title)
    await supabase.from('listening_sessions').insert({
      user_id: user.id,
      audio_id: currentAudio?.id ?? null,
      audio_title: titles.length === 1 ? titles[0] : `${titles.length} audios`,
      loops_completed: loopCount,
      mood_after: mood,
      action_step: note || null,
    })
    onSessionSaved()
  }

  const handleSessionSkip = async () => {
    if (!user) return
    setShowMoodSheet(false)
    if (loopCount > 0) {
      await supabase.from('listening_sessions').insert({
        user_id: user.id,
        audio_id: currentAudio?.id ?? null,
        audio_title: audioFiles.length === 1 ? audioFiles[0].script_title : `${audioFiles.length} audios`,
        loops_completed: loopCount,
      })
      onSessionSaved()
    }
  }

  const handleDelete = async (af: AudioFile) => {
    if (!user || sessionActive) return
    setDeleting(af.id)
    await supabase.storage.from('audio-files').remove([af.storage_path])
    await supabase.from('audio_files').delete().eq('id', af.id).eq('user_id', user.id)
    setAudioFiles(prev => prev.filter(a => a.id !== af.id))
    setDeleting(null)
  }

  if (loading) {
    return <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '13px' }}>Loading...</div>
  }

  if (audioFiles.length === 0) {
    return (
      <div style={{ padding: '40px 28px' }}>
        <div style={{ border: '1px dashed rgba(255,255,255,0.07)', borderRadius: '14px', padding: '56px 24px', textAlign: 'center' }}>
          <p style={{ fontSize: '15px', color: 'var(--text-muted)', marginBottom: '8px' }}>No audio yet.</p>
          <p style={{ fontSize: '13px', color: 'var(--text-dim)', lineHeight: 1.7 }}>
            Go to Scripts and tap "Convert to Audio"<br />on any script to create your first recording.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '28px 28px 120px', maxWidth: '720px', position: 'relative' }}>

      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={currentAudio ? signedUrls[currentAudio.id] : undefined}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        style={{ display: 'none' }}
      />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '17px', color: '#C8D4F0', fontWeight: 400 }}>Your Audio</h2>
        <span style={{
          fontSize: '11px', color: 'var(--text-dim)',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.07)',
          padding: '3px 10px', borderRadius: '9999px', letterSpacing: '0.07em',
        }}>
          {audioFiles.length} / 5
        </span>
      </div>

      {/* ── SESSION ACTIVE ── */}
      <AnimatePresence mode="wait">
        {sessionActive ? (
          <motion.div key="session"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {/* Session stats bar */}
            <div style={{
              display: 'flex', gap: '10px', marginBottom: '16px',
            }}>
              {[
                { label: 'Loops', value: loopCount },
                { label: 'Track', value: `${currentIndex + 1} / ${audioFiles.length}` },
              ].map(s => (
                <div key={s.label} style={{
                  flex: 1, textAlign: 'center',
                  background: 'rgba(108,99,255,0.07)',
                  border: '1px solid rgba(108,99,255,0.15)',
                  borderRadius: '10px', padding: '10px 8px',
                }}>
                  <p style={{ fontSize: '18px', color: '#A09AFF', fontWeight: 500, marginBottom: '2px' }}>{s.value}</p>
                  <p style={{ fontSize: '10px', color: 'var(--text-dim)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Now Playing card */}
            <div style={{
              background: 'rgba(8,18,34,0.9)',
              border: '1px solid rgba(108,99,255,0.2)',
              borderRadius: '14px',
              padding: '20px',
              marginBottom: '12px',
              boxShadow: '0 0 40px rgba(108,99,255,0.08)',
            }}>
              <p style={{ fontSize: '10px', color: '#6C63FF', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '8px' }}>
                ● Now Playing
              </p>
              <p style={{ fontSize: '16px', color: '#F0F4FF', fontWeight: 500, marginBottom: '4px' }}>
                {currentAudio?.script_title ?? '—'}
              </p>
              <p style={{ fontSize: '11px', color: 'var(--text-dim)', marginBottom: '16px' }}>
                {formatDuration(currentAudio?.duration_seconds ?? null)}
              </p>

              {/* Progress bar */}
              <div style={{ height: '3px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', marginBottom: '18px' }}>
                <motion.div
                  style={{ height: '100%', borderRadius: '2px', background: 'linear-gradient(90deg, #6C63FF, #8B83FF)' }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>

              {/* Controls */}
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <motion.button
                  whileTap={{ scale: 0.94 }}
                  onClick={togglePlayPause}
                  style={{
                    width: '44px', height: '44px', borderRadius: '50%',
                    background: 'rgba(108,99,255,0.22)',
                    border: '1px solid rgba(108,99,255,0.35)',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#A09AFF',
                  }}
                >
                  {isPlaying ? <Pause size={16} fill="white" /> : <Play size={16} fill="white" style={{ marginLeft: '2px' }} />}
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={stopSession}
                  style={{
                    flex: 1, padding: '12px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '10px',
                    color: 'var(--text-muted)', fontSize: '12px',
                    cursor: 'pointer', fontFamily: 'inherit',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  }}
                >
                  <Square size={12} />
                  Stop Session
                </motion.button>
              </div>
            </div>

            {/* Queue */}
            <p style={{ fontSize: '10px', color: 'var(--text-dim)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '8px', marginTop: '16px' }}>
              Queue — loops continuously
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {audioFiles.map((af, i) => (
                <div key={af.id} style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '10px 14px',
                  background: i === currentIndex ? 'rgba(108,99,255,0.08)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${i === currentIndex ? 'rgba(108,99,255,0.2)' : 'rgba(255,255,255,0.05)'}`,
                  borderRadius: '8px',
                  transition: 'all 0.2s',
                }}>
                  <span style={{ fontSize: '11px', color: i === currentIndex ? '#6C63FF' : 'var(--text-dim)', width: '16px', textAlign: 'center' }}>
                    {i === currentIndex ? '♫' : i + 1}
                  </span>
                  <p style={{ flex: 1, fontSize: '13px', color: i === currentIndex ? '#C8D4F0' : '#6A7A9A' }}>
                    {af.script_title}
                  </p>
                  <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{formatDuration(af.duration_seconds)}</span>
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div key="browse"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Start Session CTA */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={startSession}
              style={{
                width: '100%', padding: '16px',
                background: 'linear-gradient(135deg, rgba(108,99,255,0.2), rgba(139,131,255,0.12))',
                border: '1px solid rgba(108,99,255,0.3)',
                borderRadius: '12px',
                color: '#C8C4FF', fontSize: '13px', fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                marginBottom: '16px',
                boxShadow: '0 0 30px rgba(108,99,255,0.1)',
                letterSpacing: '0.05em',
              }}
              animate={{ boxShadow: ['0 0 20px rgba(108,99,255,0.1)', '0 0 40px rgba(108,99,255,0.2)', '0 0 20px rgba(108,99,255,0.1)'] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            >
              <Play size={15} fill="currentColor" />
              Start Listening Session
            </motion.button>

            {/* Audio list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {audioFiles.map((af, i) => (
                <motion.div
                  key={af.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  style={{
                    background: 'rgba(8,18,34,0.7)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '10px',
                    padding: '14px 16px',
                    display: 'flex', alignItems: 'center', gap: '12px',
                  }}
                >
                  <div style={{
                    width: '34px', height: '34px', borderRadius: '50%',
                    background: 'rgba(108,99,255,0.12)',
                    border: '1px solid rgba(108,99,255,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Music size={13} color="#6C63FF" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '13px', color: '#C8D4F0' }}>{af.script_title}</p>
                    <p style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                      {formatDuration(af.duration_seconds)} · {new Date(af.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(af)}
                    disabled={!!deleting}
                    style={{
                      background: 'none', border: 'none',
                      color: 'var(--text-dim)', cursor: 'pointer', padding: '4px',
                      opacity: deleting === af.id ? 0.3 : 0.6,
                      transition: 'opacity 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#CC6666')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-dim)')}
                  >
                    <Trash2 size={13} />
                  </button>
                </motion.div>
              ))}
            </div>

            <p style={{ fontSize: '11px', color: 'var(--text-dim)', textAlign: 'center', marginTop: '28px', lineHeight: 1.7, fontStyle: 'italic' }}>
              Listen with intention. Let the words reach deeper than thought.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mood Sheet */}
      <AnimatePresence>
        {showMoodSheet && (
          <SessionMoodSheet
            cycleCount={loopCount}
            audioTitles={audioFiles.map(a => a.script_title)}
            onDone={handleSessionSave}
            onSkip={handleSessionSkip}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
