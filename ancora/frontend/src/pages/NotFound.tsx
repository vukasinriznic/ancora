import { m } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import DiamondButton from '../components/DiamondButton'
import { usePageTitle } from '../hooks/usePageTitle'

/*
  404 — u istom tamno-zelenom stilu kao auth stranice.
  Ogromno sidro-watermark + "404" sa shimmer-om + povratak na početnu.
*/
export default function NotFound() {
  const { t } = useTranslation()
  usePageTitle(t('pageTitles.notFound'))
  const navigate = useNavigate()

  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center px-6 py-20 overflow-x-clip text-center"
      style={{
        background:
          'linear-gradient(180deg, #0C3D2D 0%, #0A2A20 14%, #07130E 50%, #0A2A20 86%, #0C3D2D 100%)',
      }}
    >
      {/* Meko zeleno svetlo iza sadržaja */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 50% 45% at 50% 42%, rgba(31,214,95,0.10) 0%, transparent 65%)' }}
      />

      {/* Ogroman, vrlo proziran outline sidra */}
      <svg
        viewBox="0 0 100 120"
        aria-hidden
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none w-[320px] md:w-[460px]"
        style={{ opacity: 0.05 }}
      >
        <g stroke="#FFFFFF" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="50" cy="11" r="7" />
          <line x1="50" y1="18" x2="50" y2="88" />
          <line x1="31" y1="29" x2="69" y2="29" />
          <path d="M22,66 C27,84 39,89 50,89 C61,89 73,84 78,66" />
          <path d="M22,66 L15,61" />
          <path d="M22,66 L27,57" />
          <path d="M78,66 L85,61" />
          <path d="M78,66 L73,57" />
        </g>
      </svg>

      {/* Vinjeta */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 75% 75% at 50% 50%, transparent 55%, rgba(2,8,5,0.55) 100%)' }}
      />

      <m.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex flex-col items-center"
      >
        <span
          className="connection-shimmer font-semibold leading-none"
          style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(96px, 22vw, 200px)' }}
        >
          404
        </span>

        <h1
          className="text-2xl md:text-3xl font-semibold mt-4 mb-3"
          style={{ fontFamily: 'Playfair Display, serif', color: '#FFFFFF' }}
        >
          {t('notFound.title')}
        </h1>

        <p className="max-w-sm text-sm leading-relaxed mb-8" style={{ color: 'rgba(255,255,255,0.55)' }}>
          {t('notFound.message')}
        </p>

        <DiamondButton variant="primary" onClick={() => navigate('/')} className="px-9 py-3.5 text-base">
          {t('notFound.home')}
        </DiamondButton>
      </m.div>
    </section>
  )
}
