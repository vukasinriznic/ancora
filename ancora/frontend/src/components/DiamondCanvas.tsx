import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react'

interface Diamond {
  x: number
  y: number
  originX: number
  originY: number
  // Intro: launch tacka van ekrana + stagger; oblik dolijece odavde na origin
  startX: number
  startY: number
  introDelay: number
  sizeX: number
  sizeY: number
  opacity: number
  rotation: number
  vx: number
  vy: number
  // Horizontalni drift — izuzetno spor, siroki luk (kelp-in-water efekat)
  driftPhaseX: number
  driftSpeedX: number
  driftAmpX:   number
  // Vertikalni drift — nesto brzi, uzi luk
  driftPhaseY: number
  driftSpeedY: number
  driftAmpY:   number
  shimmerPhase: number
  shimmerSpeed: number
}

export interface DiamondCanvasHandle {
  triggerExplosion: (cx: number, cy: number) => void
}

function createDiamonds(width: number, height: number, cols: number, rows: number): Diamond[] {
  // Stratified sampling: cols×rows grid, jedan oblik po celiji sa random offsetom.
  // Ovo garantuje ravnomjernu pokrivenost cijele hero sekcije bez nasumicnog
  // grupiranja koje bi Math.random() sam po sebi mogao da napravi.
  const COLS = cols
  const ROWS = rows
  const count = cols * rows
  const cellW = width  / COLS
  const cellH = height / ROWS
  const cx = width  / 2
  const cy = height / 2

  return Array.from({ length: count }, (_, i) => {
    const col = i % COLS
    const row = Math.floor(i / COLS)
    // 0.1–0.9 unutar celije: oblik nece sletjeti previse blizu ruba celije
    const x = (col + 0.1 + Math.random() * 0.8) * cellW
    const y = (row + 0.1 + Math.random() * 0.8) * cellH

    // Launch tacka: radijalno od centra ka obliku, gurnuta daleko van ekrana
    const dirX = x - cx
    const dirY = y - cy
    const len  = Math.hypot(dirX, dirY) || 1
    const launch = 600 + Math.random() * 500   // 600–1100px van pozicije
    return {
      x, y,
      originX: x,
      originY: y,
      startX: x + (dirX / len) * launch,
      startY: y + (dirY / len) * launch,
      introDelay: i * 0.045,                    // stagger: oblici ulijecu jedan za drugim

      sizeX: 28 + Math.random() * 44,
      sizeY: 14 + Math.random() * 26,
      opacity: 0.22 + Math.random() * 0.38,
      rotation: Math.random() * Math.PI * 2,
      vx: 0, vy: 0,
      driftPhaseX:  Math.random() * Math.PI * 2,
      driftSpeedX:  0.06 + Math.random() * 0.10, // 0.06–0.16 rad/s = 40–100s po ciklusu
      driftAmpX:    45 + Math.random() * 55,      // 45–100px horizontalnog lutanja
      driftPhaseY:  Math.random() * Math.PI * 2,
      driftSpeedY:  0.20 + Math.random() * 0.28, // 0.20–0.48 rad/s = 13–31s po ciklusu
      driftAmpY:    18 + Math.random() * 20,      // 18–38px vertikalnog plutanja
      shimmerPhase: Math.random() * Math.PI * 2,
      shimmerSpeed: 1.1 + Math.random() * 1.6,
    }
  })
}

/*
  Zaobljeni rombus: umjesto 4 ostra ugla koristimo quadraticCurveTo.
  Faktor f=0.28 kontrolise zaobljenost — lineTo vodi do blizine
  ugla, a bezier krivulja glatko prelazi oko samog vrha.

  Vizualno: 8 segmenata (4 linije + 4 krivulje) daju mekan,
  elegantan oblik koji izgleda rafiniranije od ostrog romba.
*/
function drawShape(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  sizeX: number,
  sizeY: number,
  rotation: number,
  opacity: number,
  time: number,
  shimmerPhase: number,
  shimmerSpeed: number,
) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(rotation)

  const f = 0.28

  ctx.beginPath()
  ctx.moveTo(-sizeX * f,      -sizeY * (1 - f))
  ctx.quadraticCurveTo(0,     -sizeY, sizeX * f, -sizeY * (1 - f))
  ctx.lineTo(sizeX * (1 - f), -sizeY * f)
  ctx.quadraticCurveTo(sizeX,  0,     sizeX * (1 - f), sizeY * f)
  ctx.lineTo(sizeX * f,        sizeY * (1 - f))
  ctx.quadraticCurveTo(0,      sizeY, -sizeX * f, sizeY * (1 - f))
  ctx.lineTo(-sizeX * (1 - f), sizeY * f)
  ctx.quadraticCurveTo(-sizeX, 0,    -sizeX * (1 - f), -sizeY * f)
  ctx.closePath()

  // Vertikalni gradient — refleksija svjetla od vrha do dna
  const grad = ctx.createLinearGradient(0, -sizeY, 0, sizeY)
  grad.addColorStop(0,    `rgba(31, 214, 95,  ${opacity * 0.42})`)
  grad.addColorStop(0.22, `rgba(84, 233, 138, ${opacity * 0.95})`)
  grad.addColorStop(0.50, `rgba(31, 214, 95,  ${opacity})`)
  grad.addColorStop(0.75, `rgba(15, 94, 64,   ${opacity * 0.66})`)
  grad.addColorStop(1,    `rgba(12, 61, 45,   ${opacity * 0.42})`)
  ctx.fillStyle = grad

  // Border koji pulsira sinusom — od tamne zelene do bijelo-zelenog sjaja
  const shimmer = Math.sin(time * shimmerSpeed + shimmerPhase) * 0.5 + 0.5
  const rC = Math.round(31  + shimmer * 195)
  const gC = Math.round(214 + shimmer * 23)
  const bC = Math.round(95  + shimmer * 135)
  ctx.strokeStyle = `rgba(${rC}, ${gC}, ${bC}, ${Math.min(opacity * (0.22 + shimmer * 1.5), 1)})`
  ctx.lineWidth   = 0.6 + shimmer * 2.4

  ctx.fill()
  ctx.stroke()
  ctx.restore()
}

