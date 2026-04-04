/**
 * UniverseBackground
 *
 * Full-screen, fixed, behind all content.
 * Three layers stacked:
 *   1. Deep space gradient (CSS — instantaneous, no flicker)
 *   2. Nebula clouds      (CSS — static atmosphere)
 *   3. Particle stars     (tsparticles — very slow continuous drift)
 *   4. Readability vignette (CSS — subtle top/bottom darkening)
 *
 * Constraints honoured:
 *   - pointer-events: none  → never blocks clicks
 *   - z-index: 0 (siblings sit above via z-index: 1 on content wrapper)
 *   - No scroll parallax, no mouse interaction, no sudden transitions
 *   - Stars drift at ~0.06 px/frame — almost imperceptibly slow
 */

import { useEffect, useState } from 'react'
import Particles, { initParticlesEngine } from '@tsparticles/react'
import { loadSlim } from '@tsparticles/slim'

// ─── particle configuration ───────────────────────────────────────────────────
const PARTICLE_OPTIONS = {
  background: {
    color: { value: 'transparent' },
  },

  fpsLimit: 60,

  particles: {
    number: {
      value: 130,
      density: {
        enable: true,
        area: 1400,   // lower = denser; higher = more spread out
      },
    },

    color: {
      value: ['#ffffff', '#eaeaff', '#d8dcff', '#c8d0f8'],
    },

    shape: { type: 'circle' },

    opacity: {
      value: { min: 0.08, max: 0.42 },
      animation: {
        enable: true,
        speed: 0.25,          // very slow fade-pulse
        sync: false,
      },
    },

    size: {
      value: { min: 0.4, max: 1.7 },
      animation: { enable: false },
    },

    move: {
      enable: true,
      speed: 0.06,            // ← extremely slow drift
      direction: 'none',
      random: true,
      straight: false,
      drift: 0,
      outModes: { default: 'out' },
    },

    // no links, no collisions, no repulsion
    links:     { enable: false },
    collisions:{ enable: false },
  },

  interactivity: {
    events: {
      onHover: { enable: false },
      onClick: { enable: false },
      resize:  { enable: true },
    },
  },

  detectRetina: true,
  pauseOnBlur:  true,   // pause when tab not visible — saves CPU
}

// ─── component ────────────────────────────────────────────────────────────────
export default function UniverseBackground() {
  const [ready, setReady] = useState(false)

  // initialise tsparticles engine once
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine)
    }).then(() => setReady(true))
  }, [])

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    >

      {/* ── LAYER 1: deep-space gradient base ─────────────────────────── */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: [
          'radial-gradient(ellipse at 30% 20%, #04061A 0%, #020409 55%, #010206 100%)',
        ].join(', '),
      }} />

      {/* ── LAYER 2: nebula atmosphere (soft, blurred CSS blobs) ────────── */}

      {/* Primary — upper-left violet cloud */}
      <div style={{
        position: 'absolute',
        top: '-8%', left: '-6%',
        width: '62vw', height: '62vw',
        maxWidth: '820px', maxHeight: '820px',
        borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(52,36,128,0.15) 0%, rgba(32,22,88,0.07) 42%, transparent 70%)',
        filter: 'blur(72px)',
      }} />

      {/* Secondary — lower-right indigo */}
      <div style={{
        position: 'absolute',
        bottom: '-6%', right: '-6%',
        width: '55vw', height: '55vw',
        maxWidth: '740px', maxHeight: '740px',
        borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(22,28,110,0.14) 0%, rgba(14,18,72,0.06) 44%, transparent 70%)',
        filter: 'blur(64px)',
      }} />

      {/* Milky-way dust band — diagonal streak */}
      <div style={{
        position: 'absolute',
        top: '8%', left: '-18%',
        width: '136%', height: '52%',
        background: 'radial-gradient(ellipse at 54% 50%, rgba(58,44,108,0.12) 0%, rgba(36,28,76,0.05) 48%, transparent 74%)',
        transform: 'rotate(-14deg)',
        filter: 'blur(54px)',
      }} />

      {/* Tertiary — mid-right cool purple cluster */}
      <div style={{
        position: 'absolute',
        top: '38%', right: '4%',
        width: '28vw', height: '28vw',
        maxWidth: '420px', maxHeight: '420px',
        borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(72,38,128,0.09) 0%, transparent 68%)',
        filter: 'blur(46px)',
      }} />

      {/* ── LAYER 3: tsparticles stars ──────────────────────────────────── */}
      {ready && (
        <Particles
          id="universe-bg"
          options={PARTICLE_OPTIONS}
          style={{
            position: 'absolute',
            inset: 0,
          }}
        />
      )}

      {/* ── LAYER 4: readability vignette ───────────────────────────────── */}
      {/* Top darkening — prevents text clashing with bright star clusters */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: '22vh',
        background: 'linear-gradient(to bottom, rgba(1,2,9,0.55) 0%, transparent 100%)',
      }} />
      {/* Bottom darkening */}
      <div style={{
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        height: '22vh',
        background: 'linear-gradient(to top, rgba(1,2,9,0.55) 0%, transparent 100%)',
      }} />

    </div>
  )
}
