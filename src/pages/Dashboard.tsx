import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, FileText, Headphones, BarChart2, LogOut } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import UniverseBackground from '../components/ui/UniverseBackground'
import DailyThoughtModal, { shouldShowDailyThought, markDailyThoughtSeen } from '../components/dashboard/DailyThoughtModal'
import HomeTab from '../components/dashboard/HomeTab'
import ScriptsTab from '../components/dashboard/ScriptsTab'
import AudioTab from '../components/dashboard/AudioTab'
import TrackerTab from '../components/dashboard/TrackerTab'

type Tab = 'home' | 'scripts' | 'audio' | 'tracker'

const NAV_ITEMS: { id: Tab; icon: typeof Home; label: string }[] = [
  { id: 'home',    icon: Home,       label: 'Home' },
  { id: 'scripts', icon: FileText,   label: 'Scripts' },
  { id: 'audio',   icon: Headphones, label: 'Audio' },
  { id: 'tracker', icon: BarChart2,  label: 'Tracker' },
]

interface Script {
  id: string
  title: string
  content: string
  goal_text: string
  created_at: string
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

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()

  const [tab, setTab] = useState<Tab>('home')
  const [profileName, setProfileName] = useState<string | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [showDailyThought, setShowDailyThought] = useState(false)
  const [scripts, setScripts] = useState<Script[]>([])
  const [audioRefreshKey, setAudioRefreshKey] = useState(0)
  const [trackerRefreshKey, setTrackerRefreshKey] = useState(0)

