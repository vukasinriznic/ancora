import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import AnimatedWords from './AnimatedWords'

const features = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="10" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="14" cy="14" r="4"  fill="currentColor" opacity="0.2" />
        <circle cx="14" cy="14" r="1.5" fill="currentColor" />
        <line x1="14" y1="4"  x2="14" y2="7"  stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <line x1="14" y1="21" x2="14" y2="24" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <line x1="4"  y1="14" x2="7"  y2="14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <line x1="21" y1="14" x2="24" y2="14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
    title: 'Context-aware AI',
    description: 'Ancora remembers your past conversations and the people you described, giving advice that evolves with your situation.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
        <path d="M14 4C8.477 4 4 8.477 4 14s4.477 10 10 10 10-4.477 10-10S19.523 4 14 4z" stroke="currentColor" strokeWidth="1.6" />
        <path d="M10 13.5c0-2.21 1.79-4 4-4s4 1.79 4 4v1a4 4 0 01-8 0v-1z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
    title: 'No judgment',
    description: 'A safe space to share what you really feel. Ancora listens without judgment and responds with care.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
        <path d="M14 5L6 10v8l8 5 8-5v-8L14 5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M14 5v13M6 10l8 8 8-8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Your dignity first',
    description: 'Every piece of advice is crafted to keep you grounded, respected, and true to your values.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="9.5" stroke="currentColor" strokeWidth="1.6" strokeDasharray="3 2" />
        <path d="M14 8v6l4 2.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Available anytime',
    description: "Whether it's 3am or a Monday morning, Ancora is always ready to help you think things through.",
  },
]

export default function Features() {
  const ref      = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="features" ref={ref} className="py-28 px-6 bg-white">
      <div className="max-w-6xl mx-auto">

        <div className="text-center mb-20">
          <h2
            className="text-4xl md:text-5xl font-semibold mb-4"
            style={{ fontFamily: 'Playfair Display, serif', color: '#1A1A1A' }}
          >
            <AnimatedWords isInView={isInView} delay={0} stagger={0.07}>
              Why Ancora
            </AnimatedWords>
          </h2>
          <p className="text-lg max-w-md mx-auto" style={{ color: '#6B7280' }}>
            <AnimatedWords isInView={isInView} delay={0.2} stagger={0.04}>
              More than advice — a thoughtful companion for every relationship challenge.
            </AnimatedWords>
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 40 + i * 6 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 + i * 0.12, ease: [0.25, 0.46, 0.45, 0.94] }}
              whileHover={{ y: -6 }}
              className="group relative p-8 rounded-2xl border overflow-hidden cursor-default transition-shadow duration-300 hover:shadow-[0_16px_48px_rgba(0,0,0,0.07)]"
              style={{ borderColor: '#E5E5E5', backgroundColor: '#FAFAFA' }}
            >
              {/* Gradient reveal */}
              <span
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
                style={{
                  background: 'radial-gradient(ellipse 80% 80% at 0% 100%, rgba(34,197,94,0.07) 0%, transparent 70%)',
                }}
              />

              {/* Left border accent */}
              <span
                className="absolute left-0 top-6 bottom-6 w-0.5 rounded-full origin-top scale-y-0 group-hover:scale-y-100 transition-transform duration-500 ease-out"
                style={{ backgroundColor: '#22C55E' }}
              />

              {/* Icon container — 48×48 rounded square */}
              <motion.div
                className="mb-5 inline-flex items-center justify-center rounded-xl"
                style={{
                  width: 48,
                  height: 48,
                  backgroundColor: 'rgba(34,197,94,0.08)',
                  color: '#22C55E',
                }}
                whileHover={{ rotate: 8, scale: 1.12 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              >
                {feature.icon}
              </motion.div>

              <h3
                className="text-xl font-semibold mb-3"
                style={{ fontFamily: 'Playfair Display, serif', color: '#1A1A1A' }}
              >
                {feature.title}
              </h3>
              <p className="text-base leading-relaxed" style={{ color: '#6B7280' }}>
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
