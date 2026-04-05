import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, RotateCcw, Trash2 } from 'lucide-react'
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

type LoopMode = 1 | 3 | 5 | -1 // -1 = infinite

const LOOP_LABELS: Record<number, string> = { 1: '1×', 3: '3×', 5: '5×', [-1]: '∞' }
const LOOP_SEQUENCE: LoopMode[] = [1, 3, 5, -1]

const MOODS = [
  { value: 'okay', label: 'Okay', color: '#8B9DC3' },
  { value: 'good', label: 'Good', color: '#FFB347' },
  { value: 'great', label: 'Great', color: '#6C63FF' },
  { value: 'amazing', label: 'Amazing ✨', color: '#4CAF82' },
]

function formatDuration(secs: number | null) {
  if (!secs) return '—'
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

interface MoodSheetProps {
  audioTitle: string
  audioId: string
  onDone: () => void
}

function MoodSheet({ audioTitle, audioId, onDone }: MoodSheetProps) {
  const { user } = useAuth()
  const [mood, setMood] = useState<string | null>(null)
  const [actionStep, setActionStep] = useState('')
  const [saving, setSaving] = useState(false)

  const handleDone = async () => {
    if (!user || !mood) return
    setSaving(true)
    await supabase.from('listening_sessions').insert({
      user_id: user.id,
      audio_id: audioId,
      audio_title: audioTitle,
      loops_completed: 1,
      mood_after: mood,
      action_step: actionStep.trim() || null,
    })
    setSaving(false)
    onDone()
  }

  const handleSkip = async () => {
    if (!user) return
    await supabase.from('listening_sessions').insert({
      user_id: user.id,
      audio_id: audioId,
      audio_title: audioTitle,
      loops_completed: 1,
    })
    onDone()
  }

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 28, stiffness: 300 }}
      style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: '#060E1E',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '14px 14px 0 0',
        padding: '24px 20px 40px',
        zIndex: 10,
      }}
    >
      <div style={{
        width: '36px', height: '4px', borderRadius: '2px',
        background: 'rgba(255,255,255,0.1)',
        margin: '0 auto 20px',
      }} />

      <p style={{ fontSize: '15px', color: '#F0F4FF', textAlign: 'center', marginBottom: '4px' }}>
        How do you feel?
      </p>
      <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '20px' }}>
        After listening to "{audioTitle}"
      </p>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {MOODS.map(m => (
          <button
            key={m.value}
            onClick={() => setMood(m.value)}
            style={{
              flex: 1, padding: '12px 4px',
              background: mood === m.value ? `${m.color}22` : 'rgba(255,255,255,0.03)',
              border: `1px solid ${mood === m.value ? m.color : 'rgba(255,255,255,0.08)'}`,
              borderRadius: '10px',
              color: mood === m.value ? m.color : 'var(--text-muted)',
              fontSize: '12px', cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.15s',
            }}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
          One step you took today <span style={{ color: 'var(--text-dim)', fontSize: '10px' }}>(optional)</span>
        </label>
        <textarea
          value={actionStep}
          onChange={e => setActionStep(e.target.value)}
          placeholder="What did you do today toward your goal?"
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
          onClick={handleDone}
          disabled={!mood || saving}
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
          {saving ? 'Saving...' : 'Done'}
        </motion.button>
        <button
          onClick={handleSkip}
          style={{
            padding: '14px 18px',
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '10px',
            color: 'var(--text-dim)', fontSize: '12px',
            cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          Skip
        </button>
      </div>
    </motion.div>
  )
}

interface PlayerProps {
  audio: AudioFile
  onDelete: (id: string) => void
  onSessionSaved: () => void
}

function AudioPlayerCard({ audio, onDelete, onSessionSaved }: PlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [loopMode, setLoopMode] = useState<LoopMode>(1)
  const [loopsDone, setLoopsDone] = useState(0)
  const [showMoodSheet, setShowMoodSheet] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [signedUrl, setSignedUrl] = useState<string | null>(null)
  const { user } = useAuth()

  // Generate a fresh signed URL on mount (1-hour expiry)
  useEffect(() => {
    supabase.storage
      .from('audio-files')
      .createSignedUrl(audio.storage_path, 3600)
      .then(({ data }) => { if (data?.signedUrl) setSignedUrl(data.signedUrl) })
  }, [audio.storage_path])

  const cycleLoop = () => {
    const idx = LOOP_SEQUENCE.indexOf(loopMode)
    setLoopMode(LOOP_SEQUENCE[(idx + 1) % LOOP_SEQUENCE.length])
  }

  const handleTimeUpdate = () => {
    const el = audioRef.current
    if (!el || !el.duration) return
    setProgress((el.currentTime / el.duration) * 100)
  }

  const handleEnded = () => {
    const next = loopsDone + 1
    if (loopMode === -1 || next < loopMode) {
      setLoopsDone(next)
      audioRef.current?.play()
    } else {
      setPlaying(false)
      setLoopsDone(0)
      setProgress(0)
      setShowMoodSheet(true)
    }
  }

  const togglePlay = () => {
    const el = audioRef.current
    if (!el) return
    if (playing) {
      el.pause()
      setPlaying(false)
      // show mood sheet when manually stopping mid-play
      if (el.currentTime > 5) setShowMoodSheet(true)
    } else {
      el.play().catch(() => {})
      setPlaying(true)
    }
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = audioRef.current
    if (!el || !el.duration) return
    const rect = (e.target as HTMLElement).getBoundingClientRect()
    const x = e.clientX - rect.left
    const pct = x / rect.width
    el.currentTime = pct * el.duration
    setProgress(pct * 100)
  }

  const handleDelete = async () => {
    if (!user) return
    setDeleting(true)
    await supabase.from('audio_files').delete().eq('id', audio.id).eq('user_id', user.id)
    onDelete(audio.id)
  }

  const loopLabel = loopMode === -1
    ? '∞ loop'
    : loopMode === 1
    ? '1× play'
    : `${loopsDone + 1} / ${loopMode} loops`

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{
        background: 'rgba(8,18,34,0.7)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '12px',
        padding: '18px',
      }}>
        {/* Title */}
        <p style={{ fontSize: '14px', color: '#F0F4FF', fontWeight: 500, marginBottom: '4px' }}>
          {audio.script_title}
        </p>
        <p style={{ fontSize: '11px', color: '#4A5A7A', marginBottom: '16px' }}>
          {formatDuration(audio.duration_seconds)} · {new Date(audio.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </p>

        {/* Progress bar */}
        <div
          onClick={handleProgressClick}
          style={{
            height: '3px', background: 'rgba(255,255,255,0.06)',
            borderRadius: '2px', marginBottom: '16px', cursor: 'pointer', position: 'relative',
          }}
        >
          <div style={{
            height: '100%', borderRadius: '2px',
            background: 'linear-gradient(90deg, #6C63FF, #8B83FF)',
            width: `${progress}%`,
            transition: playing ? 'none' : 'width 0.1s',
          }} />
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Play/Pause */}
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={togglePlay}
            disabled={!signedUrl}
            style={{
              width: '40px', height: '40px', borderRadius: '50%',
              background: 'rgba(108,99,255,0.22)',
              border: '1px solid rgba(108,99,255,0.3)',
              cursor: signedUrl ? 'pointer' : 'wait',
              opacity: signedUrl ? 1 : 0.5,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#A09AFF',
            }}
          >
            {playing ? <Pause size={16} fill="white" /> : <Play size={16} fill="white" style={{ marginLeft: '2px' }} />}
          </motion.button>

          {/* Loop toggle */}
          <button
            onClick={cycleLoop}
            style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '8px', padding: '7px 12px',
              color: 'var(--text-muted)', fontSize: '12px',
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            <RotateCcw size={12} />
            {LOOP_LABELS[loopMode]}
          </button>

          <span style={{ fontSize: '11px', color: 'var(--text-dim)', marginLeft: 'auto' }}>
            {loopLabel}
          </span>

          {/* Delete */}
          <button
            onClick={handleDelete}
            disabled={deleting}
            style={{
              background: 'none', border: 'none',
              color: 'var(--text-dim)', cursor: 'pointer', padding: '4px',
              opacity: deleting ? 0.4 : 1,
            }}
            title="Delete audio"
          >
            <Trash2 size={14} />
          </button>
        </div>

        {/* Hidden audio element — uses signed URL from Supabase Storage */}
        <audio
          ref={audioRef}
          src={signedUrl ?? undefined}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          style={{ display: 'none' }}
        />
      </div>

      {/* Mood sheet */}
      <AnimatePresence>
        {showMoodSheet && (
          <MoodSheet
            audioTitle={audio.script_title}
            audioId={audio.id}
            onDone={() => { setShowMoodSheet(false); onSessionSaved() }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

interface Props {
  refreshKey: number
  onSessionSaved: () => void
}

export default function AudioTab({ refreshKey, onSessionSaved }: Props) {
  const { user } = useAuth()
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    setLoading(true)
    supabase
      .from('audio_files')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setAudioFiles(data ?? [])
        setLoading(false)
      })
  }, [user, refreshKey])

  const handleDelete = (id: string) => {
    setAudioFiles(prev => prev.filter(a => a.id !== id))
  }

  if (loading) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '13px' }}>
        Loading...
      </div>
    )
  }

  if (audioFiles.length === 0) {
    return (
      <div style={{ padding: '40px 28px' }}>
        <div style={{
          border: '1px dashed rgba(255,255,255,0.07)',
          borderRadius: '14px', padding: '56px 24px',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: '15px', color: 'var(--text-muted)', marginBottom: '8px' }}>No audio yet.</p>
          <p style={{ fontSize: '13px', color: 'var(--text-dim)', lineHeight: 1.7 }}>
            Go to Scripts and tap "Convert to Audio"<br />on any script to create your first recording.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '28px 28px 120px', maxWidth: '720px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '17px', color: '#C8D4F0', fontWeight: 400 }}>Your Audio</h2>
        <span style={{
          fontSize: '11px', color: 'var(--text-dim)',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.07)',
          padding: '3px 10px', borderRadius: '9999px',
          letterSpacing: '0.07em',
        }}>
          {audioFiles.length} / 5
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {audioFiles.map((audio, i) => (
          <motion.div
            key={audio.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
          >
            <AudioPlayerCard
              audio={audio}
              onDelete={handleDelete}
              onSessionSaved={onSessionSaved}
            />
          </motion.div>
        ))}
      </div>

      <p style={{ fontSize: '11px', color: 'var(--text-dim)', textAlign: 'center', marginTop: '28px', lineHeight: 1.7, fontStyle: 'italic' }}>
        Listen with intention. Let the words reach deeper than thought.
      </p>
    </div>
  )
}
