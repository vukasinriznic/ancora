import { motion, AnimatePresence, useInView } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import AnimatedWords from './AnimatedWords'
import DiamondButton from './DiamondButton'

const testimonials = [
  {
    quote: "Finally, someone that doesn't judge and actually helps me think clearly.",
    name: 'Sarah',
    age: 28,
  },
  {
    quote: "I was spiraling over a fight with my partner. Ancora helped me see my part in it.",
    name: 'Marco',
    age: 34,
  },
  {
    quote: "More honest than my friends, more empathetic than I expected from AI.",
    name: 'Priya',
    age: 31,
  },
]

const reassurances = ['Free to start', 'Private & secure', 'No credit card']

export default function CtaSection() {
  const ref      = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  const [idx, setIdx]       = useState(0)
  const [paused, setPaused] = useState(false)

  // Auto-advance (pauza na hover)
  useEffect(() => {
    if (paused) return
    const id = setInterval(() => setIdx(i => (i + 1) % testimonials.length), 5200)
    return () => clearInterval(id)
  }, [paused])

  const t = testimonials[idx]

  return (
    <section ref={ref} className="relative py-32 px-6 overflow-hidden bg-white">
      <div className="relative z-10 max-w-5xl mx-auto">

        {/* ── Auto-spotlight testimonial ── */}
        <div
          className="relative max-w-2xl mx-auto text-center mb-24"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Veliki navodnik */}
          <span
            className="block select-none leading-none mb-1 pointer-events-none"
            style={{ fontFamily: 'Playfair Display, serif', fontSize: 88, fontWeight: 700, color: 'rgba(34,197,94,0.16)' }}
          >
            &ldquo;
          </span>

          <div className="relative" style={{ minHeight: 220 }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <p
                  className="text-2xl md:text-3xl leading-snug italic mb-9"
                  style={{ fontFamily: 'Playfair Display, serif', color: '#1A1A1A' }}
                >
                  {t.quote}
                </p>
                <div className="flex items-center justify-center gap-3">
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-semibold"
                    style={{
                      background: 'linear-gradient(135deg, rgba(34,197,94,0.18) 0%, rgba(34,197,94,0.05) 100%)',
                      border: '1px solid rgba(34,197,94,0.3)', color: '#16A34A',
                    }}
                  >
                    {t.name[0]}
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold" style={{ color: '#1A1A1A' }}>{t.name}</div>
                    <div className="text-xs" style={{ color: '#9CA3AF' }}>Age {t.age}</div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dots */}
          <div className="flex items-center justify-center gap-2 mt-10">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                aria-label={`Show testimonial ${i + 1}`}
                className="rounded-full transition-all duration-300 cursor-pointer"
                style={{
                  width: i === idx ? 22 : 8, height: 8,
                  backgroundColor: i === idx ? '#22C55E' : 'rgba(34,197,94,0.25)',
                }}
              />
            ))}
          </div>
        </div>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="h-px max-w-xs mx-auto mb-16 origin-center"
          style={{ backgroundColor: '#E5E5E5' }}
        />

        {/* ── CTA: Ready for clarity? + water ripple ── */}
        <div className="relative text-center">

          {/* Water ripple — kao da je sidro palo u vodu */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ zIndex: 0 }}>
            {[0, 1, 2, 3].map(i => (
              <motion.div
                key={i}
                className="absolute rounded-full border"
                style={{ width: 240, height: 240, marginLeft: -120, marginTop: -120, borderColor: 'rgba(34,197,94,0.22)' }}
                initial={{ scale: 0.25, opacity: 0 }}
                animate={isInView ? { scale: 2.7, opacity: [0, 0.5, 0] } : {}}
                transition={{ duration: 7, repeat: Infinity, ease: 'easeOut', delay: i * 1.75 }}
              />
            ))}
          </div>

          <div className="relative" style={{ zIndex: 1 }}>
            <h2
              className="text-4xl md:text-5xl font-semibold mb-6"
              style={{ fontFamily: 'Playfair Display, serif', color: '#1A1A1A' }}
            >
              <AnimatedWords isInView={isInView} delay={0.35} stagger={0.08}>
                Ready for clarity?
              </AnimatedWords>
            </h2>

            <p className="text-lg mb-12 max-w-md mx-auto" style={{ color: '#6B7280' }}>
              <AnimatedWords isInView={isInView} delay={0.6} stagger={0.04}>
                Join thousands of people who found their anchor in difficult moments.
              </AnimatedWords>
            </p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.85 }}
              className="relative inline-block"
            >
              {/* Meki glow iza dugmeta */}
              <div
                className="absolute inset-0 -z-10 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse 80% 140% at 50% 50%, rgba(34,197,94,0.28) 0%, transparent 70%)', filter: 'blur(22px)' }}
              />
              <DiamondButton className="px-12 py-4 text-base">Create your free account</DiamondButton>
            </motion.div>

            {/* Reassurance */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 1.15 }}
              className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium"
              style={{ color: '#9CA3AF' }}
            >
              {reassurances.map((txt) => (
                <span key={txt} className="inline-flex items-center gap-1.5">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12.5l4 4 10-10" stroke="#22C55E" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {txt}
                </span>
              ))}
            </motion.div>
          </div>
        </div>

      </div>
    </section>
  )
}
