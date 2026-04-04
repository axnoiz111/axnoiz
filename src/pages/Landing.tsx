import UniverseBackground from '../components/ui/UniverseBackground'
import Navbar from '../components/landing/Navbar'
import Hero from '../components/landing/Hero'
import Intro from '../components/landing/Intro'
import HowItWorks from '../components/landing/HowItWorks'
import Philosophy from '../components/landing/Philosophy'
import SocialProof from '../components/landing/SocialProof'
import FinalCTA from '../components/landing/FinalCTA'
import Footer from '../components/landing/Footer'
import LoginModal from '../components/auth/LoginModal'
import FloatingArrow from '../components/ui/FloatingArrow'
import { useState } from 'react'

export default function Landing() {
  const [showLogin, setShowLogin] = useState(false)
  const [ctaInView, setCtaInView] = useState(false)
  return (
    <div style={{ position: 'relative', minHeight: '100svh', background: '#020409' }}>

      {/* ── background: sits at z-index 0, pointerEvents none ── */}
      <UniverseBackground />

      {/* ── all existing UI — untouched, sits above background ── */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <Navbar onOpenLogin={() => setShowLogin(true)} />
        <Hero />
        <Intro />
        <HowItWorks />
        <Philosophy />
        <SocialProof />
        <FinalCTA onOpenLogin={() => setShowLogin(true)} onInViewChange={setCtaInView} />
        <Footer />
      </div>

      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
      <FloatingArrow isVisible={!ctaInView} />

    </div>
  )
}
