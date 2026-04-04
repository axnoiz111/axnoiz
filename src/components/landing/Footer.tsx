export default function Footer() {
  return (
    <footer style={{
      padding: '40px 40px',
      borderTop: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
          <circle cx="9" cy="9" r="8" stroke="rgba(196,194,216,0.2)" strokeWidth="0.5" />
          <circle cx="9" cy="9" r="3" fill="rgba(128,112,200,0.4)" />
          <circle cx="9" cy="9" r="1.2" fill="rgba(196,194,216,0.6)" />
        </svg>
        <span style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontWeight: 300,
          fontSize: '13px',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
        }}>
          Axnoiz
        </span>
      </div>

      <div style={{ display: 'flex', gap: '28px' }}>
        {['Privacy', 'Terms', 'Contact'].map((l) => (
          <a key={l} href="#" className="link-subtle">{l}</a>
        ))}
      </div>

      <p style={{ fontSize: '11px', color: 'var(--text-dim)', letterSpacing: '0.06em' }}>
        © 2026 Axnoiz
      </p>
    </footer>
  )
}
