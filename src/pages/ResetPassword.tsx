import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, Eye, EyeOff, Check } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Supabase fires PASSWORD_RECOVERY when user lands from the reset link
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true)
    })

    // Also check if there's already an active session (user re-visited)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setTimeout(() => navigate('/dashboard'), 2200)
    }
  }

  return (
    <div style={{
      minHeight: '100svh', background: '#020409',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
    }}>
      {/* Nebula glow */}
      <div style={{
        position: 'fixed', top: '40%', left: '50%', transform: 'translate(-50%, -50%)',
        width: '600px', height: '400px', borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(80,70,160,0.07) 0%, transparent 70%)',
        pointerEvents: 'none', filter: 'blur(40px)',
      }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          width: '100%', maxWidth: '400px',
          background: 'var(--bg-2)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '20px', padding: '40px 32px',
          boxShadow: '0 24px 64px -12px rgba(0,0,0,0.8)',
          position: 'relative', overflow: 'hidden',
        }}
      >
        {/* Inner glow */}
        <div style={{
          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
          width: '200px', height: '100px',
          background: 'radial-gradient(ellipse, rgba(128,112,200,0.12) 0%, transparent 70%)',
          pointerEvents: 'none', filter: 'blur(30px)',
        }} />

        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 14, stiffness: 180 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', padding: '20px 0' }}
          >
            <motion.div
              initial={{ boxShadow: '0 0 0px rgba(128,112,200,0)' }}
              animate={{ boxShadow: '0 0 48px rgba(128,112,200,0.5)' }}
              transition={{ duration: 0.8, delay: 0.2 }}
              style={{
                width: '80px', height: '80px', borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(128,112,200,0.25) 0%, rgba(128,112,200,0.05) 60%, transparent 100%)',
                border: '1px solid rgba(128,112,200,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Check size={36} color="var(--accent)" strokeWidth={2} />
            </motion.div>
            <div style={{ textAlign: 'center' }}>
              <p className="font-display" style={{ fontSize: '26px', color: 'var(--text-bright)', marginBottom: '8px' }}>
                Password updated.
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                Taking you to your dashboard...
              </p>
            </div>
          </motion.div>
        ) : !ready ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <p className="font-display" style={{ fontSize: '26px', color: 'var(--text-bright)', marginBottom: '12px' }}>
              Invalid link.
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '24px' }}>
              This reset link has expired or is invalid.
            </p>
            <button className="btn" onClick={() => navigate('/')} style={{ justifyContent: 'center' }}>
              Back to home
            </button>
          </div>
        ) : (
          <>
            <h2 className="font-display" style={{ fontSize: '30px', color: 'var(--text-bright)', marginBottom: '8px', textAlign: 'center' }}>
              New password.
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', marginBottom: '28px' }}>
              Choose a strong password for your account.
            </p>

            {error && (
              <p style={{ color: '#e07070', fontSize: '12px', textAlign: 'center', marginBottom: '16px' }}>
                {error}
              </p>
            )}

            <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', top: '50%', left: '14px', transform: 'translateY(-50%)', color: 'var(--text-dim)', pointerEvents: 'none' }} />
                <input
                  type={showPassword ? 'text' : 'password'} required
                  placeholder="New password"
                  value={password} onChange={e => setPassword(e.target.value)}
                  disabled={loading}
                  style={{ ...inputStyle, paddingLeft: '42px', paddingRight: '42px' }}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.07)'}
                />
                <button type="button" onClick={() => setShowPassword(s => !s)}
                  style={{ position: 'absolute', top: '50%', right: '12px', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', display: 'flex' }}>
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', top: '50%', left: '14px', transform: 'translateY(-50%)', color: 'var(--text-dim)', pointerEvents: 'none' }} />
                <input
                  type={showPassword ? 'text' : 'password'} required
                  placeholder="Confirm new password"
                  value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  style={{ ...inputStyle, paddingLeft: '42px' }}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.07)'}
                />
              </div>

              <button className="btn" type="submit" disabled={loading}
                style={{ width: '100%', justifyContent: 'center', marginTop: '4px', opacity: loading ? 0.6 : 1 }}>
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.07)',
  padding: '13px 16px',
  borderRadius: '8px',
  color: 'var(--text-bright)',
  fontSize: '14px',
  outline: 'none',
  transition: 'border-color 0.2s',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
}
