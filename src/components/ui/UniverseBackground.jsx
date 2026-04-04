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
      value: 180,
      density: {
        enable: true,
        area: 1000,   // lower = denser; higher = more spread out
      },
    },

    color: {
      value: ['#ffffff', '#eaeaff', '#d8dcff', '#c8d0f8'],
    },

    shape: { type: 'circle' },

    opacity: {
      value: { min: 0.2, max: 0.7 },  // some barely visible, some brighter
      animation: {
        enable: true,
        speed: 0.4,                    // slow breath — not blinking
        sync: false,                   // each star pulses independently
        minimumValue: 0.2,
      },
    },

    size: {
      value: { min: 0.5, max: 2.2 },  // small = distant, larger = closer
      animation: { enable: false },
    },

    shadow: {
      enable: true,
      color: { value: '#ffffff' },
      blur: 6,                         // soft star halo — not harsh
    },

    move: {
      enable: true,
      speed: 0.2,             // ← subtle but perceptible drift
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

      {/* ── LAYER 2: single minimal depth tint — barely perceptible ───── */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse at 40% 35%, rgba(30,20,70,0.10) 0%, transparent 65%)',
        filter: 'blur(80px)',
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
