import { useTranslation } from 'react-i18next'
import AncoraSVGLogo from './AncoraSVGLogo'

const explore = [
  { key: 'how',   href: '#how-it-works' },
  { key: 'why',   href: '#features' },
  { key: 'about', href: '#about' },
]
const legal = [
  { key: 'privacy', href: '#' },
  { key: 'terms',   href: '#' },
]

function FooterLink({ label, href }: { label: string; href: string }) {
  return (
    <a
      href={href}
      className="group relative inline-block text-sm transition-colors duration-200 hover:text-[#15803D]"
      style={{ color: '#9CA3AF' }}
    >
      {label}
      {/* underline koji se iscrtava na hover */}
      <span className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-[#15803D] transition-transform duration-300 ease-out group-hover:scale-x-100" />
    </a>
  )
}

export default function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="relative px-6 pt-16 pb-10 border-t" style={{ borderColor: '#EAEAEA', backgroundColor: '#FAFAFA' }}>
      <div className="max-w-6xl mx-auto">

        {/* Top row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">

          {/* Brand */}
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <AncoraSVGLogo size={30} color="#1FD65F" />
              <span className="text-lg font-semibold" style={{ fontFamily: 'Playfair Display, serif', color: '#1A1A1A' }}>
                Ancora
              </span>
            </div>
            <p className="text-sm leading-relaxed max-w-[240px]" style={{ color: '#9CA3AF' }}>
              {t('footer.tagline')}
            </p>
          </div>

          {/* Explore — pravi anchor linkovi */}
          <div>
            <h4 className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: '#6B7280' }}>
              {t('footer.explore')}
            </h4>
            <ul className="flex flex-col gap-2.5">
              {explore.map(l => <li key={l.key}><FooterLink label={t('footer.links.' + l.key)} href={l.href} /></li>)}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: '#6B7280' }}>
              {t('footer.legal')}
            </h4>
            <ul className="flex flex-col gap-2.5">
              {legal.map(l => <li key={l.key}><FooterLink label={t('footer.links.' + l.key)} href={l.href} /></li>)}
            </ul>
          </div>
        </div>

        {/* Bottom row */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t"
          style={{ borderColor: '#EAEAEA' }}
        >
          <p className="text-sm" style={{ color: '#9CA3AF' }}>
            {t('footer.rights')}
          </p>
          <p className="text-sm italic" style={{ color: '#C9CDD3', fontFamily: 'Playfair Display, serif' }}>
            {t('footer.clarity')}
          </p>
        </div>

      </div>
    </footer>
  )
}
