import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export default function Profile() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [age, setAge] = useState('')
  const [gender, setGender] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  // Load existing profile on mount
  useEffect(() => {
    if (!user) return
    supabase
      .from('profiles')
      .select('full_name, age, gender, whatsapp')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setFullName(data.full_name ?? '')
          setAge(data.age ? String(data.age) : '')
          setGender(data.gender ?? '')
          setWhatsapp(data.whatsapp ?? '')
        }
        setLoading(false)
      })
  }, [user])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    setError('')

    const { error: err } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email,
        full_name: fullName || null,
        age: age ? parseInt(age) : null,
        gender: gender || null,
        whatsapp: whatsapp || null,
      })

    setSaving(false)
    if (err) {
      setError(err.message)
    } else {
      setSaved(true)
      setTimeout(() => navigate('/dashboard'), 1200)
    }
  }

  if (loading) {
    return (
      <div style={{ height: '100svh', background: '#020409', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
        Loading...
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100svh', background: '#020409', color: 'var(--text-bright)', padding: '40px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '60px' }}>
        <h1 className="font-display" style={{ fontSize: '32px' }}>Your Profile</h1>
        <button className="btn" onClick={() => navigate('/dashboard')} style={{ background: 'transparent', border: '1px solid var(--border)' }}>
          Back to Dashboard
        </button>
      </header>

      <div style={{ maxWidth: '420px', margin: '0 auto' }}>

        {/* Email (read-only) */}
        <div style={{ marginBottom: '28px', padding: '16px 20px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '10px' }}>
          <p style={{ fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '4px' }}>Account</p>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{user?.email}</p>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

          <div>
            <label style={labelStyle}>Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Your name"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.07)'}
            />
          </div>

          <div>
            <label style={labelStyle}>Age</label>
            <input
              type="number"
              value={age}
              onChange={e => setAge(e.target.value)}
              placeholder="Your age"
              min="1" max="120"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.07)'}
            />
          </div>

          <div>
            <label style={labelStyle}>Gender</label>
            <select
              value={gender}
              onChange={e => setGender(e.target.value)}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.07)'}
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label style={labelStyle}>WhatsApp Number</label>
            <input
              type="tel"
              value={whatsapp}
              onChange={e => setWhatsapp(e.target.value)}
              placeholder="+91 98765 43210"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.07)'}
            />
            <p style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '6px' }}>Used for weekly progress reports.</p>
          </div>

          {error && (
            <p style={{ fontSize: '12px', color: '#e07070', textAlign: 'center' }}>{error}</p>
          )}

          <button
            className="btn"
            type="submit"
            disabled={saving}
            style={{ justifyContent: 'center', marginTop: '8px', opacity: saving ? 0.6 : 1 }}
          >
            {saved ? (
              <><Check size={14} /> Saved</>
            ) : saving ? 'Saving...' : 'Save Profile'}
          </button>

        </form>
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '11px',
  color: 'var(--text-dim)',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  marginBottom: '8px',
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
