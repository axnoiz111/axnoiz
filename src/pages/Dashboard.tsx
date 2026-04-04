import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (!user) {
        window.location.href = '/'
      }
    })
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  if (!user) return <div style={{ height: '100svh', background: '#020409', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>

  return (
    <div style={{ minHeight: '100svh', background: '#020409', color: 'var(--text-bright)', padding: '40px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '60px' }}>
        <h1 className="font-display" style={{ fontSize: '32px' }}>Axnoiz Dashboard</h1>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button className="btn" onClick={() => window.location.href = '/profile'} style={{ background: 'transparent', border: '1px solid var(--border)' }}>
            Profile
          </button>
          <button className="btn" onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </header>

      <section style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <h2 className="font-display-italic" style={{ fontSize: '48px', color: 'var(--text-muted)', marginBottom: '24px' }}>Welcome back.</h2>
        <p style={{ color: 'var(--text-muted)' }}>This is the home page after login. You are authenticated as {user.email}.</p>
      </section>
    </div>
  )
}
