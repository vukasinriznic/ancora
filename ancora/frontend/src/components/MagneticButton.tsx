import { useRef, useEffect } from 'react'

interface Props {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

/*
  Magnetni dugme sa RAF lerp animacijom.

  Razlika od CSS transition pristupa:
  - CSS transition mijenja `transition` property tokom animacije
    sto moze uzrokovati trzaj kad se precini brzina.
  - RAF lerp konstantno interpolira trenutnu poziciju ka targetu
    istim faktorom (0.10) — glatko, bez trzaja, uvijek.

  Faktor 0.10 znaci: svaki frame se priblizava 10% razlike.
  Kursor napusti dugme → target postaje (0,0) → dugme se
  glatko vraca, ne "skace" nazad.
*/
export default function MagneticButton({ children, className, style }: Props) {
  const ref = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const btn = ref.current
    if (!btn) return

    // Target: gdje dugme treba biti (pomak od centra)
    // Current: gdje dugme trenutno JEST (animira se ka target-u)
    const target  = { x: 0, y: 0 }
    const current = { x: 0, y: 0 }
    let raf = 0

    const tick = () => {
      // Lerp — interpolacija 10% razlike svaki frame (≈60fps)
      current.x += (target.x - current.x) * 0.10
      current.y += (target.y - current.y) * 0.10
      btn.style.transform = `translate(${current.x.toFixed(2)}px, ${current.y.toFixed(2)}px)`
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    const onMouseMove = (e: MouseEvent) => {
      const rect = btn.getBoundingClientRect()
      // 0.30 = dugme se pomjera 30% od koliko je kursor odmaknut od centra
      target.x = (e.clientX - (rect.left + rect.width  / 2)) * 0.30
      target.y = (e.clientY - (rect.top  + rect.height / 2)) * 0.30
    }

    const onMouseLeave = () => {
      // Postavljamo target nazad na (0,0) — lerp ce glatko dovesti dugme
      target.x = 0
      target.y = 0
    }

    btn.addEventListener('mousemove', onMouseMove)
    btn.addEventListener('mouseleave', onMouseLeave)

    return () => {
      btn.removeEventListener('mousemove', onMouseMove)
      btn.removeEventListener('mouseleave', onMouseLeave)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <button ref={ref} className={className} style={style}>
      {children}
    </button>
  )
}
