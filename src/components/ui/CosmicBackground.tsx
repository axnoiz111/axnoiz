/**
 * CosmicBackground — fixed, full-page nebula atmosphere.
 * Layered radial gradients at low opacity create the feeling of
 * deep space without overpowering the content.
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
        overflow: 'hidden',
      }}
    >
      {/* Primary nebula — large violet cloud, top-left */}
      <div style={{
        position: 'absolute',
        top: '-15%',
        left: '-10%',
        width: '70vw',
        height: '70vw',
        maxWidth: '900px',
        maxHeight: '900px',
        borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(72,52,160,0.18) 0%, rgba(50,30,110,0.10) 35%, transparent 70%)',
        filter: 'blur(60px)',
      }} />

      {/* Secondary nebula — blue cloud, bottom-right */}
      <div style={{
        position: 'absolute',
        bottom: '-10%',
        right: '-8%',
        width: '60vw',
        height: '60vw',
        maxWidth: '800px',
        maxHeight: '800px',
        borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(30,40,130,0.16) 0%, rgba(20,25,90,0.09) 40%, transparent 70%)',
        filter: 'blur(55px)',
      }} />

      {/* Tertiary — warm dust cloud, mid-right */}
      <div style={{
        position: 'absolute',
        top: '38%',
        right: '-5%',
        width: '40vw',
        height: '40vw',
        maxWidth: '600px',
        maxHeight: '600px',
        borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(90,45,140,0.10) 0%, rgba(60,30,100,0.05) 45%, transparent 70%)',
        filter: 'blur(50px)',
      }} />

      {/* Deep anchor — faint warm glow at center-bottom, grounds the page */}
      <div style={{
        position: 'absolute',
        bottom: '20%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '50vw',
        height: '40vw',
        maxWidth: '700px',
        borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(55,35,120,0.10) 0%, transparent 65%)',
        filter: 'blur(70px)',
      }} />

      {/* Horizon line — very faint indigo band across bottom */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '30vh',
        background: 'linear-gradient(to top, rgba(30,20,80,0.12) 0%, transparent 100%)',
      }} />
    </div>
  )
}
