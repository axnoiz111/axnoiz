import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, Trash2, Headphones, Check } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

const S = {
  card: 'rgba(8,18,34,0.7)',
  border: 'rgba(255,255,255,0.07)',
  text: 'var(--text)',
  muted: 'var(--text-muted)',
  dim: 'var(--text-dim)',
}

const VOICES = [
  { id: 'onyx',    label: 'Onyx',    desc: 'Deep & resonant',   gender: 'male'    },
  { id: 'echo',    label: 'Echo',    desc: 'Clear & steady',    gender: 'male'    },
  { id: 'nova',    label: 'Nova',    desc: 'Warm & intimate',   gender: 'female'  },
  { id: 'shimmer', label: 'Shimmer', desc: 'Soft & calm',       gender: 'female'  },
  { id: 'alloy',   label: 'Alloy',   desc: 'Balanced & neutral',gender: 'neutral' },
]

function genderDefaultVoice(gender: string | null): string {
  if (gender === 'male')   return 'onyx'
  if (gender === 'female') return 'nova'
  return 'alloy'
}

interface Script {
  id: string
  title: string
  content: string
  goal_text: string
  created_at: string
}

interface AudioFile {
  script_id: string | null
}

interface Props {
  scripts: Script[]
  onScriptsChange: (scripts: Script[]) => void
  onAudioGenerated: () => void
}