const DiamondCanvas = forwardRef<DiamondCanvasHandle>((_, ref) => {
  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const mouseRef     = useRef({ x: -9999, y: -9999 })
  const diamondsRef  = useRef<Diamond[]>([])
  const rafRef       = useRef(0)
  const startTimeRef = useRef(Date.now())

  useImperativeHandle(ref, () => ({
    /*
      Eksplozija: svi oblici izlaze iz ekrana pa se polako vracaju.

      Pristup:
      1. Svakom obliku postavljamo brzinu direktno (override) — smjer
         je od tacke klika KA obliku (radijalna eksplozija).
      2. Brzina 165-210px/frame je dovoljno velika da svaki oblik
         prode rub ekrana i bez spring sile (max_bez_springa = v/0.12 ≈ 1750px).
      3. Spring (0.022) i damping (0.88) prirodno ga vracaju na
         originalnu poziciju — sto je oblik dalje, veca sila povratka.
    */
    triggerExplosion: (cx: number, cy: number) => {
      for (const d of diamondsRef.current) {
        const dx   = d.x - cx
        const dy   = d.y - cy
        const dist = Math.sqrt(dx * dx + dy * dy)

        let nx: number, ny: number
        if (dist < 1) {
          const angle = Math.random() * Math.PI * 2
          nx = Math.cos(angle)
          ny = Math.sin(angle)
        } else {
          nx = dx / dist
          ny = dy / dist
        }

        // Razlicita brzina po obliku = prirodniji, manje uniforman izgled
        const speed = 110 + Math.random() * 30
        d.vx = nx * speed
        d.vy = ny * speed
      }
    },
  }))

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      // Kristali se pojavljuju samo u gornjoj 2/3 (hero area).
      // Donja 1/3 je prostor u koji oblici mogu da ulete tokom eksplozije.
      // Manje rombova na mobilnom (uže = manje kolona).
      const cols = canvas.width < 640 ? 2 : 4
      diamondsRef.current = createDiamonds(canvas.width, canvas.height * (2 / 3), cols, 3)
    }
    resize()
    window.addEventListener('resize', resize)

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }
    window.addEventListener('mousemove', onMouseMove)

    const REPULSION_RADIUS = 165
    const REPULSION_FORCE  = 7.5
    const SPRING           = 0.012  // nizak spring = sporo, lirsiko vracanje na mjesto
    const DAMPING          = 0.88
    const INTRO_DUR        = 1.3    // sekundi po obliku za ulijetanje

    const loop = () => {
      const time = (Date.now() - startTimeRef.current) / 1000
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (const d of diamondsRef.current) {
        // Dvodimenzionalno lutanje: svaki rombus ima vlastiti X i Y sin talas
        // sa razlicitim fazama i brzinama → organsko, nasumicno plutanje
        const driftX = Math.sin(time * d.driftSpeedX + d.driftPhaseX) * d.driftAmpX
        const driftY = Math.sin(time * d.driftSpeedY + d.driftPhaseY) * d.driftAmpY

        // ── Intro: oblik dolijece sa launch tacke van ekrana na svoju poziciju ──
        const lp = Math.min(Math.max((time - d.introDelay) / INTRO_DUR, 0), 1)
        if (lp < 1) {
          const eased = 1 - Math.pow(1 - lp, 3)   // easeOutCubic
          // Cilj je origin + trenutni drift → na kraju intra nema skoka u fiziku
          const tX = d.originX + driftX
          const tY = d.originY + driftY
          d.x = d.startX + (tX - d.startX) * eased
          d.y = d.startY + (tY - d.startY) * eased
          d.rotation += 0.02                       // lagano vrti dok leti
          drawShape(
            ctx, d.x, d.y,
            d.sizeX, d.sizeY,
            d.rotation, d.opacity * eased,         // fade-in
            time, d.shimmerPhase, d.shimmerSpeed,
          )
          continue
        }

        const dx   = d.x - mouseRef.current.x
        const dy   = d.y - mouseRef.current.y
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist < REPULSION_RADIUS && dist > 0) {
          const force = (REPULSION_RADIUS - dist) / REPULSION_RADIUS
          d.vx += (dx / dist) * force * REPULSION_FORCE
          d.vy += (dy / dist) * force * REPULSION_FORCE
        }

        // Spring target je pomjerena "home" pozicija — oblik uvijek pluta oko nje
        d.vx += (d.originX + driftX - d.x) * SPRING
        d.vy += (d.originY + driftY - d.y) * SPRING
        d.vx *= DAMPING
        d.vy *= DAMPING

        d.x += d.vx
        d.y += d.vy
        d.rotation += d.vx * 0.006

        drawShape(
          ctx, d.x, d.y,
          d.sizeX, d.sizeY,
          d.rotation, d.opacity,
          time, d.shimmerPhase, d.shimmerSpeed,
        )
      }

      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouseMove)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '150vh', pointerEvents: 'none' }}
    />
  )
})

DiamondCanvas.displayName = 'DiamondCanvas'
export default DiamondCanvas
