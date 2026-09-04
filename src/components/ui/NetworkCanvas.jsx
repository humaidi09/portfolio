import { useEffect, useRef } from 'react'

/**
 * The site's living backdrop: a competitive-programmer's graph, alive.
 *
 * Nodes drift slowly across the plane; any two close enough are joined by a
 * hairline edge whose opacity fades with distance — a constellation that keeps
 * rewiring itself. Riding that graph are a handful of bright "signals" that
 * traverse edge to edge like a pathfinding trace (BFS/DFS), hopping to a random
 * neighbour each time they arrive. The result reads as a computation quietly
 * running behind the page — motion you can watch, not decoration.
 *
 * Pure <canvas> + requestAnimationFrame, so it runs continuously and stays
 * smooth. Themed live from the --color-neon-cyan token (re-reads on light/dark
 * toggle). GPU/CPU-light: node count scales with viewport, edges are O(n²) over
 * a small n, and the whole loop is paused under prefers-reduced-motion (a single
 * static frame is drawn instead). aria-hidden + fixed + pointer-events-none.
 */
export default function NetworkCanvas({ className = '' }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // --- theme colour, read live from the CSS token -------------------
    let rgb = [242, 180, 61] // amber fallback
    const readColor = () => {
      const raw = getComputedStyle(document.documentElement)
        .getPropertyValue('--color-neon-cyan')
        .trim()
      const parsed = parseColor(raw)
      if (parsed) rgb = parsed
    }
    readColor()
    // Re-read when the .light/.dark class flips on <html>.
    const themeObserver = new MutationObserver(readColor)
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    // --- sizing (devicePixelRatio-aware) ------------------------------
    let width = 0
    let height = 0
    let dpr = 1
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      seed()
    }

    // --- graph state --------------------------------------------------
    const LINK_DIST = 165 // px: nodes closer than this get an edge
    let nodes = []
    let signals = []

    const seed = () => {
      // Density scales with area but is capped so the backdrop stays quiet and
      // never competes with the content in front of it.
      const count = Math.min(80, Math.max(28, Math.round((width * height) / 22000)))
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        r: Math.random() * 1.3 + 1.0,
      }))
      // A few travelling signals riding the graph — the one lively accent,
      // kept sparse so the backdrop stays calm behind the content.
      const sigCount = Math.min(4, Math.max(2, Math.round(count / 16)))
      signals = Array.from({ length: sigCount }, () => makeSignal())
    }

    function makeSignal() {
      const from = (Math.random() * nodes.length) | 0
      return { from, to: pickNeighbor(from, from), t: Math.random(), speed: 0 }
    }

    // Nearest-ish connected neighbour (within LINK_DIST); falls back to a
    // random node so a signal is never stranded.
    function pickNeighbor(idx, avoid) {
      const a = nodes[idx]
      if (!a) return (Math.random() * nodes.length) | 0
      const candidates = []
      for (let j = 0; j < nodes.length; j++) {
        if (j === idx || j === avoid) continue
        const b = nodes[j]
        const d = Math.hypot(a.x - b.x, a.y - b.y)
        if (d < LINK_DIST) candidates.push(j)
      }
      if (candidates.length) return candidates[(Math.random() * candidates.length) | 0]
      return (Math.random() * nodes.length) | 0
    }

    // --- draw ---------------------------------------------------------
    const draw = () => {
      ctx.clearRect(0, 0, width, height)
      const [r, g, b] = rgb

      // Move nodes, bounce at edges.
      for (const n of nodes) {
        n.x += n.vx
        n.y += n.vy
        if (n.x < 0 || n.x > width) n.vx *= -1
        if (n.y < 0 || n.y > height) n.vy *= -1
        n.x = Math.max(0, Math.min(width, n.x))
        n.y = Math.max(0, Math.min(height, n.y))
      }

      // Edges — faint hairlines, fading with distance.
      ctx.lineWidth = 1
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i]
          const c = nodes[j]
          const d = Math.hypot(a.x - c.x, a.y - c.y)
          if (d < LINK_DIST) {
            const o = (1 - d / LINK_DIST) * 0.3
            ctx.strokeStyle = `rgba(${r},${g},${b},${o})`
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(c.x, c.y)
            ctx.stroke()
          }
        }
      }

      // Nodes — quiet glowing dots.
      for (const n of nodes) {
        const halo = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 3.5)
        halo.addColorStop(0, `rgba(${r},${g},${b},0.32)`)
        halo.addColorStop(1, `rgba(${r},${g},${b},0)`)
        ctx.fillStyle = halo
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r * 3.5, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = `rgba(${r},${g},${b},0.7)`
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2)
        ctx.fill()
      }

      // Travelling signals — bright glowing heads riding the edges.
      for (const s of signals) {
        const a = nodes[s.from]
        const c = nodes[s.to]
        if (!a || !c) {
          Object.assign(s, makeSignal())
          continue
        }
        const d = Math.hypot(a.x - c.x, a.y - c.y) || 1
        // Constant screen speed regardless of edge length.
        s.t += (reduce ? 0 : 60 / d) * 0.018
        if (s.t >= 1) {
          s.from = s.to
          s.to = pickNeighbor(s.from, s.from)
          s.t = 0
        }
        const x = a.x + (c.x - a.x) * s.t
        const y = a.y + (c.y - a.y) * s.t

        // Soft trail along the current edge.
        const grad = ctx.createLinearGradient(a.x, a.y, x, y)
        grad.addColorStop(0, `rgba(${r},${g},${b},0)`)
        grad.addColorStop(1, `rgba(${r},${g},${b},0.4)`)
        ctx.strokeStyle = grad
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(x, y)
        ctx.stroke()

        // Glowing head — small but the one moving highlight.
        const glow = ctx.createRadialGradient(x, y, 0, x, y, 9)
        glow.addColorStop(0, `rgba(${r},${g},${b},0.5)`)
        glow.addColorStop(0.4, `rgba(${r},${g},${b},0.2)`)
        glow.addColorStop(1, `rgba(${r},${g},${b},0)`)
        ctx.fillStyle = glow
        ctx.beginPath()
        ctx.arc(x, y, 9, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = `rgba(${r},${g},${b},0.82)`
        ctx.beginPath()
        ctx.arc(x, y, 1.5, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // --- loop ---------------------------------------------------------
    let raf = 0
    const tick = () => {
      draw()
      raf = requestAnimationFrame(tick)
    }

    resize()
    window.addEventListener('resize', resize)

    if (reduce) {
      draw() // one static frame, then stop
    } else {
      raf = requestAnimationFrame(tick)
    }

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      themeObserver.disconnect()
    }
  }, [])

  return <canvas ref={canvasRef} aria-hidden="true" className={className} />
}

