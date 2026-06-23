import { m, useInView } from 'framer-motion'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import AnimatedWords from './AnimatedWords'
import CurtainMesh from './CurtainMesh'

const values = [0, 1, 2]

export default function About() {
  const { t }    = useTranslation()
  const ref      = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section
      id="about"
      ref={ref}
      data-theme="dark"
      className="relative min-h-screen flex flex-col justify-center py-32 px-6 overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #0C3D2D 0%, #0A2A20 18%, #07130E 50%, #0A2A20 82%, #0C3D2D 100%)',
      }}
    >
      {/* Spotlight — meko zeleno svjetlo u centru (iza mreže) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 55% at 50% 42%, rgba(31, 214, 95,0.09) 0%, transparent 60%)' }}
      />

      {/* Interaktivna "zavjesa" — Verlet cloth koji se talasa i skuplja oko kursora */}
      <CurtainMesh />

      {/* Bočna vinjeta — fokusira centar, ne dira vrh/dno (čuva prelaz u bijelo) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(90deg, rgba(4,12,9,0.55) 0%, transparent 16%, transparent 84%, rgba(4,12,9,0.55) 100%)' }}
      />

      <div className="relative z-10 max-w-5xl mx-auto">

        {/* Big quote — word by word */}
        <blockquote className="text-center mb-6">
          <p
            className="text-3xl md:text-4xl lg:text-5xl font-semibold italic leading-tight"
            style={{ fontFamily: 'Playfair Display, serif', color: '#FFFFFF' }}
          >
            <AnimatedWords isInView={isInView} delay={0.15} stagger={0.065}>
              {t('about.quote')}
            </AnimatedWords>
          </p>
        </blockquote>

        {/* Potpis — sidro + atribucija */}
        <m.div
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 1.3 }}
          className="flex items-center justify-center gap-3 mb-16"
        >
          <span className="h-px w-8" style={{ background: 'linear-gradient(90deg, transparent, rgba(31, 214, 95,0.5))' }} />
          <svg width="15" height="18" viewBox="0 0 100 120" fill="none" aria-hidden>
            <circle cx="50" cy="11" r="7" stroke="#1FD65F" strokeWidth="6" />
            <line x1="50" y1="18" x2="50" y2="88" stroke="#1FD65F" strokeWidth="6" />
            <path d="M31,29 L69,29" stroke="#1FD65F" strokeWidth="6" fill="none" />
            <path d="M22,66 C27,84 39,89 50,89 C61,89 73,84 78,66" stroke="#1FD65F" strokeWidth="6" fill="none" strokeLinecap="round" />
            <path d="M22,66 L15,61"  stroke="#1FD65F" strokeWidth="6" strokeLinecap="round" />
            <path d="M22,66 L27,57" stroke="#1FD65F" strokeWidth="6" strokeLinecap="round" />
            <path d="M78,66 L85,61" stroke="#1FD65F" strokeWidth="6" strokeLinecap="round" />
            <path d="M78,66 L73,57" stroke="#1FD65F" strokeWidth="6" strokeLinecap="round" />
          </svg>
          <span className="text-[10px] sm:text-xs font-medium tracking-[0.12em] sm:tracking-[0.25em] uppercase text-center" style={{ color: 'rgba(31, 214, 95,0.85)' }}>
            {t('about.principle')}
          </span>
          <span className="h-px w-8" style={{ background: 'linear-gradient(90deg, rgba(31, 214, 95,0.5), transparent)' }} />
        </m.div>

        <p
          className="text-center text-base mb-20 max-w-xl mx-auto"
          style={{ color: '#6B7280' }}
        >
          <AnimatedWords isInView={isInView} delay={0.9} stagger={0.035}>
            {t('about.paragraph')}
          </AnimatedWords>
        </p>

        {/* Values — glass pločice */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          {values.map((i) => (
            <m.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: 0.5 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="group relative rounded-2xl p-8 text-center border border-white/10 bg-white/[0.03] backdrop-blur-sm transition-colors duration-500 hover:border-[#1FD65F]/40"
              style={{ boxShadow: '0 1px 0 rgba(255,255,255,0.04) inset' }}
            >
              {/* Hover glow — tile zasvijetli iznutra */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-500"
                style={{ background: 'radial-gradient(ellipse 85% 70% at 50% 30%, rgba(31, 214, 95,0.14) 0%, transparent 70%)' }}
              />

              {/* Diamond ikona u ring-u */}
              <div className="relative inline-flex items-center justify-center mb-6" style={{ width: 56, height: 56 }}>
                {/* Bloom iza dijamanta na hover */}
                <div
                  className="absolute rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ width: 56, height: 56, background: 'radial-gradient(circle, rgba(31, 214, 95,0.5) 0%, transparent 62%)', filter: 'blur(6px)' }}
                />
                <div className="absolute inset-0 rounded-full" style={{ border: '1px solid rgba(31, 214, 95,0.2)' }} />
                <div className="absolute rounded-full" style={{ width: 40, height: 40, border: '1px solid rgba(31, 214, 95,0.28)' }} />
                <span
                  className="relative block rotate-45 transition-transform duration-500 ease-out group-hover:scale-[1.18]"
                  style={{
                    width: 14, height: 14,
                    background: 'linear-gradient(135deg, #54E98A 0%, #1FD65F 100%)',
                    boxShadow: '0 0 16px rgba(31, 214, 95,0.55)',
                  }}
                />
              </div>

              <h3 className="text-lg font-semibold mb-2 relative" style={{ fontFamily: 'Playfair Display, serif', color: '#FFFFFF' }}>
                {t(`about.values.${i}.label`)}
              </h3>
              <p className="text-sm leading-relaxed relative" style={{ color: '#9CA3AF' }}>
                {t(`about.values.${i}.desc`)}
              </p>
            </m.div>
          ))}
        </div>

      </div>
    </section>
  )
}
