import type { MouseEvent } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AncoraSVGLogo from './AncoraSVGLogo'

const explore = [
  { key: 'how',   href: '#how-it-works' },
  { key: 'why',   href: '#features' },
  { key: 'about', href: '#about' },
]
const legal = [
  { key: 'privacy', href: '/privacy' },
  { key: 'terms',   href: '/terms' },
]

function FooterLink({ label, href }: { label: string; href: string }) {
  const linkStyle = {
    color: '#9CA3AF',
    transition: 'color 0.2s ease',
  } as const
  const onEnter = (e: MouseEvent<HTMLElement>) => (e.currentTarget.style.color = '#1FD65F')
  const onLeave = (e: MouseEvent<HTMLElement>) => (e.currentTarget.style.color = '#9CA3AF')

  // Prave rute (npr. /privacy) → SPA navigacija; "#anchor" → smooth scroll na istoj stranici
  if (!href.startsWith('#')) {
    return (
      <Link to={href} className="inline-block text-sm" style={linkStyle} onMouseEnter={onEnter} onMouseLeave={onLeave}>
        {label}
      </Link>
    )
  }

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    const el = document.querySelector(href)
    if (el) {
      e.preventDefault()
      const top = el.getBoundingClientRect().top + window.scrollY - 72
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }
  return (
    <a href={href} onClick={handleClick} className="inline-block text-sm" style={linkStyle} onMouseEnter={onEnter} onMouseLeave={onLeave}>
      {label}
    </a>
  )
}

export default function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="relative px-6 pt-16 pb-10 border-t" style={{ borderColor: '#EAEAEA', backgroundColor: '#FAFAFA' }}>
      <div className="max-w-6xl mx-auto">

        {/* Top row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">

          {/* Brand */}
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <AncoraSVGLogo size={30} color="#1FD65F" />
              <span className="text-lg font-semibold" style={{ fontFamily: 'Playfair Display, serif', color: '#1A1A1A' }}>
                Ancora
              </span>
            </div>
            <p className="text-sm leading-relaxed max-w-[240px]" style={{ color: '#9CA3AF' }}>
              {t('footer.tagline')}
            </p>
          </div>

          {/* Explore — pravi anchor linkovi */}
          <div>
            <h4 className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: '#6B7280' }}>
              {t('footer.explore')}
            </h4>
            <ul className="flex flex-col gap-2.5">
              {explore.map(l => <li key={l.key}><FooterLink label={t('footer.links.' + l.key)} href={l.href} /></li>)}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: '#6B7280' }}>
              {t('footer.legal')}
            </h4>
            <ul className="flex flex-col gap-2.5">
              {legal.map(l => <li key={l.key}><FooterLink label={t('footer.links.' + l.key)} href={l.href} /></li>)}
            </ul>
          </div>
        </div>

        {/* Bottom row */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t"
          style={{ borderColor: '#EAEAEA' }}
        >
          <p className="text-sm" style={{ color: '#9CA3AF' }}>
            {t('footer.rights')}
          </p>
          <p className="text-sm italic" style={{ color: '#C9CDD3', fontFamily: 'Playfair Display, serif' }}>
            {t('footer.clarity')}
          </p>
        </div>

      </div>
    </footer>
  )
}
