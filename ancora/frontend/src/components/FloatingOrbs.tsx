import { useEffect, useRef } from 'react'

const ORBS = [
  { id: 1, size: 480, left: 8,  top: 25, opacity: 0.18, duration: 9,  delay: 0   },
  { id: 2, size: 380, left: 82, top: 18, opacity: 0.15, duration: 11, delay: 1.5 },
  { id: 3, size: 300, left: 62, top: 72, opacity: 0.14, duration: 8,  delay: 0.8 },
  { id: 4, size: 440, left: 18, top: 68, opacity: 0.12, duration: 13, delay: 0.3 },
  { id: 5, size: 320, left: 88, top: 58, opacity: 0.16, duration: 10, delay: 2   },
]

function Orb({ size, left, top, opacity, duration, delay }: typeof ORBS[0]) {
  const innerRef = useRef<HTMLDivElement>(null)
  const curX = useRef(0)
  const curY = useRef(0)
  const tgtX = useRef(0)
  const tgtY = useRef(0)
  const raf  = useRef(0)

  useEffect(() => {
    const el = innerRef.current
    if (!el) return

    const tick = () => {
      curX.current += (tgtX.current - curX.current) * 0.06
      curY.current += (tgtY.current - curY.current) * 0.06
      el.style.transform = `translate(${curX.current.toFixed(1)}px, ${curY.current.toFixed(1)}px)`
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)

    const onMove = (e: MouseEvent) => {
      const bx = (left / 100) * window.innerWidth
      const by = (top  / 100) * window.innerHeight
      const dx = e.clientX - bx
      const dy = e.clientY - by
      const d  = Math.sqrt(dx * dx + dy * dy)
      if (d < 240 && d > 0) {
        const f = ((240 - d) / 240) * 100
        tgtX.current = -(dx / d) * f
        tgtY.current = -(dy / d) * f
      } else {
        tgtX.current = 0
        tgtY.current = 0
      }
    }

    window.addEventListener('mousemove', onMove)
    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf.current)
    }
  }, [left, top])

  return (
    <div
      className="ancora-orb"
      style={{
        position: 'absolute',
        left: `${left}%`,
        top: `${top}%`,
        width: size,
        height: size,
        marginLeft: -size / 2,
        marginTop: -size / 2,
        pointerEvents: 'none',
        animationName: 'orbFloat',
        animationDuration: `${duration}s`,
        animationTimingFunction: 'ease-in-out',
        animationDelay: `${delay}s`,
        animationIterationCount: 'infinite',
        animationDirection: 'alternate',
      }}
    >
      <div
        ref={innerRef}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          background: 'radial-gradient(circle at center, #5A9E7A 0%, #3D7A5C 45%, transparent 70%)',
          opacity,
          filter: 'blur(45px)',
        }}
      />
    </div>
  )
}

export default function FloatingOrbs() {
  return (
    <>
      <style>{`
        @keyframes orbFloat {
          from { transform: translateY(0px);   }
          to   { transform: translateY(-24px); }
        }
      `}</style>
      {ORBS.map(orb => <Orb key={orb.id} {...orb} />)}
    </>
  )
}