export default function ScriptsTab({ scripts, onScriptsChange, onAudioGenerated }: Props) {
  const { user } = useAuth()
  const [expandedId, setExpandedId]       = useState<string | null>(null)
  const [deletingId, setDeletingId]       = useState<string | null>(null)
  const [convertingId, setConvertingId]   = useState<string | null>(null)
  const [audioScriptIds, setAudioScriptIds] = useState<Set<string>>(new Set())
  const [audioCount, setAudioCount]       = useState(0)
  const [error, setError]                 = useState('')

  // Voice picker state
  const [voicePickerScriptId, setVoicePickerScriptId] = useState<string | null>(null)
  const [selectedVoice, setSelectedVoice] = useState('alloy')
  const [userGender, setUserGender]       = useState<string | null>(null)

  // Load existing audio files
  useEffect(() => {
    if (!user) return
    supabase
      .from('audio_files')
      .select('script_id')
      .eq('user_id', user.id)
      .then(({ data }) => {
        if (data) {
          const ids = new Set(data.map((a: AudioFile) => a.script_id).filter(Boolean) as string[])
          setAudioScriptIds(ids)
          setAudioCount(data.length)
        }
      })
  }, [user])

  // Load user gender to pre-select voice
  useEffect(() => {
    if (!user) return
    supabase
      .from('profiles')
      .select('gender')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        const gender = data?.gender ?? null
        setUserGender(gender)
        setSelectedVoice(genderDefaultVoice(gender))
      })
  }, [user])

  const openVoicePicker = (scriptId: string) => {
    setVoicePickerScriptId(scriptId)
    setSelectedVoice(genderDefaultVoice(userGender))
    setError('')
  }

  const handleDelete = async (id: string) => {
    if (!user) return
    setDeletingId(id)
    const { error: err } = await supabase
      .from('scripts')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    setDeletingId(null)
    if (!err) {
      onScriptsChange(scripts.filter(s => s.id !== id))
      if (expandedId === id) setExpandedId(null)
    }
  }

  const handleConvertToAudio = async (script: Script) => {
    if (!user) return
    if (audioCount >= 5) {
      setError('You have 5 audio files saved. Delete one from the Audio tab to generate a new one.')
      return
    }
    setError('')
    setConvertingId(script.id)
    setVoicePickerScriptId(null)

    try {
      const { data, error: fnErr } = await supabase.functions.invoke('generate-audio', {
        body: { script_id: script.id, text: script.content, voice: selectedVoice },
      })
      if (fnErr) throw fnErr
      if (data?.error) throw new Error(data.error)

      setAudioScriptIds(prev => new Set([...prev, script.id]))
      setAudioCount(c => c + 1)
      onAudioGenerated()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to generate audio. Please try again.')
    } finally {
      setConvertingId(null)
    }
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  if (scripts.length === 0) {
    return (
      <div style={{ padding: '40px 28px' }}>
        <div style={{
          border: '1px dashed rgba(255,255,255,0.07)',
          borderRadius: '14px', padding: '56px 24px',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: '15px', color: '#8A9ABE', marginBottom: '8px' }}>No scripts yet.</p>
          <p style={{ fontSize: '13px', color: S.dim, lineHeight: 1.7 }}>
            Go to Home and tell the system what you desire.<br />Your script will appear here automatically.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '28px 28px 120px', maxWidth: '720px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '17px', color: '#C8D4F0', fontWeight: 400 }}>Your Scripts</h2>
        <span style={{
          fontSize: '11px', color: S.dim,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.07)',
          padding: '3px 10px', borderRadius: '9999px',
          letterSpacing: '0.07em',
        }}>
          {scripts.length} / 10
        </span>
      </div>

      {error && (
        <p style={{ fontSize: '12px', color: '#CC6666', marginBottom: '14px' }}>{error}</p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {[...scripts].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((script, i) => (
          <motion.div
            key={script.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            style={{
              background: S.card,
              border: `1px solid ${S.border}`,
              borderRadius: '12px',
              overflow: 'hidden',
            }}
          >
            {/* Header row */}
            <div
              onClick={() => setExpandedId(expandedId === script.id ? null : script.id)}
              style={{
                padding: '14px 16px', cursor: 'pointer',
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                gap: '12px',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '14px', color: S.text, marginBottom: '4px' }}>
                  {script.title}
                </p>
                <p style={{ fontSize: '11px', color: S.dim }}>
                  {formatDate(script.created_at)} · {script.goal_text.slice(0, 52)}{script.goal_text.length > 52 ? '…' : ''}
                </p>
              </div>
              {expandedId === script.id
                ? <ChevronUp size={15} color={S.dim} style={{ flexShrink: 0 }} />
                : <ChevronDown size={15} color={S.dim} style={{ flexShrink: 0 }} />
              }
            </div>

            {/* Expanded content */}
            <AnimatePresence>
              {expandedId === script.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.26 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div style={{ padding: '0 16px 16px' }}>
                    {/* Script content */}
                    <div style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.05)',
                      borderRadius: '8px',
                      padding: '16px',
                      marginBottom: '12px',
                      maxHeight: '240px',
                      overflowY: 'auto',
                    }}>
                      <p style={{
                        fontSize: '14px', color: '#9AAAC8',
                        lineHeight: 1.9, whiteSpace: 'pre-wrap',
                        fontFamily: 'Georgia, serif',
                      }}>
                        {script.content}
                      </p>
                    </div>

                    {/* Voice picker (shown when not yet converted) */}
                    <AnimatePresence>
                      {voicePickerScriptId === script.id && !audioScriptIds.has(script.id) && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.22 }}
                          style={{ overflow: 'hidden', marginBottom: '10px' }}
                        >
                          <div style={{
                            background: 'rgba(108,99,255,0.05)',
                            border: '1px solid rgba(108,99,255,0.15)',
                            borderRadius: '10px',
                            padding: '14px',
                          }}>
                            <p style={{ fontSize: '11px', color: '#7A8AAA', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px' }}>
                              Choose a voice
                            </p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                              {VOICES.map(v => (
                                <button
                                  key={v.id}
                                  onClick={() => setSelectedVoice(v.id)}
                                  style={{
                                    padding: '8px 14px',
                                    borderRadius: '8px',
                                    border: selectedVoice === v.id
                                      ? '1px solid rgba(108,99,255,0.6)'
                                      : '1px solid rgba(255,255,255,0.08)',
                                    background: selectedVoice === v.id
                                      ? 'rgba(108,99,255,0.18)'
                                      : 'rgba(255,255,255,0.03)',
                                    cursor: 'pointer',
                                    fontFamily: 'inherit',
                                    transition: 'all 0.15s',
                                    textAlign: 'left',
                                  }}
                                >
                                  <p style={{ fontSize: '13px', color: selectedVoice === v.id ? '#B0A8FF' : '#8A9ABE', margin: 0 }}>
                                    {v.label}
                                  </p>
                                  <p style={{ fontSize: '10px', color: '#4A5A7A', margin: 0, marginTop: '2px' }}>
                                    {v.desc}
                                  </p>
                                </button>
                              ))}
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                onClick={() => handleConvertToAudio(script)}
                                disabled={convertingId === script.id}
                                style={{
                                  flex: 1, padding: '10px',
                                  background: 'rgba(108,99,255,0.2)',
                                  border: '1px solid rgba(108,99,255,0.35)',
                                  borderRadius: '8px',
                                  color: '#9A94F0', fontSize: '12px',
                                  letterSpacing: '0.07em',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                  cursor: convertingId === script.id ? 'wait' : 'pointer',
                                  fontFamily: 'inherit',
                                }}
                              >
                                <Headphones size={13} />
                                {convertingId === script.id ? 'Generating...' : 'Generate Audio'}
                              </button>
                              <button
                                onClick={() => setVoicePickerScriptId(null)}
                                style={{
                                  padding: '10px 14px',
                                  background: 'transparent',
                                  border: '1px solid rgba(255,255,255,0.07)',
                                  borderRadius: '8px',
                                  color: S.dim, fontSize: '12px',
                                  cursor: 'pointer', fontFamily: 'inherit',
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {audioScriptIds.has(script.id) ? (
                        <div style={{
                          flex: 1, padding: '10px',
                          background: 'rgba(76,175,130,0.07)',
                          border: '1px solid rgba(76,175,130,0.15)',
                          borderRadius: '8px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                        }}>
                          <Check size={13} color="#4CAF82" />
                          <span style={{ fontSize: '12px', color: '#4CAF82' }}>Audio ready</span>
                        </div>
                      ) : voicePickerScriptId !== script.id ? (
                        <button
                          onClick={() => openVoicePicker(script.id)}
                          disabled={convertingId === script.id || audioCount >= 5}
                          style={{
                            flex: 1, padding: '10px',
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '8px',
                            color: S.muted, fontSize: '12px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                            cursor: convertingId === script.id ? 'wait' : 'pointer',
                            fontFamily: 'inherit',
                          }}
                        >
                          <Headphones size={13} />
                          {convertingId === script.id ? 'Generating...' : 'Convert to Audio'}
                        </button>
                      ) : null}

                      <button
                        onClick={() => handleDelete(script.id)}
                        disabled={deletingId === script.id}
                        style={{
                          padding: '10px 14px',
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.06)',
                          borderRadius: '8px',
                          color: S.dim, cursor: 'pointer',
                          fontFamily: 'inherit',
                          opacity: deletingId === script.id ? 0.4 : 1,
                          transition: 'color 0.15s',
                        }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#CC6666'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = S.dim}
                        title="Delete script"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
