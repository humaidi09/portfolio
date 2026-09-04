import NetworkCanvas from './NetworkCanvas'

/**
 * A single, page-wide ambient layer: slow amber/bronze glows drifting behind
 * all content, a live "graph network" canvas (drifting nodes, self-rewiring
 * edges, signals traversing them like a pathfinding trace), plus the faintest
 * ruled plane. Fixed to the viewport so it shows through every section below
 * the hero (the hero paints its own grid + signal on top). Keyed to the signal
 * color so it re-themes with light/dark — atmosphere that reads clearly alive
 * without fighting the content. aria-hidden + GPU-light, and completely still
 * under prefers-reduced-motion (the canvas draws one static frame; the glow
 * animations are frozen by the reduced-motion rule in index.css).
 */
export default function AmbientBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* Amber glow, top-left — the primary signal wash */}
      <div className="absolute -left-[10%] -top-[12%] h-[42rem] w-[42rem] animate-drift rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--color-neon-cyan)_18%,transparent),transparent_60%)] blur-2xl" />
      {/* Bronze companion, bottom-right — drifts on a slower, reversed cycle */}
      <div className="absolute -bottom-[15%] -right-[8%] h-[38rem] w-[38rem] animate-drift-slow rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--color-neon-violet)_16%,transparent),transparent_62%)] blur-2xl" />
      {/* Gold aurora, center-right — a third slow wash that breathes */}
      <div className="absolute top-1/3 left-1/2 h-[34rem] w-[34rem] -translate-x-1/4 animate-aurora rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--color-neon-magenta)_14%,transparent),transparent_64%)] blur-2xl" />

      {/* The living graph — drifting nodes, self-rewiring edges, travelling
          signals. Kept quiet (low opacity) so it reads as atmosphere behind the
          content, never competing with it. */}
      <NetworkCanvas className="absolute inset-0 h-full w-full opacity-[0.55]" />

      {/* Barely-there ruled plane, faded at the edges so it never boxes in */}
      <div className="absolute inset-0 bg-grid-lines opacity-[0.14] mask-radial-fade" />
    </div>
  )
}
