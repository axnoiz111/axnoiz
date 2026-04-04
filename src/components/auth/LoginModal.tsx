import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { X, ArrowRight, Mail, Lock, Eye, EyeOff, Check, Zap } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

type Mode = 'signin' | 'signup'
type Step = 'credentials' | 'check_inbox' | 'forgot' | 'forgot_sent' | 'magic_sent' | 'success'

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const navigate = useNavigate()
  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth()

  const [mode, setMode] = useState<Mode>('signin')
  const [step, setStep] = useState<Step>('credentials')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  React.useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setMode('signin')
        setStep('credentials')
        setEmail('')
        setPassword('')
        setConfirmPassword('')
        setError('')
        setShowPassword(false)
      }, 300)
    }
  }, [isOpen])

  const switchMode = (next: Mode) => {
    setMode(next)
    setError('')
    setPassword('')
    setConfirmPassword('')
  }

  const goSuccess = () => {
    setStep('success')
    setTimeout(() => {
      onClose()
      navigate('/dashboard')
    }, 1600)
  }

  // ── Google OAuth ──
  const handleGoogleLogin = async () => {
    try {
      setLoading(true)
      setError('')
      await signInWithGoogle()
    } catch (e: any) {
      setError(e.message)
      setLoading(false)
    }
  }

  // ── Email + Password ──
  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    try {
      if (mode === 'signin') {
        await signInWithEmail(email, password)
        goSuccess()
      } else {
        const { sessionCreated, alreadyExists } = await signUpWithEmail(email, password)
        if (alreadyExists) {
          // Account already confirmed — guide user to sign in
          switchMode('signin')
          setError('Account already exists. Sign in with your password.')
        } else if (sessionCreated) {
          goSuccess()
        } else {
          setStep('check_inbox')
        }
      }
    } catch (e: any) {
      const msg: string = e.message ?? ''
      if (msg.includes('Invalid login credentials')) {
        setError('Incorrect password. Try again or reset it.')
      } else if (msg.includes('already registered') || msg.includes('already been registered')) {
        setError('Account already exists. Sign in instead.')
        switchMode('signin')
      } else if (msg.includes('Email not confirmed')) {
        setError('Please confirm your email first. Check your inbox.')
      } else {
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  // ── Magic Link ──
  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) { setError('Enter your email first.'); return }
    setLoading(true)
    setError('')
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true, emailRedirectTo: `${window.location.origin}/dashboard` },
      })
      if (error) throw error
      setStep('magic_sent')
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  // ── Forgot Password ──
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) { setError('Enter your email address.'); return }
    setLoading(true)
    setError('')
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (error) throw error
      setStep('forgot_sent')
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const isSuccessOrSent = step === 'success' || step === 'forgot_sent' || step === 'magic_sent' || step === 'check_inbox'

  return (
    <AnimatePresence>
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '24px',
        }}
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={isSuccessOrSent ? undefined : onClose}
          style={{
            position: 'absolute', inset: 0,
            background: 'rgba(2, 4, 9, 0.85)',
            backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          }}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          style={{
            position: 'relative', width: '100%', maxWidth: '420px',
            background: 'var(--bg-2)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '20px',
            padding: isSuccessOrSent ? '60px 32px' : '40px 32px',
            boxShadow: '0 24px 64px -12px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.02) inset',
            overflow: 'hidden', transition: 'padding 0.4s ease',
          }}
        >
          {/* Inner glow */}
          <div style={{
            position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
            width: '260px', height: '120px',
            background: 'radial-gradient(ellipse, rgba(128,112,200,0.12) 0%, transparent 70%)',
            pointerEvents: 'none', filter: 'blur(30px)',
          }} />

          {/* Close */}
          {!isSuccessOrSent && (
            <button
              onClick={onClose}
              style={{
                position: 'absolute', top: '18px', right: '18px',
                background: 'transparent', border: 'none',
                color: 'var(--text-muted)', cursor: 'pointer',
                padding: '6px', display: 'flex', borderRadius: '50%', transition: 'color 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-bright)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              <X size={18} />
            </button>
          )}

          <AnimatePresence mode="wait">

            {/* ══ SUCCESS ══ */}
            {step === 'success' && (
              <motion.div key="success"
                initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', damping: 14, stiffness: 180 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}
              >
                <motion.div
                  initial={{ boxShadow: '0 0 0px rgba(128,112,200,0)' }}
                  animate={{ boxShadow: '0 0 48px rgba(128,112,200,0.5)' }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  style={{
                    width: '88px', height: '88px', borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(128,112,200,0.25) 0%, rgba(128,112,200,0.05) 60%, transparent 100%)',
                    border: '1px solid rgba(128,112,200,0.4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.15 }}
                  >
                    <Check size={40} color="var(--accent)" strokeWidth={2} />
                  </motion.div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.35 }}
                  style={{ textAlign: 'center' }}
                >
                  <p className="font-display" style={{ fontSize: '28px', color: 'var(--text-bright)', marginBottom: '8px' }}>
                    You're in.
                  </p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px', letterSpacing: '0.04em' }}>
                    Taking you to your dashboard...
                  </p>
                </motion.div>
              </motion.div>
            )}

            {/* ══ MAGIC LINK SENT ══ */}
            {step === 'magic_sent' && (
              <motion.div key="magic_sent"
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', textAlign: 'center' }}
              >
                <div style={{
                  width: '72px', height: '72px', borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(128,112,200,0.2) 0%, transparent 70%)',
                  border: '1px solid rgba(128,112,200,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Zap size={32} color="var(--accent)" />
                </div>
                <div>
                  <p className="font-display" style={{ fontSize: '24px', color: 'var(--text-bright)', marginBottom: '8px' }}>
                    Magic link sent.
                  </p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.7 }}>
                    Check <span style={{ color: 'var(--text-bright)' }}>{email}</span><br />
                    and click the link to sign in.
                  </p>
                </div>
                <button
                  onClick={() => { setStep('credentials'); setError('') }}
                  style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: '11px', cursor: 'pointer', marginTop: '8px', letterSpacing: '0.05em' }}
                >
                  ← Back to sign in
                </button>
              </motion.div>
            )}

            {/* ══ FORGOT PASSWORD SENT ══ */}
            {step === 'forgot_sent' && (
              <motion.div key="forgot_sent"
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', textAlign: 'center' }}
              >
                <div style={{
                  width: '72px', height: '72px', borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(128,112,200,0.2) 0%, transparent 70%)',
                  border: '1px solid rgba(128,112,200,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Mail size={32} color="var(--accent)" />
                </div>
                <div>
                  <p className="font-display" style={{ fontSize: '24px', color: 'var(--text-bright)', marginBottom: '8px' }}>
                    Reset link sent.
                  </p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.7 }}>
                    Check <span style={{ color: 'var(--text-bright)' }}>{email}</span><br />
                    for a password reset link.
                  </p>
                </div>
                <button
                  onClick={() => { setStep('credentials'); setMode('signin'); setError('') }}
                  style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: '11px', cursor: 'pointer', marginTop: '8px', letterSpacing: '0.05em' }}
                >
                  ← Back to sign in
                </button>
              </motion.div>
            )}

            {/* ══ FORGOT PASSWORD ══ */}
            {step === 'forgot' && (
              <motion.div key="forgot"
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.22 }}
              >
                <h2 className="font-display" style={{ fontSize: '28px', color: 'var(--text-bright)', marginBottom: '8px', textAlign: 'center' }}>
                  Reset password.
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', marginBottom: '28px', lineHeight: 1.6 }}>
                  Enter your email and we'll send a reset link.
                </p>

                {error && <p style={errorStyle}>{error}</p>}

                <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ position: 'relative' }}>
                    <Mail size={15} style={iconStyle} />
                    <input
                      type="email" required placeholder="Email address"
                      value={email} onChange={e => setEmail(e.target.value)}
                      disabled={loading} autoFocus
                      style={{ ...inputStyle, paddingLeft: '42px' }}
                      onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.07)'}
                    />
                  </div>
                  <button className="btn" type="submit" disabled={loading}
                    style={{ width: '100%', justifyContent: 'center', opacity: loading ? 0.6 : 1 }}>
                    {loading ? 'Sending...' : 'Send Reset Link'} {!loading && <ArrowRight size={14} />}
                  </button>
                  <button type="button"
                    onClick={() => { setStep('credentials'); setError('') }}
                    style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: '11px', cursor: 'pointer', letterSpacing: '0.05em', marginTop: '4px' }}>
                    ← Back to sign in
                  </button>
                </form>
              </motion.div>
            )}

            {/* ══ CHECK INBOX (signup confirmation link sent) ══ */}
            {step === 'check_inbox' && (
              <motion.div key="check_inbox"
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', textAlign: 'center' }}
              >
                <div style={{
                  width: '72px', height: '72px', borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(128,112,200,0.2) 0%, transparent 70%)',
                  border: '1px solid rgba(128,112,200,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Mail size={32} color="var(--accent)" />
                </div>
                <div>
                  <p className="font-display" style={{ fontSize: '26px', color: 'var(--text-bright)', marginBottom: '10px' }}>
                    Confirm your email.
                  </p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.8 }}>
                    We sent a confirmation link to<br />
                    <span style={{ color: 'var(--text-bright)' }}>{email}</span><br />
                    Click it to activate your account.
                  </p>
                </div>
                <button
                  onClick={() => { setStep('credentials'); setError('') }}
                  style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: '11px', cursor: 'pointer', marginTop: '8px', letterSpacing: '0.05em' }}
                >
                  ← Use a different email
                </button>
              </motion.div>
            )}

            {/* ══ CREDENTIALS ══ */}
            {step === 'credentials' && (
              <motion.div key={`creds-${mode}`}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
              >
                {/* Mode toggle tabs */}
                <div style={{ display: 'flex', marginBottom: '28px', borderBottom: '1px solid var(--border)' }}>
                  {(['signin', 'signup'] as Mode[]).map(m => (
                    <button key={m} onClick={() => switchMode(m)}
                      style={{
                        flex: 1, background: 'none', border: 'none',
                        borderBottom: mode === m ? '2px solid var(--accent)' : '2px solid transparent',
                        marginBottom: '-1px',
                        color: mode === m ? 'var(--text-bright)' : 'var(--text-muted)',
                        fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase',
                        padding: '0 0 13px', cursor: 'pointer', transition: 'color 0.2s, border-color 0.2s',
                        fontFamily: 'inherit',
                      }}>
                      {m === 'signin' ? 'Sign In' : 'Create Account'}
                    </button>
                  ))}
                </div>

                <h2 className="font-display" style={{ fontSize: '30px', color: 'var(--text-bright)', marginBottom: '24px', textAlign: 'center' }}>
                  {mode === 'signin' ? 'Welcome back.' : 'Create account.'}
                </h2>

                {error && <p style={errorStyle}>{error}</p>}

                {/* Google */}
                <button onClick={handleGoogleLogin} disabled={loading}
                  style={{
                    width: '100%', padding: '13px 24px',
                    background: '#fff', color: '#111', border: 'none', borderRadius: '8px',
                    fontSize: '13px', fontWeight: 500,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    marginBottom: '18px', transition: 'transform 0.15s, opacity 0.15s',
                    opacity: loading ? 0.7 : 1, fontFamily: 'inherit',
                  }}
                  onMouseDown={e => { if (!loading) e.currentTarget.style.transform = 'scale(0.98)' }}
                  onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                  <span style={{ fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>or</span>
                  <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                </div>

                {/* Email + Password form */}
                <form onSubmit={handleCredentialsSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ position: 'relative' }}>
                    <Mail size={15} style={iconStyle} />
                    <input type="email" required placeholder="Email address"
                      value={email} onChange={e => setEmail(e.target.value)}
                      disabled={loading}
                      style={{ ...inputStyle, paddingLeft: '42px' }}
                      onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.07)'}
                    />
                  </div>

                  <div style={{ position: 'relative' }}>
                    <Lock size={15} style={iconStyle} />
                    <input type={showPassword ? 'text' : 'password'} required
                      placeholder="Password" value={password}
                      onChange={e => setPassword(e.target.value)} disabled={loading}
                      style={{ ...inputStyle, paddingLeft: '42px', paddingRight: '42px' }}
                      onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.07)'}
                    />
                    <button type="button" onClick={() => setShowPassword(s => !s)}
                      style={{ position: 'absolute', top: '50%', right: '12px', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '2px', display: 'flex' }}>
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>

                  {/* Confirm password — signup only */}
                  <AnimatePresence>
                    {mode === 'signup' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}
                        style={{ overflow: 'hidden', position: 'relative' }}
                      >
                        <Lock size={15} style={iconStyle} />
                        <input type={showPassword ? 'text' : 'password'}
                          required={mode === 'signup'} placeholder="Confirm password"
                          value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                          disabled={loading}
                          style={{ ...inputStyle, paddingLeft: '42px' }}
                          onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                          onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.07)'}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Forgot password link — sign in only */}
                  {mode === 'signin' && (
                    <div style={{ textAlign: 'right' }}>
                      <button type="button"
                        onClick={() => { setStep('forgot'); setError('') }}
                        style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: '11px', cursor: 'pointer', letterSpacing: '0.04em', fontFamily: 'inherit' }}>
                        Forgot password?
                      </button>
                    </div>
                  )}

                  <button className="btn" type="submit" disabled={loading}
                    style={{ width: '100%', justifyContent: 'center', marginTop: '2px', opacity: loading ? 0.6 : 1 }}>
                    {loading
                      ? (mode === 'signin' ? 'Signing in...' : 'Creating account...')
                      : (mode === 'signin' ? 'Sign In' : 'Create Account')
                    }
                    {!loading && <ArrowRight size={14} />}
                  </button>
                </form>

                {/* Magic link option — sign in only */}
                {mode === 'signin' && (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '16px 0' }}>
                      <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                      <span style={{ fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>or</span>
                      <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                    </div>
                    <form onSubmit={handleMagicLink}>
                      <button type="submit" disabled={loading}
                        style={{
                          width: '100%', padding: '12px 16px',
                          background: 'rgba(128,112,200,0.06)',
                          border: '1px solid rgba(128,112,200,0.2)',
                          borderRadius: '8px', color: 'var(--text-muted)',
                          fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                          cursor: loading ? 'not-allowed' : 'pointer',
                          transition: 'border-color 0.2s, color 0.2s', fontFamily: 'inherit',
                          opacity: loading ? 0.6 : 1,
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(128,112,200,0.5)'; e.currentTarget.style.color = 'var(--text-bright)' }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(128,112,200,0.2)'; e.currentTarget.style.color = 'var(--text-muted)' }}
                      >
                        <Zap size={13} />
                        Send magic link instead
                      </button>
                    </form>
                  </>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </motion.div>
      </div>
    </AnimatePresence>
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

const iconStyle: React.CSSProperties = {
  position: 'absolute', top: '50%', left: '14px',
  transform: 'translateY(-50%)',
  color: 'var(--text-dim)', pointerEvents: 'none',
}

const errorStyle: React.CSSProperties = {
  color: '#e07070', fontSize: '12px', textAlign: 'center',
  marginBottom: '14px', lineHeight: 1.5,
}
