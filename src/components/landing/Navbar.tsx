import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export default function Navbar({ onOpenLogin }: { onOpenLogin?: () => void }) {
  const [visible, setVisible] = useState(true)
  const [last, setLast] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      setVisible(y < last || y < 60)
      setLast(y)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [last])

  return (
    <motion.header
      initial={{ opacity: 0 }}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.5 }}
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 50,
        padding: '28px 40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <circle cx="9" cy="9" r="8" stroke="rgba(196,194,216,0.3)" strokeWidth="0.5" />
          <circle cx="9" cy="9" r="3" fill="rgba(128,112,200,0.6)" />
          <circle cx="9" cy="9" r="1.2" fill="rgba(196,194,216,0.9)" />
        </svg>
        <span style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontWeight: 300,
          fontSize: '17px',
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: 'var(--text)',
        }}>
          Axnoiz
        </span>
      </div>

      {/* Subtle right side */}
      <button
        className="btn"
        style={{ padding: '10px 24px', fontSize: '11px' }}
        onClick={onOpenLogin}
      >
        Login
      </button>
    </motion.header>
  )
}
