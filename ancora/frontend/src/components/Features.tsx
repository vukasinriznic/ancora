import { m, useInView, useReducedMotion } from 'framer-motion'
import { useEffect, useId, useRef, useState, type CSSProperties, type FC } from 'react'
import { useTranslation } from 'react-i18next'
import AnimatedWords from './AnimatedWords'

/* transform-origin u koordinatama viewBox-a (centar ikone = 14,14) */
const SPIN_ORIGIN = { transformBox: 'view-box', transformOrigin: '14px 14px' } as CSSProperties

/* ── Animirane ikonice (svaka loop bešavno: rotacija 0→360 ili scale a→a) ── */

/* Radar — rotirajući sweep + ekspandirajući ping prsten */
function RadarIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="10" stroke="currentColor" strokeWidth="1.6" opacity="0.9" />
      <circle cx="14" cy="14" r="6"  stroke="currentColor" strokeWidth="1.2" opacity="0.4" />
      <circle cx="14" cy="14" r="1.6" fill="currentColor" />
      {/* Ping — fade in/out, nema pop na restart */}
      <m.circle
        cx="14" cy="14" stroke="currentColor" strokeWidth="1.4" fill="none"
        initial={{ r: 2, opacity: 0 }}
        animate={{ r: [2, 11], opacity: [0, 0.55, 0] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: 'easeOut' }}
      />
      {/* Sweep — rotacija oko centra (linearno, 360≡0 → bešavno) */}
      <m.g
        style={SPIN_ORIGIN}
        animate={{ rotate: 360 }}
        transition={{ duration: 3.4, repeat: Infinity, ease: 'linear' }}
      >
        <path d="M14 14 L14 4.5 A 9.5 9.5 0 0 1 21 7.2 Z" fill="currentColor" opacity="0.16" />
        <line x1="14" y1="14" x2="14" y2="4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </m.g>
    </svg>
  )
}

/* Heart — otkucaj (lub-dub pa pauza); scale a→a → bešavno */
function HeartIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
      <m.path
        d="M14 22 C 6 16, 4 11, 7 8.5 C 9 6.8, 12 7.2, 14 10 C 16 7.2, 19 6.8, 21 8.5 C 24 11, 22 16, 14 22 Z"
        stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinejoin="round"
        style={SPIN_ORIGIN}
        animate={{ scale: [1, 1.16, 1, 1.1, 1] }}
        transition={{ duration: 1.9, repeat: Infinity, ease: 'easeInOut', times: [0, 0.12, 0.24, 0.36, 1] }}
      />
    </svg>
  )
}

/* Shield — shimmer linija klizi odozgo nadolje (fade na ivicama → bešavno) */
function ShieldIcon() {
  const id = useId().replace(/:/g, '')
  return (
    <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
      <defs>
        <clipPath id={`sh-${id}`}>
          <path d="M14 5L6 10v8l8 5 8-5v-8L14 5z" />
        </clipPath>
      </defs>
      <path d="M14 5L6 10v8l8 5 8-5v-8L14 5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M11.5 14l1.8 1.8 3.4-3.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <g clipPath={`url(#sh-${id})`}>
        <m.rect
          x="3" width="22" height="4" rx="2" fill="currentColor"
          initial={{ y: 4, opacity: 0 }}
          animate={{ y: [4, 22], opacity: [0, 0.4, 0] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
        />
      </g>
    </svg>
  )
}

/* Clock — sekundara rotira 0→360 (linearno → bešavno) */
function ClockIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="9.5" stroke="currentColor" strokeWidth="1.6" strokeDasharray="3 2" />
      <path d="M14 9v5l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.55" />
      <m.line
        x1="14" y1="14" x2="14" y2="6.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"
        style={SPIN_ORIGIN}
        animate={{ rotate: 360 }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'linear' }}
      />
      <circle cx="14" cy="14" r="1.4" fill="currentColor" />
    </svg>
  )
}

