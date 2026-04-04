import { useEffect, useRef } from 'react'

interface Star {
  x: number
  baseY: number
  r: number
  baseOpacity: number
  twinklePhase: number
  twinkleSpeed: number
  colorIdx: number
}

interface Layer {
  stars: Star[]
  parallax: number   // fraction of scrollY to offset this layer
}

// Star colors matching a real night sky — white, blue-white, faint violet
const COLORS = [
  [255, 255, 255],    // pure white
  [210, 220, 255],    // blue-white
  [220, 215, 255],    // cool white
  [200, 210, 255],    // blue
  [235, 230, 255],    // faint violet-white
]

export default function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const scrollRef = useRef(0)
  const rafRef    = useRef<number>(0)
  const layers    = useRef<Layer[]>([])
  const dims      = useRef({ W: 0, H: 0 })

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx    = canvas.getContext('2d')!

    // ── scroll tracker ──────────────────────────────
    const onScroll = () => { scrollRef.current = window.scrollY }
    window.addEventListener('scroll', onScroll, { passive: true })

    // ── init stars ──────────────────────────────────
    const buildLayer = (count: number, rMin: number, rMax: number, opMin: number, opMax: number): Star[] =>
      Array.from({ length: count }, () => ({
        x:           Math.random() * dims.current.W,
        baseY:       Math.random() * dims.current.H,
        r:           Math.random() * (rMax - rMin) + rMin,
        baseOpacity: Math.random() * (opMax - opMin) + opMin,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: Math.random() * 0.008 + 0.002,
        colorIdx:    Math.floor(Math.random() * COLORS.length),
      }))

    const resize = () => {
      dims.current.W = canvas.width  = window.innerWidth
      dims.current.H = canvas.height = window.innerHeight

      layers.current = [
        // Layer 0 — far background: tiny, dense, barely moves
        { stars: buildLayer(420, 0.15, 0.7,  0.12, 0.45), parallax: 0.06 },
        // Layer 1 — mid: moderate, some twinkle
        { stars: buildLayer(160, 0.4,  1.1,  0.25, 0.65), parallax: 0.16 },
        // Layer 2 — near: bright, fast parallax, some glow
        { stars: buildLayer(55,  0.8,  1.8,  0.50, 0.90), parallax: 0.30 },
        // Layer 3 — hero stars: large, vivid, fast
        { stars: buildLayer(12,  1.5,  2.5,  0.70, 1.00), parallax: 0.50 },
      ]
    }

    // ── draw ────────────────────────────────────────
    const draw = () => {
      const { W, H } = dims.current
      ctx.clearRect(0, 0, W, H)

      const scrollY = scrollRef.current

      for (const layer of layers.current) {
        // How far this layer has shifted due to scroll
        const scrollOffset = -(scrollY * layer.parallax)

        for (const s of layer.stars) {
          s.twinklePhase += s.twinkleSpeed
          const twinkle = 0.65 + 0.35 * Math.sin(s.twinklePhase)
          const alpha   = s.baseOpacity * twinkle

          // Wrap Y so stars cycle infinitely as user scrolls
          const rawY = s.baseY + scrollOffset
          const y    = ((rawY % H) + H) % H

          const [r, g, b] = COLORS[s.colorIdx]

          // Core dot
          ctx.beginPath()
          ctx.arc(s.x, y, s.r, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`
          ctx.fill()

          // Soft glow for medium+ stars
          if (s.r > 0.9) {
            const glowR = s.r * 5
            const grd = ctx.createRadialGradient(s.x, y, 0, s.x, y, glowR)
            grd.addColorStop(0, `rgba(${r},${g},${b},${alpha * 0.25})`)
            grd.addColorStop(1, `rgba(${r},${g},${b},0)`)
            ctx.beginPath()
            ctx.arc(s.x, y, glowR, 0, Math.PI * 2)
            ctx.fillStyle = grd
            ctx.fill()
          }

          // Cross-spike for hero stars
          if (s.r > 1.6) {
            ctx.strokeStyle = `rgba(${r},${g},${b},${alpha * 0.18})`
            ctx.lineWidth   = 0.5
            ctx.beginPath()
            ctx.moveTo(s.x - s.r * 4, y)
            ctx.lineTo(s.x + s.r * 4, y)
            ctx.moveTo(s.x, y - s.r * 4)
            ctx.lineTo(s.x, y + s.r * 4)
            ctx.stroke()
          }
        }
      }

      rafRef.current = requestAnimationFrame(draw)
    }

    resize()
    window.addEventListener('resize', resize)
    rafRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}
    />
  )
}
