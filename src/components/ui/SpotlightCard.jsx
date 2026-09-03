import { useRef } from 'react'

const GLOW = {
  cyan: 'rgba(242, 180, 61, 0.16)',
  violet: 'rgba(207, 144, 56, 0.16)',
  magenta: 'rgba(246, 209, 140, 0.16)',
}

/**
 * The site's signature interaction: a frosted glass card with a soft glow
 * that tracks the cursor. Position is written to CSS variables (no re-render).
 */
export default function SpotlightCard({
  accent = 'cyan',
  className = '',
  children,
  ...rest
}) {
  const ref = useRef(null)

  const handleMove = (e) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    el.style.setProperty('--mx', `${e.clientX - r.left}px`)
    el.style.setProperty('--my', `${e.clientY - r.top}px`)
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      className={`group/spot glass relative overflow-hidden rounded-2xl transition-colors duration-300 hover:border-hair-strong ${className}`}
      {...rest}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 group-hover/spot:opacity-100"
        style={{
          background: `radial-gradient(340px circle at var(--mx, 50%) var(--my, 0%), ${GLOW[accent] ?? GLOW.cyan}, transparent 65%)`,
        }}
      />
      <div className="relative h-full">{children}</div>
    </div>
  )
}
