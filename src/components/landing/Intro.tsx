import Reveal from '../ui/Reveal'

export default function Intro() {
  return (
    <section id="what" className="section" style={{ textAlign: 'center' }}>

      {/* Thin top rule */}
      <div className="divider-h" style={{ marginBottom: '80px', maxWidth: '320px', margin: '0 auto 80px' }} />

      <div style={{ maxWidth: '560px', margin: '0 auto' }}>

        <Reveal delay={0}>
          <p className="eyebrow" style={{ marginBottom: '32px' }}>What this is</p>
        </Reveal>

        <Reveal delay={0.15}>
          <h2
            className="font-display"
            style={{
              fontSize: 'clamp(32px, 5vw, 52px)',
              color: 'var(--text-bright)',
              marginBottom: '32px',
              lineHeight: 1.15,
            }}
          >
            Your subconscious is already
            <span className="font-display-italic"> deciding your life.</span>
          </h2>
        </Reveal>

        <Reveal delay={0.3}>
          <p style={{
            fontSize: 'clamp(15px, 2vw, 17px)',
            color: 'var(--text-muted)',
            lineHeight: 1.9,
            fontWeight: 300,
          }}>
            Axnoiz builds a personalized audio session from your goal each day —
            grounded in the teachings of Murphy, Hill, and Byrne —
            and delivers it as a five-minute immersive practice.
            <br /><br />
            You listen. It works on what you cannot reach consciously.
          </p>
        </Reveal>

      </div>

    </section>
  )
}
