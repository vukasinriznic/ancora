import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  sizeX: number
  sizeY: number
  rotation: number
  rotSpeed: number
  life: number
  decay: number
  baseOpacity: number
}

export type TrailVariant = 'green' | 'white'

// Isti zaobljeni rombus kao DiamondCanvas (quadratic bezier, f=0.3)
function drawMiniCrystal(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  sx: number,
  sy: number,
  rotation: number,
  opacity: number,
  variant: TrailVariant,
) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(rotation)

  const f = 0.3
  ctx.beginPath()
  ctx.moveTo(-sx * f,       -sy * (1 - f))
  ctx.quadraticCurveTo(0,   -sy,  sx * f,       -sy * (1 - f))
  ctx.lineTo(sx * (1 - f),  -sy * f)
  ctx.quadraticCurveTo(sx,   0,   sx * (1 - f),  sy * f)
  ctx.lineTo(sx * f,          sy * (1 - f))
  ctx.quadraticCurveTo(0,    sy,  -sx * f,        sy * (1 - f))
  ctx.lineTo(-sx * (1 - f),  sy * f)
  ctx.quadraticCurveTo(-sx,  0,  -sx * (1 - f), -sy * f)
  ctx.closePath()

  const grad = ctx.createLinearGradient(0, -sy, 0, sy)
  if (variant === 'white') {
    grad.addColorStop(0,    `rgba(255, 255, 255, ${opacity * 0.9})`)
    grad.addColorStop(0.45, `rgba(255, 255, 255, ${opacity * 0.7})`)
    grad.addColorStop(1,    `rgba(255, 255, 255, ${opacity * 0.45})`)
    ctx.fillStyle   = grad
    ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.8})`
  } else {
    grad.addColorStop(0,    `rgba(84, 233, 138, ${opacity * 0.85})`)
    grad.addColorStop(0.45, `rgba(31, 214, 95,  ${opacity})`)
    grad.addColorStop(1,    `rgba(20, 184, 84,  ${opacity * 0.55})`)
    ctx.fillStyle   = grad
    ctx.strokeStyle = `rgba(134, 239, 172, ${opacity * 0.7})`
  }
  ctx.lineWidth   = 0.5

  ctx.fill()
  ctx.stroke()
  ctx.restore()
}

export default function CursorTrail({ variant = 'green' }: { variant?: TrailVariant }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const particles: Particle[] = []
    let lastX = -999
    let lastY = -999
    let rafId = 0

    const spawn = (x: number, y: number) => {
      particles.push({
        x: x + (Math.random() - 0.5) * 8,
        y: y + (Math.random() - 0.5) * 8,
        vx:       (Math.random() - 0.5) * 1.6,
        vy:       -0.5 - Math.random() * 1.4,  // pluta prema gore
        sizeX:    4 + Math.random() * 9,
        sizeY:    2.5 + Math.random() * 5,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.06,
        life:     1,
        decay:    0.020 + Math.random() * 0.016,
        baseOpacity: 0.50 + Math.random() * 0.40,
      })
    }

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.x        += p.vx
        p.y        += p.vy
        p.rotation += p.rotSpeed
        p.vy       *= 0.98  // lagano usporava uzlet
        p.life     -= p.decay

        if (p.life <= 0) { particles.splice(i, 1); continue }

        // ease-out: kvadratni pad na kraju zivota
        const opacity = p.baseOpacity * p.life * p.life
        drawMiniCrystal(ctx, p.x, p.y, p.sizeX, p.sizeY, p.rotation, opacity, variant)
      }

      rafId = requestAnimationFrame(loop)
    }
    rafId = requestAnimationFrame(loop)

    const onMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - lastX
      const dy = e.clientY - lastY
      // Spawn svaki ~14px pomaka (dx²+dy² > 196)
      if (dx * dx + dy * dy > 196) {
        spawn(e.clientX, e.clientY)
        lastX = e.clientX
        lastY = e.clientY
      }
    }
    window.addEventListener('mousemove', onMouseMove)

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouseMove)
      cancelAnimationFrame(rafId)
    }
  }, [variant])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position:      'fixed',
        top:           0,
        left:          0,
        width:         '100%',
        height:        '100%',
        pointerEvents: 'none',
        zIndex:        9999,
      }}
    />
  )
}
