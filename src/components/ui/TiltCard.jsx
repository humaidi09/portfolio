import { useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'

// Accent glows for the cursor-tracking sheen (keyed to the site's amber signal).
const GLOW = {
  cyan: 'rgba(242, 180, 61, 0.20)',
  violet: 'rgba(207, 144, 56, 0.20)',
  magenta: 'rgba(246, 209, 140, 0.20)',
}

/**
 * A frosted-glass 3D card: the body tilts toward the cursor, a specular sheen
 * follows the pointer, and children can be lifted onto their own plane with a
 * `translateZ` utility. Stays perfectly still under prefers-reduced-motion.
 *
 * @param {('cyan'|'violet'|'magenta')} accent  glow color
 * @param {number} max        max tilt in degrees (default 10)
 * @param {number} lift       hover translateY in px (default 4)
 */
export default function TiltCard({
  accent = 'cyan',
  max = 10,
  lift = 4,
  className = '',
  children,
  ...rest
}) {
  const reduce = useReducedMotion()
  const ref = useRef(null)
  const [t, setT] = useState({ rx: 0, ry: 0, gx: 50, gy: 50, active: false })

  const onMove = (e) => {
    if (reduce || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width
    const py = (e.clientY - r.top) / r.height
    setT({ rx: (0.5 - py) * max, ry: (px - 0.5) * (max * 1.2), gx: px * 100, gy: py * 100, active: true })
  }
  const onLeave = () => setT({ rx: 0, ry: 0, gx: 50, gy: 50, active: false })

  const translateY = t.active && !reduce ? -lift : 0

  return (
    <div className="h-full [perspective:1000px]">
      <div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={{
          transform: `translateY(${translateY}px) rotateX(${t.rx}deg) rotateY(${t.ry}deg)`,
          transition: t.active ? 'transform 120ms ease-out' : 'transform 500ms cubic-bezier(0.22,1,0.36,1)',
        }}
        className={`group/tilt glass-strong relative h-full overflow-hidden rounded-2xl shadow-[0_24px_50px_-24px_rgba(0,0,0,0.7)] [transform-style:preserve-3d] will-change-transform ${className}`}
        {...rest}
      >
        {/* Cursor-tracking specular sheen */}
        <div
          aria-hidden="true"
          style={{ background: `radial-gradient(340px circle at ${t.gx}% ${t.gy}%, ${GLOW[accent] ?? GLOW.cyan}, transparent 60%)` }}
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/tilt:opacity-100"
        />
        {/* Editorial-panel edge: a warm amber top-edge light-catch + a soft
            amber corner glow (the About-panel look) — no cold white, so the
            black body never reads grey. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-2xl [background:linear-gradient(150deg,color-mix(in_oklab,var(--color-neon-cyan)_12%,transparent),transparent_34%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-px rounded-2xl bg-[radial-gradient(360px_circle_at_20%_0%,color-mix(in_oklab,var(--color-neon-cyan)_13%,transparent),transparent_60%)] opacity-60"
        />
        {children}
      </div>
    </div>
  )
}
