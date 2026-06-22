import { useState, useEffect } from 'react'
import { m } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import AncoraSVGLogo from './AncoraSVGLogo'
import DiamondButton from './DiamondButton'

export default function Navbar() {
  const { t: tr, i18n } = useTranslation()
  const cur = i18n.language?.startsWith('sr') ? 'sr' : 'en'
  const setLang = (lng: 'en' | 'sr') => {
    i18n.changeLanguage(lng)
    try { localStorage.setItem('lang', lng) } catch { /* ignore */ }
  }

  const [t,      setT]      = useState(0)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const onScroll = () => setT(Math.min(window.scrollY / 80, 1))
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const NAV_H = 72
    const check = () => {
      const sections = document.querySelectorAll('[data-theme="dark"]')
      let over = false
      sections.forEach(el => {
        const r = el.getBoundingClientRect()
        if (r.top < NAV_H && r.bottom > 0) over = true
      })
      setIsDark(over)
    }
    check()
    window.addEventListener('scroll', check, { passive: true })
    return () => window.removeEventListener('scroll', check)
  }, [])

  return (
    <m.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        backgroundColor:      isDark
          ? `rgba(10, 42, 31, ${0.48 + t * 0.28})`
          : `rgba(255, 255, 255, ${t * 0.07})`,
        backdropFilter:       `blur(${t * 20}px) saturate(${100 + t * 60}%)`,
        WebkitBackdropFilter: `blur(${t * 20}px) saturate(${100 + t * 60}%)`,
        borderBottom:  `1px solid rgba(21, 128, 61, ${isDark ? 0.15 : t * 0.12})`,
        boxShadow:     `0 1px 32px rgba(0, 0, 0, ${isDark ? 0.3 : t * 0.05})`,
        transition:    'background-color 0.4s ease, box-shadow 0.4s ease, border-color 0.4s ease, backdrop-filter 0.3s ease, -webkit-backdrop-filter 0.3s ease',
      }}
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-5 flex items-center justify-between">

        {/* ── Logo ── */}
        <div className="flex items-center gap-3 cursor-pointer select-none">
          <AncoraSVGLogo size={40} color="#1FD65F" />
          <span
            className="text-xl font-semibold tracking-tight transition-colors duration-300"
            style={{ fontFamily: 'Playfair Display, serif', color: isDark ? '#FFFFFF' : '#1A1A1A', letterSpacing: '0.02em' }}
          >
            Ancora
          </span>
        </div>

        {/* ── Desna strana ── */}
        <div className="flex items-center gap-4 sm:gap-7">

          {/* EN/SR switch — aktivni jezik je istaknut */}
          <div
            className="flex items-center gap-1.5 text-sm font-medium transition-colors duration-300"
            style={{ color: isDark ? '#6B7280' : '#9CA3AF' }}
          >
            <button
              onClick={() => setLang('en')}
              aria-pressed={cur === 'en'}
              className="transition-colors duration-200 cursor-pointer"
              style={{ color: cur === 'en' ? (isDark ? '#FFFFFF' : '#1A1A1A') : 'inherit', fontWeight: cur === 'en' ? 600 : 500 }}
            >EN</button>
            <span>/</span>
            <button
              onClick={() => setLang('sr')}
              aria-pressed={cur === 'sr'}
              className="transition-colors duration-200 cursor-pointer"
              style={{ color: cur === 'sr' ? (isDark ? '#FFFFFF' : '#1A1A1A') : 'inherit', fontWeight: cur === 'sr' ? 600 : 500 }}
            >SR</button>
          </div>

          {/* Log in — sakriven na vrlo uskim ekranima (Get started pokriva CTA) */}
          <button
            className="hidden sm:block text-sm font-medium transition-colors duration-300 cursor-pointer"
            style={{ color: isDark ? '#9CA3AF' : '#4B5563' }}
            onMouseEnter={e => (e.currentTarget.style.color = isDark ? '#FFFFFF' : '#1A1A1A')}
            onMouseLeave={e => (e.currentTarget.style.color = isDark ? '#9CA3AF' : '#4B5563')}
          >
            {tr('nav.login')}
          </button>

          <DiamondButton className="px-6 py-2.5 text-sm">{tr('nav.getStarted')}</DiamondButton>
        </div>

      </div>
    </m.nav>
  )
}
