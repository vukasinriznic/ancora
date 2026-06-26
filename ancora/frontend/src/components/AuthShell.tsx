import { useRef } from 'react'
import { m } from 'framer-motion'
import { Link, useOutlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import DiamondCanvas, { type DiamondCanvasHandle } from './DiamondCanvas'
import CursorTrail from './CursorTrail'
import AncoraSVGLogo from './AncoraSVGLogo'

/*
  Persistentni layout za /login i /register (nested layout route).
  Pozadina, rombovi, watermark i logo OSTAJU mirni pri prelazu —
  remountuje se samo kartica (Outlet), pa rombovi ne restartuju intro.

  Tranzicija kartice: useOutlet() "zamrzava" stari element dok izlazi
  (sa <Outlet/> bi izlazna kopija pokupila novu rutu). AnimatePresence
  mode="wait" → stara kartica isklizne, pa nova uklizne.
*/
export default function AuthShell() {
  const { t, i18n } = useTranslation()
  const outlet = useOutlet()
  const sectionRef = useRef<HTMLElement>(null)
  const canvasRef  = useRef<DiamondCanvasHandle>(null)

  const cur = i18n.language?.startsWith('sr') ? 'sr' : 'en'
  const setLang = (lng: 'en' | 'sr') => {
    i18n.changeLanguage(lng)
    try { localStorage.setItem('lang', lng) } catch { /* ignore */ }
  }

  const handleSectionClick = (e: React.MouseEvent<HTMLElement>) => {
    if (!sectionRef.current) return
    const rect = sectionRef.current.getBoundingClientRect()
    canvasRef.current?.triggerExplosion(e.clientX - rect.left, e.clientY - rect.top)
  }

  return (
    <section
      ref={sectionRef}
      onClick={handleSectionClick}
      className="relative min-h-screen flex items-center justify-center px-6 py-20 overflow-x-clip"
      style={{
        background:
          'linear-gradient(180deg, #0C3D2D 0%, #0A2A20 14%, #07130E 50%, #0A2A20 86%, #0C3D2D 100%)',
      }}
    >
      {/* Meko zeleno svetlo iza kartice */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 50% 45% at 50% 42%, rgba(31,214,95,0.10) 0%, transparent 65%)' }}
      />

      {/* Aurora — ogromna, jako zamućena zelena svetla koja vrlo sporo plutaju (SaaS dubina) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <m.div
          className="absolute rounded-full"
          style={{
            top: '-10%', left: '8%', width: 560, height: 560,
            background: 'radial-gradient(circle, rgba(31,214,95,0.30) 0%, transparent 70%)',
            filter: 'blur(90px)',
          }}
          animate={{ x: [0, 70, -30, 0], y: [0, 50, 90, 0], scale: [1, 1.12, 0.95, 1] }}
          transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
        />
        <m.div
          className="absolute rounded-full"
          style={{
            bottom: '-12%', right: '6%', width: 620, height: 620,
            background: 'radial-gradient(circle, rgba(84,233,138,0.24) 0%, transparent 70%)',
            filter: 'blur(100px)',
          }}
          animate={{ x: [0, -60, 20, 0], y: [0, -40, -80, 0], scale: [1, 0.92, 1.1, 1] }}
          transition={{ duration: 32, repeat: Infinity, ease: 'easeInOut' }}
        />
        <m.div
          className="absolute rounded-full"
          style={{
            top: '30%', left: '50%', width: 420, height: 420, marginLeft: -210,
            background: 'radial-gradient(circle, rgba(20,184,84,0.20) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
          animate={{ x: [0, 50, -50, 0], y: [0, -30, 40, 0], scale: [1, 1.08, 0.9, 1] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Ogroman, vrlo proziran outline sidra iza kartice — dubina + brend */}
      <svg
        viewBox="0 0 100 120"
        aria-hidden
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none w-[300px] md:w-[440px]"
        style={{ opacity: 0.05 }}
      >
        <g stroke="#FFFFFF" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="50" cy="11" r="7" />
          <line x1="50" y1="18" x2="50" y2="88" />
          <line x1="31" y1="29" x2="69" y2="29" />
          <path d="M22,66 C27,84 39,89 50,89 C61,89 73,84 78,66" />
          <path d="M22,66 L15,61" />
          <path d="M22,66 L27,57" />
          <path d="M78,66 L85,61" />
          <path d="M78,66 L73,57" />
        </g>
      </svg>

      {/* Svetlo zeleni rombovi — border pulsira u boji tamne pozadine, pokrivaju cijelu visinu */}
      <DiamondCanvas ref={canvasRef} variant="dark" fill />

      {/* Svetlo zeleni rombovi koji prate kursor — isti efekat kao na homepage */}
      <CursorTrail variant="green" />

      {/* Vinjeta — suptilno tamnjenje uglova → pažnja se vodi ka kartici */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 75% 75% at 50% 50%, transparent 55%, rgba(2,8,5,0.55) 100%)' }}
      />

      {/* Logo gore levo — povratak na početnu */}
      <Link
        to="/"
        onClick={e => e.stopPropagation()}
        className="absolute top-6 left-6 md:top-8 md:left-8 z-20 flex items-center gap-2 group"
      >
        <AncoraSVGLogo size={30} color="#FFFFFF" />
        <span
          className="text-lg font-semibold tracking-tight transition-opacity duration-200 group-hover:opacity-80"
          style={{ fontFamily: 'Playfair Display, serif', color: '#FFFFFF' }}
        >
          Ancora
        </span>
      </Link>

      {/* EN/SR prekidač gore desno — konzistentan sa Navbar-om */}
      <div
        onClick={e => e.stopPropagation()}
        className="absolute top-6 right-6 md:top-8 md:right-8 z-20 flex items-center gap-1.5 text-sm font-medium"
        style={{ color: 'rgba(255,255,255,0.5)' }}
      >
        <button
          onClick={() => setLang('en')}
          aria-pressed={cur === 'en'}
          className="transition-colors duration-200 cursor-pointer"
          style={{ color: cur === 'en' ? '#FFFFFF' : 'inherit', fontWeight: cur === 'en' ? 600 : 500 }}
        >EN</button>
        <span>/</span>
        <button
          onClick={() => setLang('sr')}
          aria-pressed={cur === 'sr'}
          className="transition-colors duration-200 cursor-pointer"
          style={{ color: cur === 'sr' ? '#FFFFFF' : 'inherit', fontWeight: cur === 'sr' ? 600 : 500 }}
        >SR</button>
      </div>

      {/* Kartica (login/register) — bez tranzicije pri promeni rute */}
      <div
        onClick={e => e.stopPropagation()}
        className="relative z-10 w-full max-w-md"
      >
        {outlet}
      </div>

      {/* Suptilni tagline u dnu */}
      <p
        className="absolute bottom-5 left-0 right-0 text-center text-xs px-6 pointer-events-none"
        style={{ color: 'rgba(255,255,255,0.3)' }}
      >
        {t('footer.clarity')}
      </p>
    </section>
  )
}
