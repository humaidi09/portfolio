import { useMemo } from 'react'

/**
 * A single, page-wide ambient layer: slow amber/bronze glows drifting behind
 * all content, a field of rising "signal" particles, plus the faintest ruled
 * plane. Fixed to the viewport so it shows through every section below the hero
 * (the hero paints its own grid + signal on top). Keyed to the signal color so
 * it re-themes with light/dark — atmosphere that reads clearly alive without
 * fighting the content. aria-hidden + GPU-cheap (transform/opacity only), and
 * completely still under prefers-reduced-motion (every animation is frozen by
 * the reduced-motion rule in index.css).
 */

// Pre-plotted particles: fixed left %, size, duration and delay so the field
// looks organic but never re-randomises on re-render. They rise + fade on a
// loop, like slow data drifting up the plane. Durations are kept short enough
// (7–13s) that the motion is genuinely visible, not glacial.
const PARTICLES = [
  { left: 4, size: 4, dur: 10, delay: 0, drift: 3 },
  { left: 10, size: 3, dur: 13, delay: 3, drift: -4 },
  { left: 16, size: 6, dur: 8, delay: 1, drift: 2 },
  { left: 22, size: 3, dur: 12, delay: 5, drift: 5 },
  { left: 28, size: 5, dur: 9, delay: 2, drift: -3 },
  { left: 34, size: 3, dur: 11, delay: 6, drift: 4 },
  { left: 40, size: 7, dur: 7, delay: 0, drift: -2 },
  { left: 46, size: 4, dur: 13, delay: 4, drift: 3 },
  { left: 52, size: 3, dur: 10, delay: 2, drift: -5 },
  { left: 58, size: 6, dur: 8, delay: 5, drift: 2 },
  { left: 64, size: 4, dur: 12, delay: 1, drift: -3 },
  { left: 70, size: 3, dur: 9, delay: 7, drift: 4 },
  { left: 76, size: 5, dur: 11, delay: 3, drift: -2 },
  { left: 82, size: 3, dur: 13, delay: 0, drift: 3 },
  { left: 88, size: 6, dur: 8, delay: 4, drift: -4 },
  { left: 94, size: 4, dur: 10, delay: 6, drift: 2 },
]

export default function AmbientBackground() {
  const particles = useMemo(() => PARTICLES, [])

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* Amber glow, top-left — the primary signal wash */}
      <div className="absolute -left-[10%] -top-[12%] h-[42rem] w-[42rem] animate-drift rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--color-neon-cyan)_20%,transparent),transparent_60%)] blur-2xl" />
      {/* Bronze companion, bottom-right — drifts on a slower, reversed cycle */}
      <div className="absolute -bottom-[15%] -right-[8%] h-[38rem] w-[38rem] animate-drift-slow rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--color-neon-violet)_18%,transparent),transparent_62%)] blur-2xl" />
      {/* Gold aurora, center-right — a third slow wash that breathes so the
          backdrop reads alive on both mobile and desktop */}
      <div className="absolute top-1/3 left-1/2 h-[34rem] w-[34rem] -translate-x-1/4 animate-aurora rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--color-neon-magenta)_15%,transparent),transparent_64%)] blur-2xl" />

      {/* Rising signal particles — glowing dots drifting up the plane */}
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
              boxShadow: '0 0 12px 2px color-mix(in oklab, var(--color-neon-cyan) 80%, transparent)',
            }}
          />
        ))}
      </div>

      {/* Barely-there ruled plane, faded at the edges so it never boxes in */}
      <div className="absolute inset-0 bg-grid-lines opacity-[0.18] mask-radial-fade" />
    </div>
  )
}
