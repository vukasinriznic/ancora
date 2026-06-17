import { motion } from 'framer-motion'

interface Props {
  size?: number
  color?: string
}

export default function AncoraSVGLogo({ size = 36, color = '#22C55E' }: Props) {
  return (
    <motion.svg
      viewBox="0 0 100 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size * 1.2}
      aria-label="Ancora logo"
      whileHover={{ rotate: 15, y: -2 }}
      transition={{ type: 'spring', stiffness: 350, damping: 10 }}
    >
      {/* Ring na vrhu */}
      <circle cx="50" cy="11" r="8" stroke={color} strokeWidth="1.2" />

      {/* Shaft — vertikalna linija */}
      <line x1="50" y1="19" x2="50" y2="92" stroke={color} strokeWidth="1.2" />

      {/* Lens / telo sidra — elegantna suza oblika */}
      <path
        d="M50,34 C66,43 66,78 50,87 C34,78 34,43 50,34Z"
        stroke={color}
        strokeWidth="1.2"
        fill="none"
      />

      {/* Donja krivina (flukes) — graciozna */}
      <path
        d="M14,84 Q50,105 86,84"
        stroke={color}
        strokeWidth="1.2"
        fill="none"
        strokeLinecap="round"
      />

      {/* Leva strelica */}
      <path d="M14,84 L7,75" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <path d="M14,84 L20,77" stroke={color} strokeWidth="1.2" strokeLinecap="round" />

      {/* Desna strelica */}
      <path d="M86,84 L93,75" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <path d="M86,84 L80,77" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
    </motion.svg>
  )
}
