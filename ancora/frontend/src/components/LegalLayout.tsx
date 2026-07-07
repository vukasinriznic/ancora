import type { ReactNode } from 'react'
import { m } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AncoraSVGLogo from './AncoraSVGLogo'

interface Props {
  title: string
  updated: string
  children: ReactNode
}

/* Deljeni layout za Privacy/Terms — belo, minimalistički, isti brend kao homepage. */
export default function LegalLayout({ title, updated, children }: Props) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white">
      {/* Header — logo + povratak, isti obrazac kao Chat/AuthShell */}
      <header className="max-w-3xl mx-auto px-6 pt-8 pb-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <AncoraSVGLogo size={28} color="#1FD65F" />
          <span
            className="text-lg font-semibold tracking-tight transition-opacity duration-200 group-hover:opacity-80"
            style={{ fontFamily: 'Playfair Display, serif', color: '#1A1A1A' }}
          >
            Ancora
          </span>
        </Link>
        <button
          onClick={() => navigate('/')}
          className="text-sm font-medium transition-colors duration-200 cursor-pointer"
          style={{ color: '#6B7280' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#1A1A1A')}
          onMouseLeave={e => (e.currentTarget.style.color = '#6B7280')}
        >
          {t('legal.back')}
        </button>
      </header>

      <m.main
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-3xl mx-auto px-6 pb-24"
      >
        <h1
          className="text-3xl md:text-4xl font-semibold mt-6 mb-2"
          style={{ fontFamily: 'Playfair Display, serif', color: '#1A1A1A' }}
        >
          {title}
        </h1>
        <p className="text-sm mb-10" style={{ color: '#9CA3AF' }}>
          {t('legal.updated', { date: updated })}
        </p>

        <div className="space-y-8">{children}</div>
      </m.main>
    </div>
  )
}
