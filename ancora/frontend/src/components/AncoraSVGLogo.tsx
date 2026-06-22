import { m } from 'framer-motion'

interface Props {
  size?: number
  color?: string
}

export default function AncoraSVGLogo({ size = 36, color = '#15803D' }: Props) {
  return (
    <m.svg
      viewBox="0 0 100 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size * 1.2}
      aria-label="Ancora logo"
      whileHover={{ rotate: 15, y: -2 }}
      transition={{ type: 'spring', stiffness: 350, damping: 10 }}
    >
      <g stroke={color} strokeWidth="5.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
        {/* Ring (shackle) na vrhu */}
        <circle cx="50" cy="11" r="7" />
        {/* Shaft — vertikalna osa */}
        <line x1="50" y1="18" x2="50" y2="88" />
        {/* Stock — prečka */}
        <line x1="31" y1="29" x2="69" y2="29" />
        {/* Krakovi — izvijaju se nagore */}
        <path d="M22,66 C27,84 39,89 50,89 C61,89 73,84 78,66" />
        {/* Šiljci (flukes) na krajevima krakova */}
        <path d="M22,66 L15,61" />
        <path d="M22,66 L27,57" />
        <path d="M78,66 L85,61" />
        <path d="M78,66 L73,57" />
      </g>
    </m.svg>
  )
}
