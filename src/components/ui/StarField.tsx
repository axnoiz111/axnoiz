import { useEffect, useRef } from 'react'

interface Star {
  x: number
  y: number
  r: number
  opacity: number
  speed: number
  angle: number
  twinkleSpeed: number
  twinkleOffset: number
}

interface StarFieldProps {
  density?: number
  className?: string
}

export default function StarField({ density = 180, className = '' }: StarFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const starsRef = useRef<Star[]>([])
  const frameRef = useRef<number>(0)
  const timeRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = document.documentElement.scrollHeight
      initStars()
    }

    const initStars = () => {
      starsRef.current = Array.from({ length: density }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.8 + 0.3,
        opacity: Math.random() * 0.5 + 0.15,
        speed: Math.random() * 0.15 + 0.03,
        angle: Math.random() * Math.PI * 2,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        twinkleOffset: Math.random() * Math.PI * 2,
      }))
    }

    const draw = (time: number) => {
      const dt = time - timeRef.current
      timeRef.current = time

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      starsRef.current.forEach((star) => {
        // Gentle drift
        star.x += Math.cos(star.angle) * star.speed * (dt / 16)
        star.y += Math.sin(star.angle) * star.speed * (dt / 16)

        // Wrap around
        if (star.x < 0) star.x = canvas.width
        if (star.x > canvas.width) star.x = 0
        if (star.y < 0) star.y = canvas.height
        if (star.y > canvas.height) star.y = 0

        // Twinkle
        const twinkle = 0.5 + 0.5 * Math.sin(time * star.twinkleSpeed + star.twinkleOffset)
        const alpha = star.opacity * (0.4 + 0.6 * twinkle)

        // Draw star with soft glow
        const gradient = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.r * 3)
        gradient.addColorStop(0, `rgba(240, 244, 255, ${alpha})`)
        gradient.addColorStop(0.4, `rgba(200, 190, 255, ${alpha * 0.4})`)
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')

        ctx.beginPath()
        ctx.arc(star.x, star.y, star.r * 3, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()

        ctx.beginPath()
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`
        ctx.fill()
      })

      frameRef.current = requestAnimationFrame(draw)
    }

    resize()
    window.addEventListener('resize', resize)
    frameRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(frameRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [density])

  return (
    <canvas
      ref={canvasRef}
      className={`fixed top-0 left-0 w-full h-full pointer-events-none ${className}`}
      style={{ zIndex: 0 }}
    />
  )
}
