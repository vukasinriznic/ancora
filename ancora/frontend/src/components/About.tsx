import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import AnimatedWords from './AnimatedWords'

const values = [
  {
    label: 'Honesty',
    desc: 'We tell you the truth, not what you want to hear.',
  },
  {
    label: 'Dignity',
    desc: 'Every response honours your worth and values.',
  },
  {
    label: 'Clarity',
    desc: 'No noise. Just the insight that matters most.',
  },
]

export default function About() {
  const ref      = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section
      id="about"
      ref={ref}
      data-theme="dark"
      className="relative min-h-screen flex flex-col justify-center py-32 px-6 overflow-hidden"
      style={{ backgroundColor: '#0D0D0D' }}
    >
      {/* Subtle ambient verde gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 55% 55% at 20% 30%, rgba(34,197,94,0.07) 0%, transparent 70%),
            radial-gradient(ellipse 40% 40% at 80% 70%, rgba(34,197,94,0.05) 0%, transparent 70%)
          `,
        }}
      />

      {/* Diamond texture pattern — very subtle */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            #22C55E 0px, #22C55E 1px,
            transparent 1px, transparent 28px
          ), repeating-linear-gradient(
            -45deg,
            #22C55E 0px, #22C55E 1px,
            transparent 1px, transparent 28px
          )`,
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto">

        {/* Label */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-center gap-3 mb-12"
        >
          <span className="h-px w-12" style={{ backgroundColor: '#22C55E' }} />
          <span className="text-xs font-medium tracking-widest uppercase" style={{ color: '#22C55E' }}>
            Our philosophy
          </span>
          <span className="h-px w-12" style={{ backgroundColor: '#22C55E' }} />
        </motion.div>

        {/* Big quote — word by word */}
        <blockquote className="text-center mb-6">
          <p
            className="text-3xl md:text-4xl lg:text-5xl font-semibold italic leading-tight"
            style={{ fontFamily: 'Playfair Display, serif', color: '#FFFFFF' }}
          >
            <AnimatedWords isInView={isInView} delay={0.15} stagger={0.065}>
              "The quality of your relationships defines the quality of your life."
            </AnimatedWords>
          </p>
        </blockquote>

        <p
          className="text-center text-base mb-20 max-w-xl mx-auto"
          style={{ color: '#6B7280' }}
        >
          <AnimatedWords isInView={isInView} delay={0.9} stagger={0.035}>
            Ancora was built on the belief that everyone deserves honest, thoughtful guidance — not just generic advice, but counsel that respects who you are.
          </AnimatedWords>
        </p>

        {/* Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {values.map((v, i) => (
            <motion.div
              key={v.label}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.5 + i * 0.12 }}
              className="group text-center"
            >
              {/* Ikonica — mali romb */}
              <motion.div
                className="inline-flex items-center justify-center mb-4"
                whileHover={{ rotate: 45, scale: 1.2 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              >
                <span
                  className="w-3 h-3 rotate-45 block"
                  style={{ backgroundColor: '#22C55E' }}
                />
              </motion.div>

              <h3
                className="text-lg font-semibold mb-2"
                style={{ fontFamily: 'Playfair Display, serif', color: '#FFFFFF' }}
              >
                {v.label}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: '#6B7280' }}>
                {v.desc}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}
