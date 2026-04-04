import { useEffect, useRef } from 'react'

interface Star {
  x: number; y: number; r: number
  baseOpacity: number; opacity: number
  vx: number; vy: number
  twinklePhase: number; twinkleSpeed: number
}

export default function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)
  const starsRef = useRef<Star[]>([])

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    let W = 0, H = 0

    const resize = () => {
      W = canvas.width = window.innerWidth
      H = canvas.height = Math.max(document.documentElement.scrollHeight, window.innerHeight)
      init()
    }

    const init = () => {
      const count = Math.floor((W * H) / 14000)  // sparse
      starsRef.current = Array.from({ length: count }, () => {
        const base = Math.random() * 0.35 + 0.08  // max opacity 0.43 — visible but calm
        return {
          x: Math.random() * W,
          y: Math.random() * H,
          r: Math.random() * 0.9 + 0.2,
          baseOpacity: base,
          opacity: base,
          vx: (Math.random() - 0.5) * 0.04,
          vy: (Math.random() - 0.5) * 0.04,
          twinklePhase: Math.random() * Math.PI * 2,
          twinkleSpeed: Math.random() * 0.008 + 0.003,
        }
      })
    }

    let t = 0
    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      t += 1

      for (const s of starsRef.current) {
        s.x += s.vx
        s.y += s.vy
        if (s.x < 0) s.x = W
        if (s.x > W) s.x = 0
        if (s.y < 0) s.y = H
        if (s.y > H) s.y = 0

        s.twinklePhase += s.twinkleSpeed
        s.opacity = s.baseOpacity * (0.6 + 0.4 * Math.sin(s.twinklePhase))

        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(200,198,220,${s.opacity})`
        ctx.fill()
      }

      rafRef.current = requestAnimationFrame(draw)
    }

    resize()
    window.addEventListener('resize', resize)
    rafRef.current = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        opacity: 1,
      }}
    />
  )
}
