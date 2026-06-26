import { useRef, useEffect } from 'react'
import { m } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import DiamondCanvas, { type DiamondCanvasHandle } from './DiamondCanvas'
import DiamondButton from './DiamondButton'

export default function Hero() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const subtitleWords = t('hero.subtitle').split(' ')

  const sectionRef = useRef<HTMLElement>(null)
  const tiltRef    = useRef<HTMLDivElement>(null)
  const canvasRef  = useRef<DiamondCanvasHandle>(null)

  const handleSectionClick = (e: React.MouseEvent<HTMLElement>) => {
    if (!sectionRef.current) return
    const rect = sectionRef.current.getBoundingClientRect()
    canvasRef.current?.triggerExplosion(
      e.clientX - rect.left,
      e.clientY - rect.top,
    )
  }

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const onMouseMove = (e: MouseEvent) => {
      const rect = section.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      // H1 3D tilt: max 3.5° rotateY, max 2° rotateX
      if (tiltRef.current) {
        const cx = rect.width / 2
        const cy = rect.height / 2
        const rotY =  ((x - cx) / cx) * 3.5
        const rotX = -((y - cy) / cy) * 2
        tiltRef.current.style.transition = 'transform 0.12s ease-out'
        tiltRef.current.style.transform  = `perspective(1200px) rotateX(${rotX}deg) rotateY(${rotY}deg)`
      }
    }

    // Na izlazu misa — glatko vracanje na 0
    const onMouseLeave = () => {
      if (tiltRef.current) {
        tiltRef.current.style.transition = 'transform 0.5s ease-out'
        tiltRef.current.style.transform  = 'perspective(1200px) rotateX(0deg) rotateY(0deg)'
      }
    }

    section.addEventListener('mousemove', onMouseMove)
    section.addEventListener('mouseleave', onMouseLeave)
    return () => {
      section.removeEventListener('mousemove', onMouseMove)
      section.removeEventListener('mouseleave', onMouseLeave)
    }
  }, [])


  return (
    <section
      ref={sectionRef}
      onClick={handleSectionClick}
      className="relative min-h-screen flex items-center justify-center pt-20 z-10"
      style={{
        background: `
          radial-gradient(ellipse 60% 60% at 15% 50%, rgba(31, 214, 95,0.07) 0%, transparent 70%),
          radial-gradient(ellipse 50% 50% at 85% 40%, rgba(31, 214, 95,0.06) 0%, transparent 70%),
          radial-gradient(ellipse 40% 40% at 60% 80%, rgba(31, 214, 95,0.04) 0%, transparent 70%),
          #ffffff
        `,
      }}
    >
      <DiamondCanvas ref={canvasRef} />

      <div className="relative z-10 text-center max-w-3xl mx-auto px-6">

        {/* H1 u wrapperu koji prima 3D tilt od misa */}
        <div ref={tiltRef} style={{ willChange: 'transform' }}>
          <m.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-5xl md:text-6xl lg:text-7xl font-semibold leading-tight mb-6"
            style={{ fontFamily: 'Playfair Display, serif', color: '#1A1A1A' }}
          >
            {t('hero.titleLine1')}
            <br />
            <span className="connection-shimmer">{t('hero.titleWord')}</span>
          </m.h1>
        </div>

        {/* Podnaslov — rijec po rijec typing animacija */}
        <p
          className="text-lg md:text-xl leading-relaxed mb-10 max-w-xl mx-auto"
          style={{ color: '#6B7280' }}
        >
          {subtitleWords.map((word, i) => (
            <m.span
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.65 + i * 0.055, ease: 'easeOut' }}
              style={{ display: 'inline-block', marginRight: '0.28em' }}
            >
              {word}
            </m.span>
          ))}
        </p>

        {/* Dugmici */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <DiamondButton variant="primary" onClick={() => navigate('/register')} className="px-9 py-4 text-base">{t('hero.startFree')}</DiamondButton>
          <DiamondButton variant="secondary" className="px-9 py-4 text-base">{t('hero.learnMore')}</DiamondButton>
        </m.div>
      </div>

    </section>
  )
}
