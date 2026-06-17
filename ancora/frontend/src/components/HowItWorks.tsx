import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import AnimatedWords from './AnimatedWords'

const steps = [
  {
    number: '01',
    title: 'Tell us about yourself',
    description: 'Create your profile and describe who you are. This helps Ancora understand your perspective and give you more relevant advice.',
    from: { x: -60, opacity: 0 },
  },
  {
    number: '02',
    title: 'Describe your situation',
    description: 'Start a conversation, describe the person or people involved, and explain what happened. The more detail, the better the advice.',
    from: { y: 50, opacity: 0 },
  },
  {
    number: '03',
    title: 'Get wise, honest advice',
    description: 'Ancora gives you thoughtful guidance that protects your dignity, keeps you grounded, and helps you be the best version of yourself.',
    from: { x: 60, opacity: 0 },
  },
]

export default function HowItWorks() {
  const ref     = useRef(null)
  const lineRef = useRef(null)
  const isInView     = useInView(ref,     { once: true, margin: '-80px' })
  const isLineInView = useInView(lineRef, { once: true, margin: '-80px' })

  return (
    <section id="how-it-works" ref={ref} className="py-28 px-6 bg-white">
      <div className="max-w-6xl mx-auto">

        {/* Naslov */}
        <div className="text-center mb-20">
          <h2
            className="text-4xl md:text-5xl font-semibold mb-4"
            style={{ fontFamily: 'Playfair Display, serif', color: '#1A1A1A' }}
          >
            <AnimatedWords isInView={isInView} delay={0} stagger={0.07}>
              How it works
            </AnimatedWords>
          </h2>
          <p className="text-lg max-w-md mx-auto" style={{ color: '#6B7280' }}>
            <AnimatedWords isInView={isInView} delay={0.25} stagger={0.045}>
              Three simple steps to get the clarity you need.
            </AnimatedWords>
          </p>
        </div>

        {/* Koraci */}
        <div className="relative">

          {/* Connecting linija */}
          <div
            ref={lineRef}
            className="hidden md:block absolute top-[26px] left-0 right-0"
            style={{ zIndex: 0 }}
          >
            <div
              className="absolute h-px"
              style={{
                left: 'calc(16.667% + 26px)',
                right: 'calc(16.667% + 26px)',
                backgroundColor: '#E5E5E5',
              }}
            />
            <motion.div
              className="absolute h-px origin-left"
              style={{
                left: 'calc(16.667% + 26px)',
                right: 'calc(16.667% + 26px)',
                backgroundColor: '#22C55E',
              }}
              initial={{ scaleX: 0 }}
              animate={isLineInView ? { scaleX: 1 } : {}}
              transition={{ duration: 1.1, delay: 0.5, ease: 'easeOut' }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ ...step.from }}
                animate={isInView ? { x: 0, y: 0, opacity: 1 } : {}}
                transition={{ duration: 0.65, delay: 0.15 + i * 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="flex flex-col group"
              >
                {/* Krug s brojem — uvijek popunjen */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative flex-shrink-0 w-[52px] h-[52px]">
                    {/* Filled circle — uvijek zelen */}
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{ backgroundColor: 'rgba(34,197,94,0.12)' }}
                    />
                    {/* Border */}
                    <div
                      className="absolute inset-0 rounded-full border-2 group-hover:border-[#22C55E] transition-colors duration-300"
                      style={{ borderColor: '#22C55E' }}
                    />
                    {/* Fill na hover */}
                    <span
                      className="absolute inset-0 rounded-full origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500 ease-out"
                      style={{ backgroundColor: '#22C55E' }}
                    />
                    {/* Broj */}
                    <span
                      className="absolute inset-0 flex items-center justify-center text-sm font-semibold transition-colors duration-300 group-hover:text-white"
                      style={{ fontFamily: 'Playfair Display, serif', color: '#22C55E' }}
                    >
                      {step.number}
                    </span>
                  </div>
                </div>

                {/* Sadržaj s left border accent-om */}
                <div className="relative pl-4">
                  <div
                    className="absolute left-0 top-0 bottom-0 w-0.5 rounded-full origin-top scale-y-0 group-hover:scale-y-100 transition-transform duration-500 ease-out"
                    style={{ backgroundColor: '#22C55E' }}
                  />
                  <h3
                    className="text-xl font-semibold mb-3"
                    style={{ fontFamily: 'Playfair Display, serif', color: '#1A1A1A' }}
                  >
                    {step.title}
                  </h3>
                  <p className="text-base leading-relaxed" style={{ color: '#6B7280' }}>
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
