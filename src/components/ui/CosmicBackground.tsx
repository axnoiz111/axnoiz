/**
 * CosmicBackground — matches the reference photo:
 * very dark midnight-blue base, subtle purple/indigo nebula clouds,
 * faint milky-way dust band.
 * All fixed, blurred, low opacity — atmosphere not distraction.
 */
export default function CosmicBackground() {
  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        // Base: near-black with a very faint blue cast — matches photo
        background: 'radial-gradient(ellipse at 40% 30%, #06080F 0%, #020409 60%, #010206 100%)',
      }}
    >
      {/* Milky-way dust band — diffuse diagonal streak, very faint */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '-20%',
        width: '140%',
        height: '55%',
        background: 'radial-gradient(ellipse at 55% 50%, rgba(60,50,110,0.14) 0%, rgba(40,35,80,0.07) 45%, transparent 75%)',
        transform: 'rotate(-15deg)',
        filter: 'blur(50px)',
      }} />

      {/* Primary nebula cloud — upper left, violet */}
      <div style={{
        position: 'absolute',
        top: '-5%',
        left: '-5%',
        width: '65vw',
        height: '65vw',
        maxWidth: '850px',
        maxHeight: '850px',
        borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(55,38,130,0.16) 0%, rgba(35,25,90,0.08) 40%, transparent 70%)',
        filter: 'blur(70px)',
      }} />

      {/* Secondary cloud — lower right, deep indigo */}
      <div style={{
        position: 'absolute',
        bottom: '-8%',
        right: '-8%',
        width: '55vw',
        height: '55vw',
        maxWidth: '750px',
        maxHeight: '750px',
        borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(25,30,110,0.14) 0%, rgba(15,20,75,0.07) 42%, transparent 70%)',
        filter: 'blur(65px)',
      }} />

      {/* Distant cluster glow — mid-right, cooler purple */}
      <div style={{
        position: 'absolute',
        top: '35%',
        right: '5%',
        width: '30vw',
        height: '30vw',
        maxWidth: '450px',
        maxHeight: '450px',
        borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(75,40,130,0.10) 0%, transparent 68%)',
        filter: 'blur(45px)',
      }} />

      {/* Bottom horizon depth — very faint warm undertone */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '35vh',
        background: 'linear-gradient(to top, rgba(20,15,55,0.18) 0%, transparent 100%)',
      }} />
    </div>
  )
}
