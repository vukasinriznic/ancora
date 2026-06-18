import { motion, AnimatePresence, useInView, useScroll, useTransform, useMotionValueEvent } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import AnimatedWords from './AnimatedWords'

/* ── Ikonice po koraku (stroke = currentColor) ── */
function ProfileIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M5.5 19c0-3.3 2.9-5.5 6.5-5.5s6.5 2.2 6.5 5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}
function ChatIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M4 6.5A2.5 2.5 0 016.5 4h11A2.5 2.5 0 0120 6.5v7a2.5 2.5 0 01-2.5 2.5H9l-4 3.5v-3.5H6.5A2.5 2.5 0 014 13.5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="9"  cy="10" r="1" fill="currentColor" />
      <circle cx="12" cy="10" r="1" fill="currentColor" />
      <circle cx="15" cy="10" r="1" fill="currentColor" />
    </svg>
  )
}
function AnchorIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 100 120" fill="none">
      <circle cx="50" cy="11" r="8" stroke="currentColor" strokeWidth="3" />
      <line x1="50" y1="19" x2="50" y2="92" stroke="currentColor" strokeWidth="3" />
      <path d="M50,34 C66,43 66,78 50,87 C34,78 34,43 50,34Z" stroke="currentColor" strokeWidth="3" fill="none" />
      <path d="M14,84 Q50,105 86,84" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M14,84 L7,75"  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M14,84 L20,77" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M86,84 L93,75" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M86,84 L80,77" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

const steps = [
  {
    number: '01',
    title: 'Tell us about yourself',
    description: 'Create your profile and describe who you are, so Ancora understands your perspective from the start.',
    Icon: ProfileIcon,
    Preview: ProfilePreview,
    loopMs: 3200,
  },
  {
    number: '02',
    title: 'Describe your situation',
    description: "Share what happened and who's involved. The more detail you give, the better the guidance.",
    Icon: ChatIcon,
    Preview: ChatPreview,
    loopMs: 4600,
  },
  {
    number: '03',
    title: 'Get wise, honest advice',
    description: 'Receive thoughtful counsel that protects your dignity and keeps you grounded in your values.',
    Icon: AnchorIcon,
    Preview: AdvicePreview,
    loopMs: 4200,
  },
]

/* Vraća broj ciklusa koji raste svakih `period` ms dok je `play` true */
function useLoop(play: boolean, period: number) {
  const [cycle, setCycle] = useState(0)
  useEffect(() => {
    if (!play) return
    const id = setInterval(() => setCycle(c => c + 1), period)
    return () => clearInterval(id)
  }, [play, period])
  return cycle
}

export default function HowItWorks() {
  const headRef    = useRef(null)
  const headInView = useInView(headRef, { once: true, margin: '-80px' })

  const stepsRef = useRef<HTMLDivElement>(null)
  const [dim, setDim] = useState({ w: 0, h: 0 })

  // Mjeri dimenzije steps kontejnera za SVG putanju
  useEffect(() => {
    const el = stepsRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setDim({ w: el.offsetWidth, h: el.offsetHeight }))
    ro.observe(el)
    setDim({ w: el.offsetWidth, h: el.offsetHeight })
    return () => ro.disconnect()
  }, [])

  // Progres crtanja linije: počinje kad steps uđu, završava pred kraj
  const { scrollYProgress: lineProg } = useScroll({
    target: stepsRef,
    offset: ['start 65%', 'end 80%'],
  })

  // Koji je korak "dostignut" sidrom — pali se kako lanac napreduje
  const [activeStep, setActiveStep] = useState(-1)
  useMotionValueEvent(lineProg, 'change', (v) => {
    let idx = -1
    if (v >= 0.06) idx = 0
    if (v >= 0.45) idx = 1
    if (v >= 0.82) idx = 2
    setActiveStep(idx)
  })

  return (
    <section id="how-it-works" className="py-28 px-6 bg-white">
      <div className="max-w-6xl mx-auto">

        {/* Naslov */}
        <div ref={headRef} className="text-center mb-20">
          <h2
            className="text-4xl md:text-5xl font-semibold mb-4"
            style={{ fontFamily: 'Playfair Display, serif', color: '#1A1A1A' }}
          >
            <AnimatedWords isInView={headInView} delay={0} stagger={0.07}>
              How it works
            </AnimatedWords>
          </h2>
          <p className="text-lg max-w-md mx-auto" style={{ color: '#6B7280' }}>
            <AnimatedWords isInView={headInView} delay={0.25} stagger={0.045}>
              Three simple steps to get the clarity you need.
            </AnimatedWords>
          </p>
        </div>

        {/* Koraci — zigzag; connecting linija vijuga kroz gutter i crta se na scroll */}
        <div ref={stepsRef} className="relative flex flex-col gap-16 md:gap-10">
          <JourneyLine w={dim.w} h={dim.h} progress={lineProg} />
          {steps.map((step, i) => (
            <StepRow key={step.number} step={step} index={i} lit={i <= activeStep} />
          ))}
        </div>
      </div>
    </section>
  )
}

