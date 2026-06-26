import { m, AnimatePresence, useInView } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AnimatedWords from './AnimatedWords'
import DiamondButton from './DiamondButton'

// quote/name dolaze iz i18n po indeksu; ovdje samo godine + foto
const testimonials = [
  { age: 28, img: 'https://randomuser.me/api/portraits/women/44.jpg' },
  { age: 34, img: 'https://randomuser.me/api/portraits/men/32.jpg' },
  { age: 31, img: 'https://randomuser.me/api/portraits/women/68.jpg' },
]

const reassurances = [0, 1, 2]

/* Pleteni vertikalni lanac — metalik sheen kao u How it works */
function HangChain({ height }: { height: number }) {
  const W = 16, cx = W / 2, amp = 5, period = 26
  const N = Math.ceil(height / 3)
  // Period se prilagodi visini → dno SVAKOG lanca pada tačno na presek (obje niti
  // su tu prirodno u centru, x=cx). Tako nema "uštinuća" bez obzira na dužinu.
  const reps = Math.max(1, Math.round(height / period))
  const adjPeriod = height / reps
  // smoothstep samo blago zaglača prilaz centru na vrhu i dnu (vertikalna tangenta)
  const topPx = 6, endPx = 22
  const sm = (x: number) => { const c = Math.max(0, Math.min(1, x)); return c * c * (3 - 2 * c) }
  const build = (phase: number) => {
    let d = ''
    for (let i = 0; i <= N; i++) {
      const y = (i / N) * height
      const taper = sm(y / topPx) * sm((height - y) / endPx)
      const x = cx + amp * taper * Math.sin((y / adjPeriod) * Math.PI + phase)
      d += (i === 0 ? 'M ' : ' L ') + `${x.toFixed(1)} ${y.toFixed(1)}`
    }
    return d
  }
  const dA = build(0), dB = build(Math.PI)
  return (
    <svg width={W} height={height} viewBox={`0 0 ${W} ${height}`} fill="none" style={{ display: 'block' }}>
      <defs>
        <linearGradient id="curtainChain" gradientUnits="userSpaceOnUse" x1={cx - amp - 4} y1="0" x2={cx + amp + 4} y2="0">
          <stop offset="0%"   stopColor="#15803D" />
          <stop offset="50%"  stopColor="#6EE7A0" />
          <stop offset="100%" stopColor="#15803D" />
        </linearGradient>
      </defs>
      {/* Faint vodilje — daju dubinu */}
      <path d={dA} stroke="#A7F3D0" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
      <path d={dB} stroke="#BBF7D0" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
      {/* Metalik upletene niti */}
      <path d={dA} stroke="url(#curtainChain)" strokeWidth="2.5" strokeLinecap="round" />
      <path d={dB} stroke="url(#curtainChain)" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

/* Sidro koje visi na kraju lanca */
function AnchorMark() {
  return (
    <svg width="36" height="43" viewBox="0 0 100 120" fill="none" style={{ display: 'block' }}>
      <circle cx="50" cy="11" r="7" stroke="#1FD65F" strokeWidth="6" />
      <line x1="50" y1="18" x2="50" y2="88" stroke="#1FD65F" strokeWidth="6" />
      <path d="M31,29 L69,29" stroke="#1FD65F" strokeWidth="6" fill="none" />
      <path d="M22,66 C27,84 39,89 50,89 C61,89 73,84 78,66" stroke="#1FD65F" strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M22,66 L15,61"  stroke="#1FD65F" strokeWidth="6" strokeLinecap="round" />
      <path d="M22,66 L27,57" stroke="#1FD65F" strokeWidth="6" strokeLinecap="round" />
      <path d="M78,66 L85,61" stroke="#1FD65F" strokeWidth="6" strokeLinecap="round" />
      <path d="M78,66 L73,57" stroke="#1FD65F" strokeWidth="6" strokeLinecap="round" />
    </svg>
  )
}

/* 4 lanca u testimonial sekciji — 2 lijevo, 2 desno, različitih dužina */
const CHAINS = [
  { x: 5,  len: 230, sway: 2.1, dur: 6.6 },   // lijevo vanjski
  { x: 13, len: 350, sway: 1.5, dur: 7.6 },   // lijevo unutrašnji
  { x: 87, len: 300, sway: 1.8, dur: 7.0 },   // desno unutrašnji
  { x: 95, len: 200, sway: 2.3, dur: 8.1 },   // desno vanjski
]

export default function CtaSection() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const cRef    = useRef(null)
  const cInView = useInView(cRef, { once: true, margin: '-100px' })

  const tRef    = useRef(null)
  const tInView = useInView(tRef, { once: true, margin: '-120px' })

  const [idx, setIdx] = useState(0)

  // Auto-rotacija (kreće kad testimonial uđe u vidno polje). setTimeout je vezan
  // za `idx` → ručni klik na tačkicu resetuje tajmer, pa se sledeća smena desi
  // tek nakon punog intervala (vremena da se pročita izabrani citat).
  useEffect(() => {
    if (!tInView) return
    const id = setTimeout(() => setIdx(i => (i + 1) % testimonials.length), 5200)
    return () => clearTimeout(id)
  }, [tInView, idx])

  const tm = testimonials[idx]

  return (
    <>
      {/* ════════ Testimonials — svijetli predah ════════ */}
      <section className="relative py-28 px-6 bg-white overflow-hidden">

        {/* 4 lanca sa sidrima — zakačena na kraju About-a, vise u ovoj sekciji
            (2 lijevo, 2 desno, različite dužine, njišu se) */}
        <div className="hidden lg:block absolute inset-0 pointer-events-none" style={{ zIndex: 5 }} aria-hidden>
          {CHAINS.map((c, i) => (
            <m.div
              key={i}
              className="absolute"
              style={{ left: `${c.x}%`, top: 0, width: 0, transformOrigin: '0 0' }}
              initial={{ rotate: c.sway }}
              animate={{ rotate: [c.sway, -c.sway, c.sway] }}
              transition={{ duration: c.dur, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}
            >
              {/* eyelet (zakačaljka na kraju About-a) */}
              <div
                className="absolute rounded-full"
                style={{ top: 0, left: 0, transform: 'translateX(-50%)', width: 9, height: 9, border: '2.5px solid #15803D' }}
              />
              {/* lanac */}
              <div className="absolute top-0" style={{ left: 0, transform: 'translateX(-50%)' }}>
                <HangChain height={c.len} />
              </div>
              {/* sidro na dnu lanca — ring prekriva tačku gdje se niti zatvore */}
              <div className="absolute" style={{ top: c.len - 5, left: 0, transform: 'translateX(-50%)' }}>
                <AnchorMark />
              </div>
            </m.div>
          ))}
        </div>

        <div
          ref={tRef}
          className="relative z-10 max-w-2xl mx-auto text-center"
        >
          <m.div
            className="text-xs font-semibold tracking-[0.25em] uppercase mb-3" style={{ color: '#1FD65F' }}
            initial={{ opacity: 0, y: 12 }}
            animate={tInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            {t('cta.eyebrow')}
          </m.div>
          <m.span
            className="block select-none leading-none mb-1 pointer-events-none"
            style={{ fontFamily: 'Playfair Display, serif', fontSize: 76, fontWeight: 700, color: 'rgba(21, 128, 61,0.16)' }}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={tInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          >
            &ldquo;
          </m.span>

          <m.div
            className="relative" style={{ minHeight: 220 }}
            initial={{ opacity: 0, y: 16 }}
            animate={tInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          >
            <AnimatePresence mode="wait">
              <m.div
                key={idx}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <m.p
                  className="text-2xl md:text-3xl leading-snug italic mb-9"
                  style={{ fontFamily: 'Playfair Display, serif', color: '#1A1A1A' }}
                  initial={{ opacity: 0, y: 18, filter: 'blur(5px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
                >
                  {t(`cta.testimonials.${idx}.quote`)}
                </m.p>
                <m.div
                  className="flex items-center justify-center gap-3"
                  initial={{ opacity: 0, y: 12, scale: 0.88 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.24 }}
                >
                  <img
                    src={tm.img}
                    alt={t(`cta.testimonials.${idx}.name`)}
                    loading="lazy"
                    className="w-12 h-12 rounded-full object-cover"
                    style={{ border: '1.5px solid rgba(21, 128, 61,0.45)', boxShadow: '0 4px 14px rgba(21, 128, 61,0.18)' }}
                  />
                  <div className="text-left">
                    <div className="text-sm font-semibold" style={{ color: '#1A1A1A' }}>{t(`cta.testimonials.${idx}.name`)}</div>
                    <div className="text-xs" style={{ color: '#9CA3AF' }}>{t('cta.age', { age: tm.age })}</div>
                  </div>
                </m.div>
              </m.div>
            </AnimatePresence>
          </m.div>

          <m.div
            className="flex items-center justify-center gap-2 mt-10"
            initial={{ opacity: 0 }}
            animate={tInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.35 }}
          >
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                aria-label={`Show testimonial ${i + 1}`}
                className="rounded-full transition-all duration-300 cursor-pointer"
                style={{
                  width: i === idx ? 22 : 8, height: 8,
                  backgroundColor: i === idx ? '#1FD65F' : 'rgba(31, 214, 95,0.25)',
                }}
              />
            ))}
          </m.div>
        </div>
      </section>

      {/* ════════ CTA — tamna breakout traka (dominira) ════════ */}
      <section
        ref={cRef}
        data-theme="dark"
        className="relative px-6 py-28 overflow-hidden min-h-screen flex items-center justify-center"
        style={{ background: 'radial-gradient(ellipse 75% 95% at 50% 50%, #114433 0%, #0A1D15 55%, #07120D 100%)' }}
      >
        {/* Water ripple — sidro u vodi */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ zIndex: 0 }}>
          {[0, 1, 2, 3].map(i => (
            <m.div
              key={i}
              className="absolute rounded-full border"
              style={{ width: 280, height: 280, marginLeft: -140, marginTop: -140, borderColor: 'rgba(84, 233, 138,0.3)' }}
              initial={{ scale: 0.2, opacity: 0 }}
              animate={cInView ? { scale: 3, opacity: [0, 0.5, 0] } : {}}
              transition={{ duration: 7.5, repeat: Infinity, ease: 'easeOut', delay: i * 1.9 }}
            />
          ))}
        </div>

        <div className="relative max-w-3xl mx-auto text-center" style={{ zIndex: 1 }}>
          <h2
            className="text-5xl md:text-6xl font-semibold mb-6"
            style={{ fontFamily: 'Playfair Display, serif', color: '#FFFFFF', letterSpacing: '-0.01em' }}
          >
            <AnimatedWords isInView={cInView} delay={0.1} stagger={0.08}>
              {t('cta.title')}
            </AnimatedWords>
          </h2>

          <p className="text-lg md:text-xl mb-12 max-w-lg mx-auto" style={{ color: 'rgba(255,255,255,0.6)' }}>
            <AnimatedWords isInView={cInView} delay={0.45} stagger={0.075}>
              {t('cta.subtitle')}
            </AnimatedWords>
          </p>

          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={cInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="relative inline-block"
          >
            <div
              className="absolute inset-0 -z-10 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse 90% 160% at 50% 50%, rgba(31, 214, 95,0.5) 0%, transparent 70%)', filter: 'blur(26px)' }}
            />
            <DiamondButton variant="primary" onClick={() => navigate('/register')} className="px-12 py-4 text-base">{t('cta.button')}</DiamondButton>
          </m.div>

          <m.div
            initial={{ opacity: 0 }}
            animate={cInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium"
            style={{ color: 'rgba(255,255,255,0.5)' }}
          >
            {reassurances.map((i) => (
              <span key={i} className="inline-flex items-center gap-1.5">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12.5l4 4 10-10" stroke="#54E98A" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {t(`cta.reassurances.${i}`)}
              </span>
            ))}
          </m.div>
        </div>
      </section>
    </>
  )
}
