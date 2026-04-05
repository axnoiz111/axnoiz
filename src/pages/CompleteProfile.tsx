import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, User, Calendar, Phone } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import UniverseBackground from '../components/ui/UniverseBackground'

const GENDERS = [
  { value: 'male',   label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other',  label: 'Other' },
]

export default function CompleteProfile() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [fullName,  setFullName]  = useState('')
  const [age,       setAge]       = useState('')
  const [gender,    setGender]    = useState('')
  const [whatsapp,  setWhatsapp]  = useState('')
  const [saving,    setSaving]    = useState(false)
  const [error,     setError]     = useState('')

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    if (!fullName.trim()) { setError('Please enter your name.'); return }

    setSaving(true)
    setError('')

    const { error: err } = await supabase.from('profiles').upsert({
      id:        user.id,
      email:     user.email,
      full_name: fullName.trim(),
      age:       age ? parseInt(age) : null,
      gender:    gender || null,
      whatsapp:  whatsapp || null,
    })

    setSaving(false)
    if (err) {
      setError(err.message)
    } else {
      navigate('/dashboard', { replace: true })
    }
  }

  return (
    <div style={{ minHeight: '100svh', background: '#050A18', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative' }}>

      {/* Stars */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <UniverseBackground />
      </div>

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '440px' }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          style={{ textAlign: 'center', marginBottom: '40px' }}
        >
          <p style={{ fontSize: '11px', color: '#4A5A7A', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '16px' }}>
            Welcome to Axnoiz
          </p>
          <h1 className="font-display" style={{ fontSize: '38px', color: '#F0F4FF', fontWeight: 300, lineHeight: 1.2, marginBottom: '14px' }}>
            Before we begin.
          </h1>
          <p style={{ fontSize: '14px', color: '#8B9DC3', lineHeight: 1.8, maxWidth: '320px', margin: '0 auto' }}>
            Tell us a little about yourself so we can personalise your experience.
          </p>
        </motion.div>

        {/* Form card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
          style={{
            background: '#0A1628',
            border: '1px solid rgba(108,99,255,0.12)',
            borderRadius: '20px',
            padding: '32px 28px',
            boxShadow: '0 0 60px rgba(108,99,255,0.07)',
          }}
        >
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Name */}
            <div>
              <label style={labelStyle}>Your name <span style={{ color: '#6C63FF' }}>*</span></label>
              <div style={{ position: 'relative' }}>
                <User size={15} style={iconStyle} />
                <input
                  type="text" required autoFocus
                  placeholder="e.g. Arjun Sharma"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  style={{ ...inputStyle, paddingLeft: '42px' }}
                  onFocus={e => e.target.style.borderColor = '#6C63FF'}
                  onBlur={e => e.target.style.borderColor = 'rgba(108,99,255,0.12)'}
                />
              </div>
            </div>

            {/* Age */}
            <div>
              <label style={labelStyle}>Age</label>
              <div style={{ position: 'relative' }}>
                <Calendar size={15} style={iconStyle} />
                <input
                  type="number" min="1" max="120"
                  placeholder="Your age"
                  value={age}
                  onChange={e => setAge(e.target.value)}
                  style={{ ...inputStyle, paddingLeft: '42px' }}
                  onFocus={e => e.target.style.borderColor = '#6C63FF'}
                  onBlur={e => e.target.style.borderColor = 'rgba(108,99,255,0.12)'}
                />
              </div>
            </div>

            {/* Gender */}
            <div>
              <label style={labelStyle}>Gender</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                {GENDERS.map(g => (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => setGender(g.value)}
                    style={{
                      flex: 1, padding: '11px 8px',
                      background: gender === g.value ? 'rgba(108,99,255,0.18)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${gender === g.value ? '#6C63FF' : 'rgba(108,99,255,0.12)'}`,
                      borderRadius: '8px',
                      color: gender === g.value ? '#F0F4FF' : '#8B9DC3',
                      fontSize: '13px', cursor: 'pointer',
                      transition: 'all 0.18s',
                      fontFamily: 'inherit',
                    }}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            {/* WhatsApp */}
            <div>
              <label style={labelStyle}>WhatsApp number <span style={{ color: '#4A5A7A', fontSize: '10px' }}>(optional)</span></label>
              <div style={{ position: 'relative' }}>
                <Phone size={15} style={iconStyle} />
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={whatsapp}
                  onChange={e => setWhatsapp(e.target.value)}
                  style={{ ...inputStyle, paddingLeft: '42px' }}
                  onFocus={e => e.target.style.borderColor = '#6C63FF'}
                  onBlur={e => e.target.style.borderColor = 'rgba(108,99,255,0.12)'}
                />
              </div>
              <p style={{ fontSize: '11px', color: '#4A5A7A', marginTop: '5px' }}>For weekly progress reports.</p>
            </div>

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ color: '#FF6B6B', fontSize: '12px', textAlign: 'center' }}
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={saving}
              style={{
                marginTop: '6px',
                width: '100%', padding: '16px',
                background: saving ? 'rgba(108,99,255,0.4)' : 'linear-gradient(135deg, #6C63FF, #8B83FF)',
                border: 'none', borderRadius: '10px',
                color: '#fff', fontSize: '13px',
                fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                cursor: saving ? 'not-allowed' : 'pointer',
                boxShadow: saving ? 'none' : '0 0 28px rgba(108,99,255,0.45)',
                transition: 'box-shadow 0.2s',
                fontFamily: 'inherit',
              }}
            >
              {saving ? 'Saving...' : 'Begin My Journey'}
              {!saving && <ArrowRight size={15} />}
            </motion.button>

          </form>
        </motion.div>

        {/* Quote */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          style={{ textAlign: 'center', fontSize: '12px', color: '#4A5A7A', marginTop: '28px', lineHeight: 1.7, fontStyle: 'italic' }}
        >
          "The first step toward success is taken when you refuse to be a captive of the environment in which you find yourself."<br />
          <span style={{ fontSize: '11px', letterSpacing: '0.06em' }}>— Mark Caine</span>
        </motion.p>

      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '11px',
  color: '#4A5A7A',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  marginBottom: '8px',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(108,99,255,0.12)',
  padding: '13px 16px',
  borderRadius: '8px',
  color: '#F0F4FF',
  fontSize: '14px',
  outline: 'none',
  transition: 'border-color 0.2s',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
}

const iconStyle: React.CSSProperties = {
  position: 'absolute',
  top: '50%', left: '14px',
  transform: 'translateY(-50%)',
  color: '#4A5A7A',
  pointerEvents: 'none',
}
