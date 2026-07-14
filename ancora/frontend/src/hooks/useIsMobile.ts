import { useEffect, useState } from 'react'

// Isti breakpoint kao Tailwind `md` (768px) — ispod toga je "mobilni".
const QUERY = '(max-width: 767px)'

/* Prati da li je viewport mobilni i reaguje na promenu (rotacija/resize) u realnom vremenu. */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(QUERY).matches
  )

  useEffect(() => {
    const mq = window.matchMedia(QUERY)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return isMobile
}
