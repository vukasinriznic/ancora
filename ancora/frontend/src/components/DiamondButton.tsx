interface Props {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  type?: 'button' | 'submit'
  variant?: 'primary' | 'secondary'
  icon?: 'anchor' | 'none'
}

/* Sidro — identičan oblik kao logo u navbaru (AncoraSVGLogo), nasljeđuje currentColor */
function AnchorIcon() {
  return (
    <svg viewBox="0 0 100 120" fill="none" width="20" height="24" aria-hidden="true">
      {/* Ring na vrhu */}
      <circle cx="50" cy="11" r="7" stroke="currentColor" strokeWidth="2.6" />
      {/* Shaft */}
      <line x1="50" y1="18" x2="50" y2="88" stroke="currentColor" strokeWidth="2.6" />
      {/* Telo sidra — suza */}
      <path d="M31,29 L69,29" stroke="currentColor" strokeWidth="2.6" fill="none" />
      {/* Donja krivina (flukes) */}
      <path d="M22,66 C27,84 39,89 50,89 C61,89 73,84 78,66" stroke="currentColor" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      {/* Strelice */}
      <path d="M22,66 L15,61"  stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M22,66 L27,57" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M78,66 L85,61" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M78,66 L73,57" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  )
}

export default function DiamondButton({
  children,
  className = '',
  style,
  type = 'button',
  variant = 'secondary',
  icon = 'anchor',
}: Props) {
  const variantClass = variant === 'primary' ? 'btn-diamond-primary' : 'btn-diamond-secondary'

  return (
    <button
      type={type}
      className={`group relative overflow-hidden rounded-full cursor-pointer font-medium ${variantClass} ${className}`}
      style={style}
    >
      <span className="diamond-fill" />
      <span className="btn-diamond-text relative z-10 inline-flex items-center">
        <span className="transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-x-1">{children}</span>
        {icon !== 'none' && (
          <span className="ml-0 w-0 overflow-hidden opacity-0 translate-x-2 inline-flex items-center group-hover:w-6 group-hover:ml-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]">
            <AnchorIcon />
          </span>
        )}
      </span>
    </button>
  )
}
