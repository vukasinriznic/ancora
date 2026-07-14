import { useEffect, useRef } from 'react'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { useIsMobile } from '../hooks/useIsMobile'

/*
  Meka zelena aureola koja prati kursor kroz cijeli sajt.
  Fixed pozicija + pointer-events:none → ne smeta interakciji.
  RAF lerp (0.15) daje blago "trailing" kretanje umjesto da skace
  tacno za kursorom — elegantnije i manje nervozno.
*/
export default function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null)
  // Bez kursora (mobilni) ili uz reduced-motion nema svrhe — a rAF lerp bespotrebno troši frame-ove.
  const disabled = usePrefersReducedMotion() || useIsMobile()

  useEffect(() => {
    if (disabled) return
    const el = ref.current
    if (!el) return

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    const cur    = { ...target }
    let raf = 0

    const tick = () => {
      cur.x += (target.x - cur.x) * 0.15
      cur.y += (target.y - cur.y) * 0.15
      el.style.transform = `translate(${cur.x}px, ${cur.y}px)`
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    const onMove = (e: MouseEvent) => {
      target.x = e.clientX
      target.y = e.clientY
    }
    window.addEventListener('mousemove', onMove)

    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [disabled])

  if (disabled) return null

  return (
    <div
      ref={ref}
      style={{
        position:      'fixed',
        top:           0,
        left:          0,
        width:         '580px',
        height:        '580px',
        marginLeft:    '-290px',
        marginTop:     '-290px',
        background:    'radial-gradient(circle, rgba(31, 214, 95,0.13) 0%, rgba(31, 214, 95,0.05) 40%, transparent 70%)',
        pointerEvents: 'none',
        zIndex:        30,
        willChange:    'transform',
      }}
    />
  )
}
