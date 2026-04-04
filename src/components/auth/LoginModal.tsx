import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowRight, Mail } from 'lucide-react'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

type Step = 'initial' | 'email_otp' | 'whatsapp' | 'whatsapp_otp' | 'google_details'

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [step, setStep] = useState<Step>('initial')
  const [email, setEmail] = useState('')
  const [emailOtp, setEmailOtp] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [whatsappOtp, setWhatsappOtp] = useState('')

  // Reset state when opened/closed
  React.useEffect(() => {
    if (!isOpen) {
      setTimeout(() => setStep('initial'), 300)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleGoogleLogin = () => {
    // Simulating Google login and transitioning to fetching extra details
    setStep('google_details')
  }

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) setStep('email_otp')
  }

  const handleEmailOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (emailOtp) setStep('whatsapp')
  }

  const handleWhatsappSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (whatsapp) setStep('whatsapp_otp')
  }

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Flow complete
    onClose()
  }

  return (
    <AnimatePresence>
      <div 
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px'
        }}
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(2, 4, 9, 0.8)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '420px',
            background: 'var(--bg-2)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px',
            padding: '40px 32px',
            boxShadow: '0 24px 64px -12px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.02) inset',
            overflow: 'hidden'
          }}
        >
          {/* Subtle glow inside modal */}
          <div style={{
            position: 'absolute',
            top: 0, left: '50%',
            transform: 'translateX(-50%)',
            width: '200px', height: '100px',
            background: 'radial-gradient(ellipse, rgba(128,112,200,0.15) 0%, transparent 70%)',
            pointerEvents: 'none',
            filter: 'blur(30px)'
          }} />

          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '20px', right: '20px',
              background: 'transparent', border: 'none',
              color: 'var(--text-muted)', cursor: 'pointer',
              padding: '4px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: '50%',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-bright)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <X size={20} />
          </button>

          <AnimatePresence mode="wait">
            {/* ── STEP 1: INITIAL ── */}
            {step === 'initial' && (
              <motion.div
                key="initial"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <h2 className="font-display" style={{ fontSize: '32px', color: 'var(--text-bright)', marginBottom: '8px', textAlign: 'center' }}>
                  Welcome back
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center', marginBottom: '32px' }}>
                  Begin your daily practice.
                </p>

                <button
                  onClick={handleGoogleLogin}
                  style={{
                    width: '100%',
                    padding: '14px 24px',
                    background: '#fff',
                    color: '#000',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                    marginBottom: '24px',
                    transition: 'transform 0.2s',
                  }}
                  onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
                  onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                  <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Or</span>
                  <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                </div>

                <form onSubmit={handleEmailSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ position: 'relative' }}>
                    <Mail size={18} style={{ position: 'absolute', top: '50%', left: '16px', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="email"
                      required
                      placeholder="Email address"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      style={{
                        width: '100%',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid var(--border)',
                        padding: '14px 16px 14px 44px',
                        borderRadius: '8px',
                        color: 'var(--text-bright)',
                        fontSize: '14px',
                        outline: 'none',
                        transition: 'border-color 0.2s',
                      }}
                      onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                      onBlur={e => e.target.style.borderColor = 'var(--border)'}
                    />
                  </div>
                  <button
                    className="btn"
                    style={{ width: '100%', justifyContent: 'center', padding: '14px' }}
                    type="submit"
                  >
                    Continue with Email <ArrowRight size={14} />
                  </button>
                </form>
              </motion.div>
            )}

            {/* ── STEP 1B: GOOGLE DETAILS FETCH ── */}
            {step === 'google_details' && (
              <motion.div
                key="google_details"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <h2 className="font-display" style={{ fontSize: '28px', color: 'var(--text-bright)', marginBottom: '12px', textAlign: 'center' }}>
                  Complete your profile
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center', marginBottom: '24px' }}>
                  Please confirm a few details that Google didn't provide.
                </p>

                <form onSubmit={() => setStep('whatsapp')} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <input type="number" required placeholder="Age" style={inputStyle} />
                    <select required style={{...inputStyle, WebkitAppearance: 'none'}} defaultValue="">
                      <option value="" disabled>Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <input type="tel" required placeholder="Contact Number" style={inputStyle} />
                  <button className="btn" style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }} type="submit">
                    Continue <ArrowRight size={14} />
                  </button>
                </form>
              </motion.div>
            )}

            {/* ── STEP 2: EMAIL OTP ── */}
            {step === 'email_otp' && (
              <motion.div
                key="email_otp"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <h2 className="font-display" style={{ fontSize: '28px', color: 'var(--text-bright)', marginBottom: '12px', textAlign: 'center' }}>
                  Verify your email
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center', marginBottom: '32px' }}>
                  We've sent a 6-digit code to <b style={{color: 'var(--text-bright)'}}>{email}</b>
                </p>

                <form onSubmit={handleEmailOtpSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="Enter code"
                    value={emailOtp}
                    onChange={e => setEmailOtp(e.target.value.replace(/\D/g, ''))}
                    style={{
                      ...inputStyle,
                      textAlign: 'center',
                      letterSpacing: '0.4em',
                      fontSize: '18px',
                      fontWeight: 500
                    }}
                  />
                  <button className="btn" style={{ width: '100%', justifyContent: 'center' }} type="submit">
                    Verify Email
                  </button>
                </form>
              </motion.div>
            )}

            {/* ── STEP 3: WHATSAPP ── */}
            {step === 'whatsapp' && (
              <motion.div
                key="whatsapp"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <h2 className="font-display" style={{ fontSize: '28px', color: 'var(--text-bright)', marginBottom: '12px', textAlign: 'center' }}>
                  Weekly Tracking
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center', marginBottom: '32px' }}>
                  We use WhatsApp to send your weekly progress notifications and insights.
                </p>

                <form onSubmit={handleWhatsappSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <input
                    type="tel"
                    required
                    placeholder="WhatsApp Number (with country code)"
                    value={whatsapp}
                    onChange={e => setWhatsapp(e.target.value)}
                    style={inputStyle}
                  />
                  <button className="btn" style={{ width: '100%', justifyContent: 'center' }} type="submit">
                    Send OTP <ArrowRight size={14} />
                  </button>
                </form>
              </motion.div>
            )}

            {/* ── STEP 4: WHATSAPP OTP ── */}
            {step === 'whatsapp_otp' && (
              <motion.div
                key="whatsapp_otp"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <h2 className="font-display" style={{ fontSize: '28px', color: 'var(--text-bright)', marginBottom: '12px', textAlign: 'center' }}>
                  Verify WhatsApp
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center', marginBottom: '32px' }}>
                  Enter the code we just sent to <b style={{color: 'var(--text-bright)'}}>{whatsapp}</b>
                </p>

                <form onSubmit={handleFinalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="Enter code"
                    value={whatsappOtp}
                    onChange={e => setWhatsappOtp(e.target.value.replace(/\D/g, ''))}
                    style={{
                      ...inputStyle,
                      textAlign: 'center',
                      letterSpacing: '0.4em',
                      fontSize: '18px',
                      fontWeight: 500
                    }}
                  />
                  <button className="btn" style={{ width: '100%', justifyContent: 'center', borderColor: 'rgba(128,112,200,0.5)', background: 'rgba(128,112,200,0.06)' }} type="submit">
                    Complete Setup
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

const inputStyle = {
  width: '100%',
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid var(--border)',
  padding: '14px 16px',
  borderRadius: '8px',
  color: 'var(--text-bright)',
  fontSize: '14px',
  outline: 'none',
  transition: 'border-color 0.2s',
}
