import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import CursorTrail from '../components/CursorTrail'
import CursorGlow from '../components/CursorGlow'
import { usePageTitle } from '../hooks/usePageTitle'

// Sekcije ispod prevoja — lazy-loaded, parse-uju se tek kad browser stigni do njih
const HowItWorks = lazy(() => import('../components/HowItWorks'))
const Features   = lazy(() => import('../components/Features'))
const About      = lazy(() => import('../components/About'))
const CtaSection = lazy(() => import('../components/CtaSection'))
const Footer     = lazy(() => import('../components/Footer'))

export default function Home() {
  const { t } = useTranslation()
  usePageTitle(t('pageTitles.home'))

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
        style={{ zIndex: 1, paddingBottom: footerH, pointerEvents: 'none' }}
      >
        {/* pointer-events:auto vraća interakciju sadržaju; prazan paddingBottom
            (iznad fiksiranog footera) ostaje none → klik/hover prolaze do footera */}
        <div style={{ pointerEvents: 'auto' }}>
          <CursorGlow />
          <CursorTrail />
          <Navbar />
          <Hero />
          <Suspense fallback={null}>
            <HowItWorks />
            <Features />
            <About />
            <CtaSection />
          </Suspense>
        </div>
      </main>
    </>
  )
}