  useEffect(() => {
    if (!user) return
    supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (!data?.full_name) { navigate('/complete-profile', { replace: true }); return }
        setProfileName(data.full_name)
        setLoadingProfile(false)
      })
  }, [user])

  useEffect(() => {
    if (!user) return
    supabase
      .from('scripts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => setScripts(data ?? []))
  }, [user])

  useEffect(() => {
    if (!loadingProfile && shouldShowDailyThought()) {
      const t = setTimeout(() => setShowDailyThought(true), 800)
      return () => clearTimeout(t)
    }
  }, [loadingProfile])

  if (!user) return null

  const initials   = getInitials(profileName, user.email!)
  const firstName  = profileName?.trim().split(' ')[0] || user.email!.split('@')[0]
  const displayEmail = user.email!.length > 22 ? user.email!.slice(0, 22) + '…' : user.email!

  const handleSignOut = async () => { await signOut(); navigate('/') }

  return (
    <div className="app-layout">

      {/* ── Star background (behind everything) ── */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <UniverseBackground />
      </div>

      {/* ── Daily thought modal ── */}
      <DailyThoughtModal
        visible={showDailyThought}
        onDismiss={() => { markDailyThoughtSeen(); setShowDailyThought(false) }}
      />

      {/* ════════════════════════════════════
          LEFT SIDEBAR  (desktop only)
      ════════════════════════════════════ */}
      <aside className="app-sidebar" style={{ position: 'fixed', zIndex: 40 }}>

        {/* Logo */}
        <div style={{ padding: '24px 20px 20px' }}>
          <span className="font-display" style={{ fontSize: '20px', color: '#E8EDF8', letterSpacing: '0.06em' }}>
            AXNOIZ
          </span>
          <p style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: '4px' }}>
            Access your inner voice
          </p>
        </div>

        <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '0 16px 16px' }} />

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '0 10px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {NAV_ITEMS.map(item => {
            const Icon = item.icon
            const active = tab === item.id
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 12px', borderRadius: '8px',
                  background: active ? 'rgba(108,99,255,0.12)' : 'transparent',
                  border: 'none', cursor: 'pointer',
                  color: active ? '#A09AFF' : 'var(--text-dim)',
                  fontSize: '13px', fontFamily: 'inherit',
                  transition: 'all 0.15s',
                  width: '100%', textAlign: 'left',
                }}
                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)' }}
                onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        {/* Profile section at bottom */}
        <div style={{ padding: '12px 10px' }}>
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', marginBottom: '12px' }} />

          <button
            onClick={() => navigate('/profile')}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 12px', borderRadius: '8px',
              background: 'transparent', border: 'none',
              cursor: 'pointer', width: '100%', textAlign: 'left',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
          >
            <div style={{
              width: '30px', height: '30px', borderRadius: '50%',
              background: 'rgba(108,99,255,0.25)',
              border: '1px solid rgba(108,99,255,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              fontSize: '11px', fontWeight: 500, color: '#A09AFF',
            }}>
              {loadingProfile ? '…' : initials}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={{ fontSize: '12px', color: '#C8D4F0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {loadingProfile ? '…' : firstName}
              </p>
              <p style={{ fontSize: '10px', color: 'var(--text-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {displayEmail}
              </p>
            </div>
          </button>

          <button
            onClick={handleSignOut}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '9px 12px', borderRadius: '8px',
              background: 'transparent', border: 'none',
              cursor: 'pointer', width: '100%', textAlign: 'left',
              color: 'var(--text-dim)', fontSize: '12px', fontFamily: 'inherit',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,107,107,0.06)'; (e.currentTarget as HTMLElement).style.color = '#FF6B6B' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--text-dim)' }}
          >
            <LogOut size={14} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* ════════════════════════════════════
          MAIN CONTENT PANEL
      ════════════════════════════════════ */}
      <main className="app-main" style={{ position: 'relative', zIndex: 1 }}>

        {/* Mobile header (hidden on desktop via CSS) */}
        <header style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '16px 20px 0',
        }}>
          <span className="font-display" style={{ fontSize: '20px', color: '#E8EDF8', letterSpacing: '0.06em' }}>
            AXNOIZ
          </span>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/profile')}
            style={{
              width: '34px', height: '34px', borderRadius: '50%',
              background: 'rgba(108,99,255,0.2)',
              border: '1px solid rgba(108,99,255,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#A09AFF',
              fontSize: '12px', fontWeight: 500, fontFamily: 'inherit',
            }}
          >
            {loadingProfile ? '…' : initials}
          </motion.button>
        </header>

        {/* Tab content */}
        {tab === 'home' && (
          <HomeTab
            profileName={profileName}
            userEmail={user.email!}
            onScriptGenerated={s => setScripts(prev => [s, ...prev])}
            onGoToScripts={() => setTab('scripts')}
          />
        )}
        {tab === 'scripts' && (
          <ScriptsTab
            scripts={scripts}
            onScriptsChange={setScripts}
            onAudioGenerated={() => setAudioRefreshKey(k => k + 1)}
          />
        )}
        <div style={{ display: tab === 'audio' ? 'block' : 'none' }}>
          <AudioTab
            refreshKey={audioRefreshKey}
            onSessionSaved={() => setTrackerRefreshKey(k => k + 1)}
          />
        </div>
        {tab === 'tracker' && (
          <TrackerTab refreshKey={trackerRefreshKey} />
        )}
      </main>

      {/* ════════════════════════════════════
          BOTTOM NAV  (mobile only)
      ════════════════════════════════════ */}
      <nav className="app-bottom-nav" style={{
        background: 'rgba(5,13,28,0.96)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderTop: '1px solid rgba(255,255,255,0.05)',
      }}>
        {NAV_ITEMS.map(item => {
          const Icon = item.icon
          const active = tab === item.id
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                background: 'none', border: 'none', cursor: 'pointer',
                color: active ? '#8B83FF' : 'var(--text-dim)',
                padding: '12px 0', transition: 'color 0.2s',
              }}
            >
              <Icon size={19} />
              <span style={{ fontSize: '10px', letterSpacing: '0.05em' }}>{item.label}</span>
            </button>
          )
        })}
      </nav>

    </div>
  )
}