/* Sidro identično logo-u (AncoraSVGLogo) — ista geometrija i tanak stroke */
function AnchorGlyph({ size = 22, color = 'currentColor', strokeWidth = 1.6 }: {
  size?: number; color?: string; strokeWidth?: number
}) {
  return (
    <svg width={size} height={size * 1.2} viewBox="0 0 100 120" fill="none">
      <circle cx="50" cy="11" r="7" stroke={color} strokeWidth={strokeWidth} />
      <line x1="50" y1="18" x2="50" y2="88" stroke={color} strokeWidth={strokeWidth} />
      <path d="M31,29 L69,29" stroke={color} strokeWidth={strokeWidth} fill="none" />
      <path d="M22,66 C27,84 39,89 50,89 C61,89 73,84 78,66" stroke={color} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" />
      <path d="M22,66 L15,61"  stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <path d="M22,66 L27,57" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <path d="M78,66 L85,61" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <path d="M78,66 L73,57" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  )
}

/* Isto sidro, ali se iscrtava potezom kad `play` postane true (poleđina na flip) */
function DrawAnchor({ play, size = 104, color = '#FFFFFF', strokeWidth = 2 }: {
  play: boolean; size?: number; color?: string; strokeWidth?: number
}) {
  const stroke = {
    stroke: color, strokeWidth, fill: 'none' as const, strokeLinecap: 'round' as const,
    initial: { pathLength: 0 },
    animate: { pathLength: play ? 1 : 0 },
  }
  const t = (d: number) => ({ duration: 0.9, delay: play ? 0.3 + d : 0, ease: 'easeInOut' as const })
  return (
    <svg width={size} height={size * 1.2} viewBox="0 0 100 120" fill="none">
      <m.circle cx="50" cy="11" r="7" {...stroke} transition={t(0)} />
      <m.line x1="50" y1="18" x2="50" y2="88" {...stroke} transition={t(0.1)} />
      <m.path d="M31,29 L69,29" {...stroke} transition={t(0.18)} />
      <m.path d="M22,66 C27,84 39,89 50,89 C61,89 73,84 78,66" {...stroke} transition={t(0.34)} />
      <m.path d="M22,66 L15,61"  {...stroke} transition={t(0.5)} />
      <m.path d="M22,66 L27,57" {...stroke} transition={t(0.5)} />
      <m.path d="M78,66 L85,61" {...stroke} transition={t(0.5)} />
      <m.path d="M78,66 L73,57" {...stroke} transition={t(0.5)} />
    </svg>
  )
}

type Feature = {
  Icon: FC
  number: string
  // tekst (title / essence / description) dolazi iz i18n po indeksu
}

const features: Feature[] = [
  { Icon: RadarIcon,  number: '01' },
  { Icon: HeartIcon,  number: '02' },
  { Icon: ShieldIcon, number: '03' },
  { Icon: ClockIcon,  number: '04' },
]

/* Tekst koji se ispisuje riječ po riječ kad `play` postane true */
function RevealText({ text, play }: { text: string; play: boolean }) {
  const words = text.split(' ')
  return (
    <m.p
      className="text-[17px] leading-relaxed"
      style={{ color: '#FFFFFF', fontFamily: 'Playfair Display, serif' }}
      initial="hidden"
      animate={play ? 'visible' : 'hidden'}
      variants={{
        visible: { transition: { staggerChildren: 0.04, delayChildren: 0.28 } },
        hidden:  { transition: { staggerChildren: 0.01 } },
      }}
    >
      {words.map((w, i) => (
        <m.span
          key={i}
          className="inline-block"
          style={{ marginRight: '0.28em' }}
          variants={{
            hidden:  { opacity: 0, y: 8, filter: 'blur(4px)' },
            visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
          }}
          transition={{ duration: 0.32, ease: 'easeOut' }}
        >
          {w}
        </m.span>
      ))}
    </m.p>
  )
}