/* Zakrivljena linija koja povezuje korake — crta se prema scroll progresu */
function JourneyLine({ w, h, progress }: { w: number; h: number; progress: import('framer-motion').MotionValue<number> }) {
  const dotDist   = useTransform(progress, [0, 1], ['0%', '100%'])
  // Reveal prati poziciju sidra (6%→94% visine) pa se zelena puni tačno iza njega
  const revealPct = useTransform(progress, [0, 1], ['6%', '94%'])
  if (!w || !h) return null

  const cx   = w / 2
  const top  = h * 0.06
  const bot  = h * 0.94
  const span = bot - top

  const swayAmp = Math.min(w * 0.04, 26)  // zakrivljenost spine-a (vijuga kroz korake)
  const amp     = 6                       // razmak upletenih niti (manje = uži lanac)
  const period  = 30                      // gustina preplitanja (manje = gušće)
  const N       = Math.min(Math.ceil(span / 4), 460)

  // Zakrivljena centralna linija — vijuga 1.5 perioda; sidro klizi po njoj
  const baseX = (t: number) => cx + swayAmp * Math.sin(t * Math.PI * 1.5)

  let dCenter = ''
  for (let i = 0; i <= N; i++) {
    const t = i / N
    const y = top + t * span
    dCenter += (i === 0 ? 'M ' : ' L ') + `${baseX(t).toFixed(1)} ${y.toFixed(1)}`
  }

  // Dvije niti — offset perpendikularno na spine, fazno pomjerene → preplitanje
  const buildStrand = (phase: number) => {
    let pts = ''
    for (let i = 0; i <= N; i++) {
      const t    = i / N
      const y    = top + t * span
      const dxdt = swayAmp * Math.cos(t * Math.PI * 1.5) * Math.PI * 1.5
      const len  = Math.hypot(dxdt, span)
      const nx   = -span / len          // normala na spine
      const ny   = dxdt / len
      const tw   = amp * Math.sin((y / period) * Math.PI + phase)
      const x    = baseX(t) + nx * tw
      const yy   = y + ny * tw
      pts += (i === 0 ? 'M ' : ' L ') + `${x.toFixed(1)} ${yy.toFixed(1)}`
    }
    return pts
  }
  const dA = buildStrand(0)
  const dB = buildStrand(Math.PI)

  return (
    <div className="hidden md:block absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
        <defs>
          {/* Reveal maska — otkriva zeleni lanac odozgo prema dolje na scroll */}
          <clipPath id="journey-reveal">
            <motion.rect x="0" y="0" width="100%" height={revealPct} />
          </clipPath>
          {/* Metalik sheen — svjetlo "hvata" uvijanje niti */}
          <linearGradient id="chainMetal" gradientUnits="userSpaceOnUse" x1={cx - amp - 4} y1="0" x2={cx + amp + 4} y2="0">
            <stop offset="0%"   stopColor="#15803D" />
            <stop offset="50%"  stopColor="#6EE7A0" />
            <stop offset="100%" stopColor="#15803D" />
          </linearGradient>
        </defs>
        {/* Faint upletene niti — vodilja */}
        <path d={dA} stroke="#A7F3D0" strokeWidth="2.5" strokeLinecap="round" />
        <path d={dB} stroke="#BBF7D0" strokeWidth="2.5" strokeLinecap="round" />
        {/* Zeleni upleteni lanac — otkriven do glave sidra */}
        <g clipPath="url(#journey-reveal)">
          <path d={dA} stroke="url(#chainMetal)" strokeWidth="2.5" strokeLinecap="round" />
          <path d={dB} stroke="url(#chainMetal)" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      </svg>
      {/* Sidro koje prati putanju */}
      <motion.div
        className="absolute top-0 left-0"
        style={{
          width: 50, height: 50,
          offsetPath: `path('${dCenter}')`,
          offsetDistance: dotDist,
          offsetRotate: '0deg',
        }}
      >
        {/* Kapsula sa sidrom */}
        <div
          className="absolute inset-0 rounded-full flex items-center justify-center"
          style={{
            background: 'radial-gradient(circle at 30% 25%, #FFFFFF 0%, #F0FDF4 100%)',
            boxShadow: '0 0 0 1px rgba(34,197,94,0.2), 0 4px 14px rgba(34,197,94,0.4)',
          }}
        >
          {/* Sidro se blago njiše, kao da visi sa linije */}
          <motion.div
            style={{ originY: 0.1 }}
            animate={{ rotate: [-7, 7, -7] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <svg width="23" height="28" viewBox="0 0 100 120" fill="none">
              <circle cx="50" cy="11" r="8" stroke="#22C55E" strokeWidth="6" />
              <line x1="50" y1="19" x2="50" y2="92" stroke="#22C55E" strokeWidth="6" />
              <path d="M50,34 C66,43 66,78 50,87 C34,78 34,43 50,34Z" stroke="#22C55E" strokeWidth="6" fill="none" />
              <path d="M14,84 Q50,105 86,84" stroke="#22C55E" strokeWidth="6" fill="none" strokeLinecap="round" />
              <path d="M14,84 L7,75"  stroke="#22C55E" strokeWidth="6" strokeLinecap="round" />
              <path d="M14,84 L20,77" stroke="#22C55E" strokeWidth="6" strokeLinecap="round" />
              <path d="M86,84 L93,75" stroke="#22C55E" strokeWidth="6" strokeLinecap="round" />
              <path d="M86,84 L80,77" stroke="#22C55E" strokeWidth="6" strokeLinecap="round" />
            </svg>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

function StepRow({ step, index, lit }: { step: typeof steps[number]; index: number; lit: boolean }) {
  const ref     = useRef(null)
  const inView  = useInView(ref, { once: true, margin: '-120px' })
  const reverse = index % 2 === 1
  const Icon    = step.Icon
  const Preview = step.Preview
  const cycle   = useLoop(inView, step.loopMs)

  return (
    <div ref={ref} className="relative z-10 grid md:grid-cols-2 gap-10 lg:gap-16 items-center py-6 md:py-10">

      {/* ── Tekst ── */}
      <motion.div
        initial={{ opacity: 0, x: reverse ? 50 : -50 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
        className={`relative ${reverse ? 'md:order-2 md:pl-8' : 'md:pr-8'}`}
      >
        {/* Veliki faint broj — watermark iza teksta */}
        <span
          className="absolute -top-10 -left-2 select-none pointer-events-none leading-none"
          style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: '120px',
            fontWeight: 600,
            color: 'rgba(34,197,94,0.06)',
            zIndex: 0,
          }}
        >
          {step.number}
        </span>

        <div className="relative" style={{ zIndex: 1 }}>
          {/* Ikonica + STEP label */}
          <div className="flex items-center gap-4 mb-5">
            <motion.div
              initial={{ scale: 0.5, opacity: 0, rotate: -12 }}
              animate={inView ? { scale: 1, opacity: 1, rotate: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1, type: 'spring', stiffness: 240, damping: 14 }}
              className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{
                backgroundColor: lit ? '#22C55E' : 'rgba(34,197,94,0.12)',
                color: lit ? '#FFFFFF' : '#22C55E',
                boxShadow: lit ? '0 8px 24px rgba(34,197,94,0.45)' : '0 0 0 rgba(0,0,0,0)',
                transition: 'background-color 0.45s ease, color 0.45s ease, box-shadow 0.45s ease',
              }}
            >
              <Icon />
            </motion.div>
            <span className="text-xs font-semibold tracking-widest" style={{ color: '#22C55E' }}>
              STEP {step.number}
            </span>
          </div>

          <h3
            className="text-2xl md:text-3xl font-semibold mb-3"
            style={{ fontFamily: 'Playfair Display, serif', color: '#1A1A1A' }}
          >
            <AnimatedWords isInView={inView} delay={0.2} stagger={0.05}>
              {step.title}
            </AnimatedWords>
          </h3>
          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-base leading-relaxed max-w-md"
            style={{ color: '#6B7280' }}
          >
            {step.description}
          </motion.p>
        </div>
      </motion.div>

      {/* ── Preview ── */}
      <motion.div
        initial={{ opacity: 0, x: reverse ? -50 : 50, scale: 0.96 }}
        animate={inView ? { opacity: 1, x: 0, scale: 1 } : {}}
        transition={{ duration: 0.7, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
        whileHover={{ y: -6 }}
        className={`relative rounded-3xl border overflow-hidden transition-shadow duration-300 hover:shadow-[0_18px_50px_rgba(34,197,94,0.10)] ${reverse ? 'md:order-1' : ''}`}
        style={{ borderColor: '#E5E7EB', backgroundColor: '#FAFAFA' }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 70% 70% at 100% 0%, rgba(34,197,94,0.06) 0%, transparent 60%)' }}
        />
        <div className="relative p-8 flex items-center justify-center" style={{ minHeight: 300 }}>
          {/* AnimatePresence + key={cycle} → glatki fade na svaki restart loop-a */}
          <AnimatePresence mode="wait">
            <motion.div
              key={cycle}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full flex justify-center"
            >
              <Preview play={inView} />
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}

/* ── Preview paneli — pokreću se na mount (svaki loop ciklus ih remount-uje) ── */

function ProfilePreview({ play }: { play: boolean }) {
  const traits = ['Honest', 'Introvert', 'Values family']
  return (
    <div className="w-full max-w-sm rounded-2xl bg-white border p-6 shadow-sm" style={{ borderColor: '#E5E7EB' }}>
      <div className="flex items-center gap-4 mb-5">
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={play ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-semibold"
          style={{ backgroundColor: 'rgba(34,197,94,0.12)', color: '#22C55E', fontFamily: 'Playfair Display, serif' }}
        >
          You
        </motion.div>
        <div className="flex-1">
          <motion.div initial={{ width: 0 }} animate={play ? { width: '60%' } : {}} transition={{ duration: 0.5, delay: 0.15 }}
            className="h-3 rounded-full mb-2" style={{ backgroundColor: '#E5E7EB' }} />
          <motion.div initial={{ width: 0 }} animate={play ? { width: '85%' } : {}} transition={{ duration: 0.5, delay: 0.28 }}
            className="h-2.5 rounded-full" style={{ backgroundColor: '#F0F0F0' }} />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {traits.map((t, i) => (
          <motion.span
            key={t}
            initial={{ opacity: 0, scale: 0.8, y: 6 }}
            animate={play ? { opacity: 1, scale: 1, y: 0 } : {}}
            transition={{ delay: 0.45 + i * 0.13, type: 'spring', stiffness: 300, damping: 18 }}
            className="px-3 py-1.5 rounded-full text-xs font-medium"
            style={{ backgroundColor: 'rgba(34,197,94,0.1)', color: '#16A34A' }}
          >
            {t}
          </motion.span>
        ))}
      </div>
    </div>
  )
}

const CHAT_MSG = "I had a falling out with my brother over our late father's house, and I don't know how to fix it."

function ChatPreview({ play }: { play: boolean }) {
  const [typed, setTyped] = useState('')
  const [showDots, setShowDots] = useState(false)
  useEffect(() => {
    if (!play) return
    let i = 0
    const id = setInterval(() => {
      i++
      setTyped(CHAT_MSG.slice(0, i))
      if (i >= CHAT_MSG.length) {
        clearInterval(id)
        setTimeout(() => setShowDots(true), 350)
      }
    }, 24)
    return () => clearInterval(id)
  }, [play])

  return (
    <div className="w-full max-w-sm flex flex-col gap-3">
      <div
        className="self-end max-w-[80%] rounded-2xl rounded-br-sm px-4 py-3 text-sm leading-relaxed text-white"
        style={{ backgroundColor: '#22C55E', minHeight: 24 }}
      >
        {typed}
        {play && typed.length < CHAT_MSG.length && <span className="inline-block w-0.5 h-4 ml-0.5 align-middle bg-white/80 animate-pulse" />}
      </div>
      {showDots && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="self-start flex items-center gap-1.5 rounded-2xl rounded-bl-sm px-4 py-3 bg-white border"
          style={{ borderColor: '#E5E7EB' }}
        >
          {[0, 1, 2].map(i => (
            <motion.span
              key={i}
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: '#22C55E' }}
              animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.18 }}
            />
          ))}
        </motion.div>
      )}
    </div>
  )
}

const ADVICE = 'Before reacting, name what you actually feel. Reach out to your brother to understand him — not to win.'

function AdvicePreview({ play }: { play: boolean }) {
  const [typed, setTyped] = useState('')
  useEffect(() => {
    if (!play) return
    let i = 0
    const id = setInterval(() => {
      i++
      setTyped(ADVICE.slice(0, i))
      if (i >= ADVICE.length) clearInterval(id)
    }, 24)
    return () => clearInterval(id)
  }, [play])

  return (
    <div className="w-full max-w-sm flex flex-col gap-3">
      <motion.div
        initial={{ opacity: 0 }} animate={play ? { opacity: 1 } : {}} transition={{ duration: 0.3 }}
        className="flex items-center gap-2"
      >
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center"
          style={{ backgroundColor: 'rgba(34,197,94,0.12)', color: '#22C55E' }}
        >
          <svg width="14" height="14" viewBox="0 0 100 120" fill="none">
            <circle cx="50" cy="11" r="8" stroke="currentColor" strokeWidth="4" />
            <line x1="50" y1="19" x2="50" y2="92" stroke="currentColor" strokeWidth="4" />
            <path d="M14,84 Q50,105 86,84" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
          </svg>
        </div>
        <span className="text-xs font-semibold tracking-wide" style={{ color: '#16A34A' }}>Ancora</span>
      </motion.div>
      <div
        className="rounded-2xl rounded-tl-sm px-5 py-4 bg-white border text-[15px] leading-relaxed"
        style={{ borderColor: '#E5E7EB', color: '#374151', minHeight: 92 }}
      >
        {typed}
        {play && typed.length < ADVICE.length && <span className="inline-block w-0.5 h-4 ml-0.5 align-middle animate-pulse" style={{ backgroundColor: '#22C55E' }} />}
      </div>
    </div>
  )
}
