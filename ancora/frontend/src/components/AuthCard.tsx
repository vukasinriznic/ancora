import type { ReactNode } from 'react'

interface Props {
  title: string
  subtitle?: string
  children: ReactNode
  /* Link u dnu kartice (npr. "Nemaš nalog? Registruj se") */
  footer?: ReactNode
}

/*
  Glass kartica sa formom. Pozadinu, rombove i ulaznu/izlaznu animaciju
  drži AuthShell (layout) — ovde je samo vizuelni sadržaj kartice.
*/
export default function AuthCard({ title, subtitle, children, footer }: Props) {
  return (
    <div
      className="relative w-full rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-md p-8 md:p-10"
      style={{ boxShadow: '0 24px 60px rgba(0,0,0,0.35), 0 1px 0 rgba(255,255,255,0.06) inset' }}
    >
      {/* Rotirajući zeleni gradijent prsten oko kartice */}
      <span className="anim-border" style={{ borderRadius: 24 }} />

      {/* Gornji "glare" — specular highlight kao na pravom staklu */}
      <div
        className="absolute inset-x-0 top-0 h-1/3 rounded-t-3xl pointer-events-none"
        style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.10) 0%, transparent 100%)' }}
      />
      <div
        className="absolute inset-x-8 top-0 h-px pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)' }}
      />

      <div className="relative text-center mb-7">
        <h1
          className="connection-shimmer text-3xl md:text-4xl font-semibold mb-2"
          style={{ fontFamily: 'Playfair Display, serif' }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
            {subtitle}
          </p>
        )}
      </div>

      {children}

      {footer && (
        <div className="mt-6 text-center text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
          {footer}
        </div>
      )}
    </div>
  )
}
