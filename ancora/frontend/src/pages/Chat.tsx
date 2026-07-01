import { m } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AncoraSVGLogo from '../components/AncoraSVGLogo'
import DiamondButton from '../components/DiamondButton'

/*
  Privremena "uskoro" stranica za /chat — dok ne dodamo Anthropic API ključ
  i napravimo pravi chat. Beli/minimalistički stil sa suptilnim animacijama.
*/
export default function Chat() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center overflow-hidden"
      style={{
        background: `
          radial-gradient(ellipse 55% 55% at 50% 38%, rgba(31,214,95,0.07) 0%, transparent 70%),
          #ffffff
        `,
      }}
    >
      {/* Logo gore levo — povratak na početnu */}
      <Link to="/" className="absolute top-6 left-6 md:top-8 md:left-8 flex items-center gap-2 group">
        <AncoraSVGLogo size={30} color="#1FD65F" />
        <span
          className="text-lg font-semibold tracking-tight transition-opacity duration-200 group-hover:opacity-80"
          style={{ fontFamily: 'Playfair Display, serif', color: '#1A1A1A' }}
        >
          Ancora
        </span>
      </Link>

      {/* Sidro koje lagano pluta */}
      <m.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="mb-8"
      >
        <AncoraSVGLogo size={72} color="#1FD65F" />
      </m.div>

      <m.span
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-xs font-semibold tracking-[0.2em] uppercase mb-4"
        style={{ color: '#15803D' }}
      >
        {t('chat.soonEyebrow')}
      </m.span>

      <m.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="text-4xl md:text-5xl font-semibold mb-5"
        style={{ fontFamily: 'Playfair Display, serif', color: '#1A1A1A' }}
      >
        {t('chat.soonTitle')}
      </m.h1>

      <m.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="max-w-md text-lg leading-relaxed mb-8"
        style={{ color: '#6B7280' }}
      >
        {t('chat.soonText')}
      </m.p>

      {/* Tri tačke koje pulsiraju — "u izradi" */}
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.35 }}
        className="flex items-center gap-2 mb-10"
      >
        {[0, 1, 2].map(i => (
          <m.span
            key={i}
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: '#1FD65F' }}
            animate={{ opacity: [0.25, 1, 0.25], scale: [0.85, 1, 0.85] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut', delay: i * 0.2 }}
          />
        ))}
      </m.div>

      <m.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.45 }}
      >
        <DiamondButton variant="primary" onClick={() => navigate('/')} className="px-9 py-3.5 text-base">
          {t('chat.back')}
        </DiamondButton>
      </m.div>
    </section>
  )
}
