import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMenuOpen(false)
  }

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between"
        style={{
          background: scrolled
            ? 'rgba(5, 10, 24, 0.85)'
            : 'transparent',
          backdropFilter: scrolled ? 'blur(16px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(108,99,255,0.1)' : 'none',
          transition: 'all 0.4s ease',
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => scrollTo('hero')}>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #6C63FF, #00D4FF)',
              boxShadow: '0 0 15px rgba(108,99,255,0.5)',
            }}
          >
            <span className="text-white font-bold text-xs">A</span>
          </div>
          <span
            className="font-playfair font-bold text-xl tracking-wide"
            style={{ color: 'var(--text-primary)' }}
          >
            AXNOIZ
          </span>
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {[
            { label: 'How It Works', id: 'how-it-works' },
            { label: 'Philosophy', id: 'philosophy' },
            { label: 'Stories', id: 'social-proof' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className="text-sm font-medium transition-colors duration-200"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* CTA */}
        <div className="flex items-center gap-3">
          <button className="btn-ghost hidden md:block px-5 py-2 text-sm">
            Sign In
          </button>
          <button
            className="btn-primary px-5 py-2 text-sm"
            onClick={() => scrollTo('final-cta')}
          >
            Start Free
          </button>
          <button
            className="md:hidden p-2"
            style={{ color: 'var(--text-muted)' }}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 left-0 right-0 z-40 mx-4 rounded-2xl p-6 flex flex-col gap-4"
            style={{
              background: 'rgba(10, 22, 40, 0.97)',
              border: '1px solid rgba(108,99,255,0.2)',
              backdropFilter: 'blur(20px)',
            }}
          >
            {[
              { label: 'How It Works', id: 'how-it-works' },
              { label: 'Philosophy', id: 'philosophy' },
              { label: 'Stories', id: 'social-proof' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="text-left text-base font-medium py-2"
                style={{ color: 'var(--text-muted)', borderBottom: '1px solid rgba(108,99,255,0.08)' }}
              >
                {item.label}
              </button>
            ))}
            <button className="btn-ghost py-3 text-sm mt-2">Sign In</button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
