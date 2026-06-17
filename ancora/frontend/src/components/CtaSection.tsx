import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
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

export default function CtaSection() {
  const ref      = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section
      ref={ref}
      className="relative py-32 px-6 overflow-hidden bg-white"
    >
      {/* Decorative rings */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{ width: '600px', height: '600px' }}
      >
        {[1, 0.6, 0.35].map((scale, i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full border"
            style={{ borderColor: `rgba(34,197,94,${0.07 - i * 0.015})`, transform: `scale(${scale})`, transformOrigin: 'center' }}
            initial={{ opacity: 0, scale: scale * 0.85 }}
            animate={isInView ? { opacity: 1, scale } : {}}
            transition={{ duration: 1.0, delay: 0.1 + i * 0.15, ease: 'easeOut' }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: i * 0.12 }}
              className="group relative p-6 rounded-2xl border"
              style={{ borderColor: '#E5E5E5', backgroundColor: '#FAFAFA' }}
            >
              {/* Quote mark */}
              <span
                className="block text-4xl leading-none mb-3 select-none"
                style={{ fontFamily: 'Playfair Display, serif', color: '#22C55E', opacity: 0.5 }}
              >
                "
              </span>
              <p className="text-sm leading-relaxed mb-4" style={{ color: '#4B5563' }}>
                {t.quote}
              </p>
              <div className="flex items-center gap-2">
                {/* Inicijali avatar */}
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold"
                  style={{ backgroundColor: 'rgba(34,197,94,0.1)', color: '#22C55E' }}
                >
                  {t.name[0]}
                </div>
                <span className="text-xs font-medium" style={{ color: '#9CA3AF' }}>
                  {t.name}, {t.age}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="h-px max-w-xs mx-auto mb-14 origin-center"
          style={{ backgroundColor: '#E5E5E5' }}
        />

        {/* CTA tekst */}
        <div className="text-center">
          <h2
            className="text-4xl md:text-5xl font-semibold mb-6"
            style={{ fontFamily: 'Playfair Display, serif', color: '#1A1A1A' }}
          >
            <AnimatedWords isInView={isInView} delay={0.35} stagger={0.08}>
              Ready for clarity?
            </AnimatedWords>
          </h2>

          <p
            className="text-lg mb-12 max-w-md mx-auto"
            style={{ color: '#6B7280' }}
          >
            <AnimatedWords isInView={isInView} delay={0.6} stagger={0.04}>
              Join thousands of people who found their anchor in difficult moments.
            </AnimatedWords>
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.85 }}
          >
            <DiamondButton className="px-12 py-4 text-base">Create your free account</DiamondButton>
          </motion.div>
        </div>

      </div>
    </section>
  )
}
