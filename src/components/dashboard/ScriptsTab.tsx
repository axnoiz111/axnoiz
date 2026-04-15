import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, Trash2, Headphones, Check } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

function UpgradeBanner() {
  return (
    <div style={{
      background: 'rgba(108,99,255,0.07)',
      border: '1px solid rgba(108,99,255,0.2)',
      borderRadius: '10px',
      padding: '16px 18px',
      textAlign: 'center',
      marginBottom: '14px',
    }}>
      <p style={{ fontSize: '13px', color: '#C8C4FF', marginBottom: '6px', fontWeight: 500 }}>
        You've used your 1 free audio
      </p>
      <p style={{ fontSize: '12px', color: '#7A7AAA', lineHeight: 1.6, marginBottom: '12px' }}>
        Upgrade to Pro for 5 audio conversions every month — costs less than a RedBull, but this one actually helps you fly towards your desires.
      </p>
      <button style={{
        background: 'linear-gradient(135deg, #6C63FF, #8B83FF)',
        border: 'none', borderRadius: '8px',
        padding: '10px 28px',
        color: '#fff', fontSize: '12px', fontWeight: 600,
        letterSpacing: '0.08em', cursor: 'pointer',
        fontFamily: 'inherit',
        boxShadow: '0 0 20px rgba(108,99,255,0.3)',
      }}>
        Upgrade to Pro — ₹99/month
      </button>
    </div>
  )
}

const S = {
  card: 'rgba(8,18,34,0.7)',
  border: 'rgba(255,255,255,0.07)',
  text: 'var(--text)',
  muted: 'var(--text-muted)',
  dim: 'var(--text-dim)',
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
  const [expandedId, setExpandedId]         = useState<string | null>(null)
  const [deletingId, setDeletingId]         = useState<string | null>(null)
  const [convertingId, setConvertingId]     = useState<string | null>(null)
  const [audioScriptIds, setAudioScriptIds] = useState<Set<string>>(new Set())
  const [audioCount, setAudioCount]         = useState(0)
  const [error, setError]                   = useState('')
  const [showUpgrade, setShowUpgrade]       = useState(false)

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
    setError('')
    setShowUpgrade(false)
    setConvertingId(script.id)

    try {
      const { data, error: fnErr } = await supabase.functions.invoke('generate-audio', {
        body: { script_id: script.id, text: script.content },
      })
      if (fnErr) {
        let errPayload: { error?: string } = {}
        try {
          errPayload = await (fnErr as { context?: { json?: () => Promise<{ error?: string }> } }).context?.json?.() ?? {}
        } catch { /* ignore */ }
        if (errPayload?.error === 'upgrade_required') {
          setShowUpgrade(true)
          return
        }
        throw new Error(errPayload?.error ?? fnErr.message ?? 'Failed to generate audio.')
      }
      if (data?.error === 'upgrade_required') {
        setShowUpgrade(true)
        return
      }
      if (data?.error) throw new Error(data.error)

      setAudioScriptIds(prev => new Set([...prev, script.id]))
      setAudioCount(c => c + 1)
      onAudioGenerated()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to generate audio.')
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

      {showUpgrade && <UpgradeBanner />}
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
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                    }}>
                      {script.content
                        .split(/(?<=[.!?])\s+/)
                        .filter(s => s.trim())
                        .map((sentence, i) => (
                          <p key={i} style={{
                            fontSize: '14px', color: '#9AAAC8',
                            lineHeight: 1.85, margin: 0,
                            fontFamily: 'Georgia, serif',
                            borderLeft: '2px solid rgba(108,99,255,0.2)',
                            paddingLeft: '14px',
                          }}>
                            {sentence.trim()}
                          </p>
                        ))
                      }
                    </div>

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
                      ) : (
                        <button
                          onClick={() => handleConvertToAudio(script)}
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
                            opacity: audioCount >= 5 ? 0.4 : 1,
                          }}
                        >
                          <Headphones size={13} />
                          {convertingId === script.id ? 'Generating...' : 'Convert to Audio'}
                        </button>
                      )}

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
