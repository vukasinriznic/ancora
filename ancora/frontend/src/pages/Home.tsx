import { useEffect, useRef, useState } from 'react'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import HowItWorks from '../components/HowItWorks'
import Features from '../components/Features'
import About from '../components/About'
import CtaSection from '../components/CtaSection'
import Footer from '../components/Footer'
import CursorTrail from '../components/CursorTrail'
import CursorGlow from '../components/CursorGlow'

export default function Home() {
  const footerWrapRef = useRef<HTMLDivElement>(null)
  const [footerH, setFooterH] = useState(0)

  useEffect(() => {
    const el = footerWrapRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setFooterH(el.offsetHeight))
    ro.observe(el)
    setFooterH(el.offsetHeight)
    return () => ro.disconnect()
  }, [])

  return (
    <>
      {/* Footer fiksiran na dnu — sadržaj ga otkriva skrolovanjem */}
      <div
        ref={footerWrapRef}
        style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 0 }}
      >
        <Footer />
      </div>

      <main
        className="overflow-x-clip relative"
        style={{ zIndex: 1, paddingBottom: footerH }}
      >
        <CursorGlow />
        <CursorTrail />
        <Navbar />
        <Hero />
        <HowItWorks />
        <Features />
        <About />
        <CtaSection />
      </main>
    </>
  )
}
