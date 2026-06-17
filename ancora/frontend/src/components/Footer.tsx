import AncoraSVGLogo from './AncoraSVGLogo'

const links = {
  Product: ['How it works', 'Features', 'Pricing', 'Changelog'],
  Company:  ['About', 'Blog', 'Careers', 'Contact'],
  Legal:    ['Privacy', 'Terms', 'Cookies'],
}

export default function Footer() {
  return (
    <footer className="py-16 px-6 border-t" style={{ borderColor: '#E5E5E5', backgroundColor: '#FAFAFA' }}>
      <div className="max-w-6xl mx-auto">

        {/* Top row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <AncoraSVGLogo size={32} />
              <span
                className="text-lg font-semibold"
                style={{ fontFamily: 'Playfair Display, serif', color: '#1A1A1A' }}
              >
                Ancora
              </span>
            </div>
            <p className="text-sm leading-relaxed max-w-[200px]" style={{ color: '#9CA3AF' }}>
              Wise, dignified relationship advice — whenever you need it.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h4 className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: '#1A1A1A' }}>
                {category}
              </h4>
              <ul className="flex flex-col gap-2.5">
                {items.map(item => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-sm transition-colors duration-200"
                      style={{ color: '#9CA3AF' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#22C55E')}
                      onMouseLeave={e => (e.currentTarget.style.color = '#9CA3AF')}
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom row */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t"
          style={{ borderColor: '#E5E5E5' }}
        >
          <p className="text-sm" style={{ color: '#9CA3AF' }}>
            © 2026 Ancora. All rights reserved.
          </p>
          <p className="text-sm italic" style={{ color: '#D1D5DB', fontFamily: 'Playfair Display, serif' }}>
            Clarity in every connection.
          </p>
        </div>

      </div>
    </footer>
  )
}
