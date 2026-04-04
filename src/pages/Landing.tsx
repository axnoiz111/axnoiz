import StarField from '../components/ui/StarField'
import Navbar from '../components/landing/Navbar'
import Hero from '../components/landing/Hero'
import WhatIsAxnoiz from '../components/landing/WhatIsAxnoiz'
import HowItWorks from '../components/landing/HowItWorks'
import Philosophy from '../components/landing/Philosophy'
import SocialProof from '../components/landing/SocialProof'
import FinalCTA from '../components/landing/FinalCTA'
import Footer from '../components/landing/Footer'

export default function Landing() {
  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Persistent star background */}
      <StarField density={200} />

      {/* Content layers */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <Navbar />
        <main>
          <Hero />
          <WhatIsAxnoiz />
          <HowItWorks />
          <Philosophy />
          <SocialProof />
          <FinalCTA />
        </main>
        <Footer />
      </div>
    </div>
  )
}
