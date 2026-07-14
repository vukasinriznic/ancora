import { useEffect, useRef } from 'react'

/*
  Interaktivna "zavjesa" — dijamantska mreža na canvasu koja se savija
  oko kursora (tačke se odbijaju s mekim povratkom, kao tkanina koju guraš).
  Linije zasvijetle jače tamo gdje su iskrivljene.
*/
export default function CurtainMesh() {
  const wrapRef   = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const wrap   = wrapRef.current
    const canvas = canvasRef.current
    if (!wrap || !canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const g: CanvasRenderingContext2D = ctx

    // "reduce" = nacrtaj samo jedan miran kadar bez fizike/rAF petlje.
    // Uključujemo i mobilni (≤767px): cloth-simulacija cele mreže svaki frame secka
    // na telefonima i lomi scroll. Na desktopu ostaje puna interakcija.
    const reduce =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      window.matchMedia('(max-width: 767px)').matches

    const dpr     = Math.min(window.devicePixelRatio || 1, 2)
    const S       = 38      // razmak mreže
    const R       = 190     // radijus uticaja kursora
    // Verlet membrana (pravi cloth — talas se prostire kroz susjede)
    const K_NEIGH = 0.14    // coupling sa susjedima → propagacija talasa
    const K_TETHER= 0.006   // slabo vraćanje na baznu mrežu
    const DAMP    = 0.93    // prigušenje brzine
    const CUR     = 1.9     // jačina kursora (djeluje samo dok se miš kreće)
    const AMP     = 7       // amplituda stalnog ambijentalnog talasanja (px)
    const MAXOFF  = 74      // maks. pomjeraj od baze (stabilnost)
    const NORM    = 30      // normalizacija sjaja po pomjeraju

    let W = 0, H = 0, cols = 0, rows = 0
    type P = { bx: number; by: number; x: number; y: number; px: number; py: number; fx: number; fy: number; dx: number; dy: number }
    let pts: P[][] = []

    // Floating particles (prašina u svjetlu)
    type Particle = { x: number; y: number; r: number; spd: number; drift: number; phase: number }
    let parts: Particle[] = []

    const build = () => {
      const rect = wrap.getBoundingClientRect()
      W = rect.width; H = rect.height
      canvas.width  = Math.max(1, Math.floor(W * dpr))
      canvas.height = Math.max(1, Math.floor(H * dpr))
      canvas.style.width  = W + 'px'
      canvas.style.height = H + 'px'
      g.setTransform(dpr, 0, 0, dpr, 0, 0)
      cols = Math.ceil(W / S) + 1
      rows = Math.ceil(H / S) + 1
      pts = []
      for (let i = 0; i <= cols; i++) {
        pts[i] = []
        for (let j = 0; j <= rows; j++) {
          const bx = i * S, by = j * S
          pts[i][j] = { bx, by, x: bx, y: by, px: bx, py: by, fx: 0, fy: 0, dx: bx, dy: by }
        }
      }
      // Čestice — broj prema površini
      const count = Math.max(16, Math.min(48, Math.round((W * H) / 26000)))
      parts = []
      for (let k = 0; k < count; k++) {
        parts.push({
          x: Math.random() * W,
          y: Math.random() * H,
          r: 0.8 + Math.random() * 1.8,
          spd: 0.15 + Math.random() * 0.4,
          drift: 6 + Math.random() * 10,
          phase: Math.random() * Math.PI * 2,
        })
      }
    }

    let mx = -9999, my = -9999, energy = 0, time = 0
    const onMove = (e: MouseEvent) => {
      const rect = wrap.getBoundingClientRect()
      mx = e.clientX - rect.left
      my = e.clientY - rect.top
      energy = 1                     // glow jača na pomjeraj, gasi se kad stane
    }
    const onLeave = () => { mx = -9999; my = -9999 }

    let visible = true
    const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting }, { threshold: 0 })
    io.observe(wrap)
    const ro = new ResizeObserver(() => { build(); render(time) })
    ro.observe(wrap)
    build()

    window.addEventListener('mousemove', onMove, { passive: true })
    document.addEventListener('mouseleave', onLeave)

    function render(t: number) {
      g.clearRect(0, 0, W, H)

      if (!reduce) {
        // ── Prolaz 1: sile (susjedi + baza + vjetar + kursor) ──
        for (let i = 0; i <= cols; i++) {
          for (let j = 0; j <= rows; j++) {
            const p = pts[i][j]
            let fx = (p.bx - p.x) * K_TETHER
            let fy = (p.by - p.y) * K_TETHER
            // prosjek susjeda (Laplacian → talas se prostire kroz tkaninu)
            let nx = 0, ny = 0, n = 0
            if (i > 0)    { const q = pts[i - 1][j]; nx += q.x; ny += q.y; n++ }
            if (i < cols) { const q = pts[i + 1][j]; nx += q.x; ny += q.y; n++ }
            if (j > 0)    { const q = pts[i][j - 1]; nx += q.x; ny += q.y; n++ }
            if (j < rows) { const q = pts[i][j + 1]; nx += q.x; ny += q.y; n++ }
            if (n > 0) { fx += (nx / n - p.x) * K_NEIGH; fy += (ny / n - p.y) * K_NEIGH }
            // kursor — privlačenje (skuplja tkaninu)
            const dx = mx - p.x, dy = my - p.y
            const dist = Math.hypot(dx, dy)
            if (dist < R && dist > 0.001) {
              const ff = 1 - dist / R
              const s = ff * ff * CUR * energy   // djeluje samo dok se miš kreće
              fx += (dx / dist) * s
              fy += (dy / dist) * s
            }
            p.fx = fx; p.fy = fy
          }
        }
        // ── Prolaz 2: Verlet integracija + clamp; ivice pinovane ──
        for (let i = 0; i <= cols; i++) {
          for (let j = 0; j <= rows; j++) {
            const p = pts[i][j]
            if (i === 0 || i === cols || j === 0 || j === rows) {
              p.x = p.bx; p.y = p.by; p.px = p.bx; p.py = p.by
              continue
            }
            const vx = (p.x - p.px) * DAMP
            const vy = (p.y - p.py) * DAMP
            p.px = p.x; p.py = p.y
            p.x += vx + p.fx
            p.y += vy + p.fy
            const ox = p.x - p.bx, oy = p.y - p.by
            const od = Math.hypot(ox, oy)
            if (od > MAXOFF) { p.x = p.bx + ox / od * MAXOFF; p.y = p.by + oy / od * MAXOFF }
          }
        }
      }

      // ── Stalno ambijentalno talasanje (vizuelni sloj) — cijela zavjesa diše ──
      for (let i = 0; i <= cols; i++) {
        for (let j = 0; j <= rows; j++) {
          const p = pts[i][j]
          if (reduce) { p.dx = p.bx; p.dy = p.by; continue }
          const sX = Math.sin(p.by * 0.020 + t * 0.9) * AMP + Math.sin((p.bx + p.by) * 0.011 + t * 0.6) * AMP * 0.5
          const sY = Math.cos(p.bx * 0.017 + t * 0.8) * AMP * 0.8
          p.dx = p.x + sX
          p.dy = p.y + sY
        }
      }

      // Crtanje dijamantskih dijagonala (preko dx/dy = fizika + talasanje)
      g.lineWidth = 1
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const a = pts[i][j], b = pts[i + 1][j + 1]
          const c = pts[i + 1][j], d = pts[i][j + 1]
          const disp = Math.hypot(a.dx - a.bx, a.dy - a.by)
          const op = 0.06 + Math.min(disp / NORM, 1) * 0.26
          g.strokeStyle = `rgba(31, 214, 95,${op.toFixed(3)})`
          g.beginPath()
          g.moveTo(a.dx, a.dy); g.lineTo(b.dx, b.dy)
          g.moveTo(c.dx, c.dy); g.lineTo(d.dx, d.dy)
          g.stroke()
        }
      }

      // ── Floating particles — plove naviše kroz tamu (ispred mreže) ──
      for (const pt of parts) {
        if (!reduce) {
          pt.y -= pt.spd
          if (pt.y < -6) { pt.y = H + 6; pt.x = Math.random() * W }
        }
        const px = reduce ? pt.x : pt.x + Math.sin(t * 0.8 + pt.phase) * pt.drift
        const tw = reduce ? 0.3 : 0.35 + 0.35 * (0.5 + 0.5 * Math.sin(t * 1.6 + pt.phase))
        g.fillStyle = `rgba(84, 233, 138,${(tw * 0.18).toFixed(3)})`   // halo
        g.beginPath(); g.arc(px, pt.y, pt.r * 2.6, 0, Math.PI * 2); g.fill()
        g.fillStyle = `rgba(167,243,208,${tw.toFixed(3)})`          // jezgro
        g.beginPath(); g.arc(px, pt.y, pt.r, 0, Math.PI * 2); g.fill()
      }

      // Glow koji prati kursor — jača na pomjeraj, blago se gasi kad stane
      if (!reduce && energy > 0.01 && mx > -R && mx < W + R && my > -R && my < H + R) {
        const a = energy * 0.2
        const grad = g.createRadialGradient(mx, my, 0, mx, my, R * 0.95)
        grad.addColorStop(0, `rgba(84, 233, 138,${a.toFixed(3)})`)
        grad.addColorStop(1, 'rgba(31, 214, 95,0)')
        g.fillStyle = grad
        g.fillRect(mx - R, my - R, R * 2, R * 2)
      }
    }

    let raf = 0
    const loop = () => {
      if (visible) { time += 0.016; energy *= 0.90; render(time) }
      raf = requestAnimationFrame(loop)
    }
    render(0)
    if (!reduce) raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      io.disconnect(); ro.disconnect()
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return (
    <div ref={wrapRef} className="absolute inset-0 pointer-events-none" aria-hidden>
      <canvas ref={canvasRef} className="block" />
    </div>
  )
}
