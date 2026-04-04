export default function Footer() {
  return (
    <footer
      className="relative py-10 px-6"
      style={{ borderTop: '1px solid rgba(108,99,255,0.1)' }}
    >
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #6C63FF, #00D4FF)',
              boxShadow: '0 0 10px rgba(108,99,255,0.4)',
            }}
          >
            <span className="text-white font-bold text-[9px]">A</span>
          </div>
          <span className="font-playfair font-bold text-sm" style={{ color: 'var(--text-muted)' }}>
            AXNOIZ
          </span>
        </div>

        {/* Links */}
        <div className="flex items-center gap-6">
          {['Privacy', 'Terms', 'Contact'].map((link) => (
            <a
              key={link}
              href="#"
              className="text-xs transition-colors duration-200"
              style={{ color: 'var(--text-dim)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-dim)')}
            >
              {link}
            </a>
          ))}
        </div>

        {/* Copyright */}
        <p className="text-xs text-center" style={{ color: 'var(--text-dim)' }}>
          © 2026 Axnoiz.{' '}
          <span style={{ color: 'rgba(108,99,255,0.5)' }}>
            Built for the relentless.
          </span>
        </p>
      </div>
    </footer>
  )
}
