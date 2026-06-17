import { useEffect, useRef, useState } from 'react'

const PHRASES = [
  'Wise, honest advice',
  'Connection made clear',
  'Find your anchor',
  'Honest clarity',
  'Be heard. Be guided.',
  'Your personal advisor',
  'Dignified counsel',
  'Empathy meets intelligence',
]

const ITEMS = [...PHRASES, ...PHRASES]
const BASE  = 0.9

export default function MarqueeStrip() {
  const trackRef   = useRef<HTMLDivElement>(null)
  const posRef     = useRef(0)
  const speedRef   = useRef(BASE)
  const targetRef  = useRef(BASE)
  const pausedRef  = useRef(false)
  const lastYRef   = useRef(0)
  const lastTRef   = useRef(Date.now())
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    let halfW = 0
    let rafId = 0

    const onScroll = () => {
      if (pausedRef.current) return
      const now = Date.now()
      const dy  = window.scrollY - lastYRef.current
      const dt  = Math.max(now - lastTRef.current, 1)
      targetRef.current = BASE + (dy / dt) * 5
      lastYRef.current  = window.scrollY
      lastTRef.current  = now
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    const loop = () => {
      if (!halfW) halfW = track.scrollWidth / 2
      if (!halfW) { rafId = requestAnimationFrame(loop); return }

      speedRef.current  += (targetRef.current - speedRef.current) * 0.10
      targetRef.current += (BASE - targetRef.current) * 0.04

      posRef.current = ((posRef.current + speedRef.current) % halfW + halfW) % halfW
      track.style.transform = `translateX(-${posRef.current}px)`

      rafId = requestAnimationFrame(loop)
    }
    rafId = requestAnimationFrame(loop)

    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(rafId)
    }
  }, [])

  const pause  = () => { pausedRef.current = true;  targetRef.current = 0   }
  const resume = () => { pausedRef.current = false; targetRef.current = BASE }

  // sep na poziciji j je između phrase[j-1] i phrase[j]
  // aktivan kada je hovered phrase lijevi (j-1) ili desni (j) susjed
  const isSepActive = (j: number) =>
    hoveredIdx === j - 1 || hoveredIdx === j

  return (
    <div
      className="relative overflow-hidden select-none bg-white"
      style={{ padding: '24px 0' }}
      onMouseEnter={pause}
      onMouseLeave={() => { resume(); setHoveredIdx(null) }}
    >
      <div
        className="absolute left-0 top-0 bottom-0 z-10 pointer-events-none"
        style={{ width: '160px', background: 'linear-gradient(to right, #ffffff 25%, transparent)' }}
      />
      <div
        className="absolute right-0 top-0 bottom-0 z-10 pointer-events-none"
        style={{ width: '160px', background: 'linear-gradient(to left, #ffffff 25%, transparent)' }}
      />

      <div
        ref={trackRef}
        className="flex items-center"
        style={{ width: 'max-content', willChange: 'transform' }}
      >
        {ITEMS.map((phrase, i) => (
          <div key={i} className="flex items-center">
            {/* sep prije svake fraze */}
            <span className={`marquee-sep${isSepActive(i) ? ' sep-active' : ''}`}>◆</span>

            <span
              className="marquee-phrase"
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {phrase}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
