/**
 * A single, page-wide ambient layer: two slow amber glows drifting behind all
 * content, plus the faintest ruled plane. Fixed to the viewport so it shows
 * through every section below the hero (the hero paints its own grid + signal
 * on top). Deliberately low-opacity — atmosphere, not decoration — keyed to the
 * one signal color so it re-themes with light/dark. aria-hidden + GPU-cheap,
 * and completely still under prefers-reduced-motion (the drift animations are
 * frozen by the reduced-motion rule in index.css).
 */
export default function AmbientBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* Warm glow, top-left — the primary signal wash */}
      <div className="absolute -left-[10%] -top-[12%] h-[42rem] w-[42rem] animate-drift rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--color-neon-cyan)_10%,transparent),transparent_60%)] blur-2xl" />
      {/* Bronze companion, bottom-right — drifts on a slower, reversed cycle */}
      <div className="absolute -bottom-[15%] -right-[8%] h-[38rem] w-[38rem] animate-drift-slow rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--color-neon-violet)_8%,transparent),transparent_62%)] blur-2xl" />
      {/* Barely-there ruled plane, faded at the edges so it never boxes in */}
      <div className="absolute inset-0 bg-grid-lines opacity-[0.18] mask-radial-fade" />
    </div>
  )
}
