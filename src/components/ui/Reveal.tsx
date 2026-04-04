import { useRef, type ReactNode } from 'react'
import { motion, useInView } from 'framer-motion'

interface RevealProps {
  children: ReactNode
  delay?: number
  y?: number
  className?: string
  style?: React.CSSProperties
}

export default function Reveal({ children, delay = 0, y = 18, className, style }: RevealProps) {
  const ref = useRef(null)
  // once: false → re-triggers every time element enters the viewport
  const inView = useInView(ref, { once: false, margin: '-60px' })

  return (
    <motion.div
      ref={ref}
      className={className}
      style={style}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{ duration: 0.9, delay: inView ? delay : 0, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}
