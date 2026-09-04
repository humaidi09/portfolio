import { useMemo } from 'react'

/**
 * A single, page-wide ambient layer: slow amber/bronze glows drifting behind
 * all content, a field of faint rising "signal" particles, plus the faintest
 * ruled plane. Fixed to the viewport so it shows through every section below
 * the hero (the hero paints its own grid + signal on top). Keyed to the signal
 * color so it re-themes with light/dark, and kept low-opacity — atmosphere, not
 * decoration. aria-hidden + GPU-cheap (transform/opacity only), and completely
 * still under prefers-reduced-motion (every animation is frozen by the
 * reduced-motion rule in index.css).
 */

// Pre-plotted particles: fixed left %, size, duration and delay so the field
// looks organic but never re-randomises on re-render. They rise + fade on a
// loop, like slow data drifting up the plane.
const PARTICLES = [
  { left: 6, size: 3, dur: 17, delay: 0, drift: 3 },
  { left: 14, size: 2, dur: 21, delay: 5, drift: -4 },
  { left: 23, size: 4, dur: 15, delay: 2, drift: 2 },
  { left: 31, size: 2, dur: 24, delay: 8, drift: 5 },
  { left: 39, size: 3, dur: 19, delay: 3, drift: -3 },
  { left: 48, size: 2, dur: 22, delay: 11, drift: 4 },
  { left: 56, size: 5, dur: 16, delay: 1, drift: -2 },
  { left: 64, size: 2, dur: 25, delay: 6, drift: 3 },
  { left: 72, size: 3, dur: 18, delay: 9, drift: -5 },
  { left: 80, size: 2, dur: 23, delay: 4, drift: 2 },
  { left: 88, size: 4, dur: 20, delay: 7, drift: -3 },
  { left: 94, size: 2, dur: 26, delay: 12, drift: 4 },
]

export default function AmbientBackground() {
  const particles = useMemo(() => PARTICLES, [])

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* Amber glow, top-left — the primary signal wash */}
      <div className="absolute -left-[10%] -top-[12%] h-[42rem] w-[42rem] animate-drift rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--color-neon-cyan)_14%,transparent),transparent_60%)] blur-2xl" />
      {/* Bronze companion, bottom-right — drifts on a slower, reversed cycle */}
      <div className="absolute -bottom-[15%] -right-[8%] h-[38rem] w-[38rem] animate-drift-slow rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--color-neon-violet)_12%,transparent),transparent_62%)] blur-2xl" />
      {/* Gold aurora, center-right — a third slow wash that breathes so the
          backdrop reads alive on both mobile and desktop */}
      <div className="absolute top-1/3 left-1/2 h-[34rem] w-[34rem] -translate-x-1/4 animate-aurora rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--color-neon-magenta)_10%,transparent),transparent_64%)] blur-2xl" />

      {/* Rising signal particles — slow glowing dots drifting up the plane */}
      <div className="absolute inset-0">
        {particles.map((p, i) => (
          <span
            key={i}
            className="animate-rise absolute bottom-0 rounded-full bg-neonCyan"
            style={{
              left: `${p.left}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              '--drift': `${p.drift}rem`,
              animationDuration: `${p.dur}s`,
              animationDelay: `${p.delay}s`,
              boxShadow: '0 0 8px 1px color-mix(in oklab, var(--color-neon-cyan) 60%, transparent)',
            }}
          />
        ))}
      </div>

      {/* Barely-there ruled plane, faded at the edges so it never boxes in */}
      <div className="absolute inset-0 bg-grid-lines opacity-[0.18] mask-radial-fade" />
    </div>
  )
}