/** Parse a CSS colour token (#hex, rgb(), or oklab via a temp element) to [r,g,b]. */
function parseColor(raw) {
  if (!raw) return null
  // #rrggbb / #rgb
  if (raw.startsWith('#')) {
    let h = raw.slice(1)
    if (h.length === 3) h = h.split('').map((c) => c + c).join('')
    const int = parseInt(h, 16)
    if (Number.isNaN(int)) return null
    return [(int >> 16) & 255, (int >> 8) & 255, int & 255]
  }
  // rgb(...) — pull the first three numbers.
  const m = raw.match(/(\d+(\.\d+)?)/g)
  if (raw.startsWith('rgb') && m && m.length >= 3) {
    return [Math.round(+m[0]), Math.round(+m[1]), Math.round(+m[2])]
  }
  // Anything else (oklab, etc.): let the browser resolve it to rgb.
  try {
    const el = document.createElement('span')
    el.style.color = raw
    document.body.appendChild(el)
    const resolved = getComputedStyle(el).color
    document.body.removeChild(el)
    const mm = resolved.match(/(\d+(\.\d+)?)/g)
    if (mm && mm.length >= 3) return [Math.round(+mm[0]), Math.round(+mm[1]), Math.round(+mm[2])]
  } catch {
    /* ignore */
  }
  return null
}