/* Pleteni lanac (isti stil kao HowItWorks) — meandrira/njiše se dok pada */
function SideChain({ height }: { height: number }) {
  const gid = useId().replace(/:/g, '')
  const W = 44, cx = W / 2, weaveAmp = 5, swayAmp = 11, period = 26
  const N = Math.min(Math.ceil(height / 4), 220)
  // Centralna osa se njiše (gentle S kroz visinu), niti se pletu oko nje
  const baseX = (t: number) => cx + swayAmp * Math.sin(t * Math.PI * 2.2)
  const build = (phase: number) => {
    let d = ''
    for (let i = 0; i <= N; i++) {
      const t = i / N
      const y = t * height
      const px = baseX(t) + weaveAmp * Math.sin((y / period) * Math.PI + phase)
      d += (i === 0 ? 'M ' : ' L ') + `${px.toFixed(1)} ${y.toFixed(1)}`
    }
    return d
  }
  return (
    <svg width={W} height={height} viewBox={`0 0 ${W} ${height}`} fill="none" style={{ display: 'block' }}>
      <defs>
        <linearGradient id={`cm-${gid}`} x1="0" y1="0" x2={W} y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#15803D" />
          <stop offset="50%"  stopColor="#6EE7A0" />
          <stop offset="100%" stopColor="#15803D" />
        </linearGradient>
      </defs>
      <path d={build(0)}        stroke={`url(#cm-${gid})`} strokeWidth="2.5" strokeLinecap="round" />
      <path d={build(Math.PI)} stroke={`url(#cm-${gid})`} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

/* ── Liquid rise kartica — zelena "voda" se diže i otkriva opis ── */
const CARD_H = 292

/* Mjehurići koji se dižu kroz vodu (x %, veličina, trajanje, kašnjenje, sway) */
const BUBBLES = [
  { x: 24, size: 6, dur: 3.0, delay: 0.2, sway: -7 },
  { x: 50, size: 4, dur: 2.6, delay: 0.9, sway:  6 },
  { x: 70, size: 7, dur: 3.5, delay: 0.5, sway: -6 },
  { x: 38, size: 3, dur: 2.4, delay: 1.5, sway:  8 },
  { x: 82, size: 5, dur: 3.2, delay: 1.1, sway: -5 },
]

function LiquidCard({ feature, index, inView, flat }: {
  feature: Feature
  index: number
  inView: boolean
  flat: boolean           // true → bez vode (mobile / reduced-motion): pokaži sve statički
}) {
  const { t } = useTranslation()
  const title       = t(`features.items.${index}.title`)
  const essence     = t(`features.items.${index}.essence`)
  const description = t(`features.items.${index}.description`)

  // Desktop (md+): samo hover aktivira. Mobile: klik toggleuje obje strane.
  const getIsDesktop = () => typeof window !== 'undefined' && window.innerWidth >= 768
  const [isDesktop, setIsDesktop] = useState(getIsDesktop)
  useEffect(() => {
    const handler = () => setIsDesktop(getIsDesktop())
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [tapped,  setTapped]  = useState(false)
  const active = !flat && (isDesktop ? (hovered || focused) : tapped)

  const decorations = (
    <>
      {/* Top accent */}
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(21, 128, 61,0.5) 50%, transparent)' }} />
      {/* Gornji-lijevi glow (uz ikonu) */}
      <div className="absolute top-0 left-0 w-44 h-44 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 0% 0%, rgba(21, 128, 61,0.09) 0%, transparent 70%)' }} />
      {/* Dot-grid tekstura */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(rgba(21, 128, 61,0.09) 1px, transparent 1px)',
          backgroundSize: '17px 17px',
          maskImage: 'radial-gradient(ellipse 75% 75% at 26% 30%, #000 0%, transparent 72%)',
          WebkitMaskImage: 'radial-gradient(ellipse 75% 75% at 26% 30%, #000 0%, transparent 72%)',
        }} />
    </>
  )

  const frontInner = (
    <>
      {/* Ikona u gradient ring-u */}
      <div className="inline-flex items-center justify-center mb-6 flex-shrink-0"
        style={{
          width: 54, height: 54, borderRadius: 16, color: '#FFFFFF',
          background: 'linear-gradient(140deg, #15803D 0%, #12914F 50%, #0C4A30 100%)',
          boxShadow: '0 8px 20px rgba(12,61,45,0.28), inset 0 1px 0 rgba(255,255,255,0.28)',
        }}>
        <feature.Icon />
      </div>

      <h3 className="text-xl font-semibold mb-2.5" style={{ fontFamily: 'Playfair Display, serif', color: '#1A1A1A' }}>
        {title}
      </h3>

      <p className="text-[15px]" style={{ color: '#15803D', fontWeight: 500 }}>
        {essence}
      </p>
    </>
  )

  const baseStyle = {
    borderRadius: 20, overflow: 'hidden',
    background: 'linear-gradient(150deg, #ffffff 0%, #f7faf8 100%)',
    border: '1px solid rgba(21, 128, 61,0.16)',
    boxShadow: '0 1px 0 rgba(255,255,255,0.9) inset, 0 18px 44px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.02)',
  } as CSSProperties

  // ── Mobile / reduced-motion: statična kartica, sve vidljivo ──
  if (flat) {
    return (
      <m.div
        initial={{ opacity: 0, y: 34, filter: 'blur(10px)' }}
        animate={inView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
        transition={{ duration: 0.8, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
        className="relative"
        style={baseStyle}
      >
        {decorations}
        <div className="relative p-7 flex flex-col">
          {frontInner}
          <p className="text-sm leading-relaxed mt-4" style={{ color: '#6B7280' }}>
            {description}
          </p>
        </div>
      </m.div>
    )
  }

  // ── Desktop: liquid rise ──
  return (
    <m.div
      initial={{ opacity: 0, y: 34, filter: 'blur(10px)' }}
      animate={inView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
      transition={{ duration: 0.8, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      tabIndex={0}
      role="button"
      aria-label={`${title} — ${essence}`}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onClick={isDesktop ? undefined : () => setTapped(prev => !prev)}
      className="relative outline-none focus-visible:ring-2"
      style={{ ...baseStyle, height: CARD_H, ['--tw-ring-color' as string]: 'rgba(21, 128, 61,0.45)' } as CSSProperties}
    >
      {/* Lanac niz desnu ivicu — voda ga potapa na hover */}
      <div className="absolute top-0 pointer-events-none" style={{ right: 8, height: CARD_H, opacity: 0.6 }}>
        <SideChain height={CARD_H} />
      </div>

      {/* ── Front sloj — ostaje; voda ga prekriva (potapa) na hover ── */}
      <div className="absolute inset-0">
        {decorations}
        <div className="relative h-full p-7 flex flex-col">
          {frontInner}
          <div className="mt-auto pt-4 flex items-center gap-1.5 text-xs font-medium" style={{ color: '#15803D' }}>
            <span>{isDesktop ? t('features.diveIn') : t('features.diveInMobile')}</span>
            <AnchorGlyph size={14} color="currentColor" strokeWidth={2} />
          </div>
        </div>
      </div>

      {/* ── Voda koja se diže odozdo ── */}
      <m.div
        className="absolute left-0 right-0 bottom-0 pointer-events-none"
        style={{ background: 'linear-gradient(180deg, #114433 0%, #0C3D2D 42%, #07130E 100%)' }}
        initial={false}
        animate={{ height: active ? CARD_H + 36 : 0 }}
        transition={{ duration: 1.25, ease: [0.33, 1, 0.68, 1] }}
      >
        {/* Valovita površina — opacity vezana za hover (u mirovanju nema mrlje) */}
        <div className="absolute left-0 right-0" style={{ top: 0, height: 32, transform: 'translateY(-95%)', overflow: 'hidden', opacity: active ? 1 : 0, transition: 'opacity 0.4s ease' }}>
          <m.svg
            viewBox="0 0 200 32" preserveAspectRatio="none" width="200%" height="32"
            style={{ display: 'block' }}
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'linear' }}
          >
            <path d="M0,32 L0,16 C16,2 34,2 50,16 C66,30 84,30 100,16 C116,2 134,2 150,16 C166,30 184,30 200,16 L200,32 Z" fill="#114433" />
          </m.svg>
        </div>
        {/* Mjehurići se dižu kroz vodu */}
        {active && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {BUBBLES.map((b, i) => (
              <m.span
                key={i}
                className="absolute rounded-full"
                style={{ left: `${b.x}%`, bottom: -12, width: b.size, height: b.size, background: 'rgba(255,255,255,0.4)' }}
                initial={{ y: 0, x: 0, opacity: 0 }}
                animate={{ y: -(CARD_H + 24), x: [0, b.sway, 0], opacity: [0, 0.55, 0] }}
                transition={{ duration: b.dur, repeat: Infinity, delay: b.delay, ease: 'easeOut' }}
              />
            ))}
          </div>
        )}
      </m.div>

      {/* ── Back sloj — opis izranja iznad vode ── */}
      <m.div
        className="absolute inset-0 p-7 flex flex-col"
        style={{ pointerEvents: 'none' }}
        animate={{ opacity: active ? 1 : 0 }}
        transition={{ duration: 0.45, delay: active ? 0.55 : 0, ease: 'easeOut' }}
      >
        <div className="anim-border" style={{ '--bc': 'rgba(255,255,255,0.85)' } as unknown as CSSProperties} />
        {/* Veliko sidro iz logoa — iscrtava se potezom */}
        <div className="absolute bottom-3 right-3 pointer-events-none" style={{ opacity: 0.16 }}>
          <DrawAnchor play={active} size={104} color="#FFFFFF" strokeWidth={2} />
        </div>
        <div className="flex items-center gap-2.5 mb-4" style={{ color: 'rgba(255,255,255,0.92)' }}>
          <AnchorGlyph size={20} color="rgba(255,255,255,0.92)" strokeWidth={2} />
          <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.7)' }}>
            {title}
          </span>
        </div>
        <RevealText text={description} play={active} />
      </m.div>
    </m.div>
  )
}

/* Suptilan brand node u centru mreže (gdje se 4 kartice sastaju) */
function CenterNode({ inView }: { inView: boolean }) {
  return (
    <div className="hidden md:block absolute pointer-events-none" style={{ left: '50%', top: '50%', zIndex: 5 }}>
      {/* Tri fazno pomjerena prstena → kontinuirano emitovanje bez skoka */}
      {inView && [0, 1, 2].map((i) => (
        <m.div
          key={i}
          className="absolute rounded-full"
          style={{ width: 14, height: 14, marginLeft: -7, marginTop: -7, border: '1.5px solid rgba(31, 214, 95,0.45)' }}
          initial={{ scale: 1, opacity: 0 }}
          animate={{ scale: [1, 3.6], opacity: [0, 0.45, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeOut', delay: 0.6 + i }}
        />
      ))}
      {/* Dijamant */}
      <m.div
        initial={{ opacity: 0, scale: 0.4, rotate: 0 }}
        animate={inView ? { opacity: 1, scale: 1, rotate: 45 } : {}}
        transition={{ duration: 0.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="absolute"
        style={{
          width: 14, height: 14, marginLeft: -7, marginTop: -7,
          background: '#1FD65F',
          boxShadow: '0 0 0 5px rgba(31, 214, 95,0.12), 0 0 18px rgba(31, 214, 95,0.4)',
        }}
      />
    </div>
  )
}

export default function Features() {
  const { t } = useTranslation()
  const headRef    = useRef(null)
  const headInView = useInView(headRef, { once: true, margin: '-80px' })

  const gridRef    = useRef(null)
  const gridInView = useInView(gridRef, { once: true, margin: '-100px' })

  const reduce = useReducedMotion()

  return (
    <section id="features" className="py-28 bg-white">
      <div className="max-w-6xl mx-auto px-6">

        <div ref={headRef} className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-semibold mb-4" style={{ fontFamily: 'Playfair Display, serif', color: '#1A1A1A' }}>
            <AnimatedWords isInView={headInView} delay={0} stagger={0.07}>{t('features.title')}</AnimatedWords>
          </h2>
          <p className="text-lg max-w-md mx-auto" style={{ color: '#6B7280' }}>
            <AnimatedWords isInView={headInView} delay={0.2} stagger={0.04}>
              {t('features.subtitle')}
            </AnimatedWords>
          </p>
        </div>

        <div ref={gridRef}>
          {/* ── Desktop: 2×2 flip kartice sa center node ── */}
          <div className="hidden md:block relative max-w-6xl mx-auto">
            {/* Ambient glow iza mreže — dubina */}
            <m.div
              className="absolute pointer-events-none"
              style={{
                left: '50%', top: '50%', width: '85%', height: '85%',
                transform: 'translate(-50%, -50%)', zIndex: 0,
                background: 'radial-gradient(ellipse at center, rgba(21, 128, 61,0.07) 0%, transparent 65%)',
                filter: 'blur(20px)',
              }}
              initial={{ opacity: 0 }}
              animate={gridInView ? { opacity: 1 } : {}}
              transition={{ duration: 1.2, delay: 0.3 }}
            />
            <CenterNode inView={gridInView} />
            <div className="grid grid-cols-2 gap-8 relative" style={{ zIndex: 1 }}>
              {features.map((f, i) => (
                <LiquidCard key={f.number} feature={f} index={i} inView={gridInView} flat={!!reduce} />
              ))}
            </div>
          </div>

          {/* ── Mobile: liquid kartice (tap da napuni); reduced-motion → flat ── */}
          <div className="md:hidden">
            <div className="flex flex-col gap-5 max-w-md mx-auto">
              {features.map((f, i) => (
                <LiquidCard key={f.number} feature={f} index={i} inView={gridInView} flat={!!reduce} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
