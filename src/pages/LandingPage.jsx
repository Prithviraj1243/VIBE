import Navbar from '../components/Navbar.jsx'
import Hero from '../components/Hero.jsx'
import HowItWorks from '../components/HowItWorks.jsx'
import Agents from '../components/Agents.jsx'
import About from '../components/About.jsx'
import CTA from '../components/CTA.jsx'
import Footer from '../components/Footer.jsx'

function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <Agents />
        <About />
        <CTA />
      </main>
      <Footer />
    </>
  )
}

export default LandingPage
