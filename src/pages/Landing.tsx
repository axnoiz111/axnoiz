import StarField from '../components/ui/StarField'
import Navbar from '../components/landing/Navbar'
import Hero from '../components/landing/Hero'
import Intro from '../components/landing/Intro'
import HowItWorks from '../components/landing/HowItWorks'
import Philosophy from '../components/landing/Philosophy'
import SocialProof from '../components/landing/SocialProof'
import FinalCTA from '../components/landing/FinalCTA'
import Footer from '../components/landing/Footer'

export default function Landing() {
  return (
    <div style={{ position: 'relative', background: 'var(--bg)' }}>
      <StarField />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <Navbar />
        <Hero />
        <Intro />
        <HowItWorks />
        <Philosophy />
        <SocialProof />
        <FinalCTA />
        <Footer />
      </div>
    </div>
  )
}
