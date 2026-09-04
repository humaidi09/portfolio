import NetworkCanvas from './NetworkCanvas'

/**
 * A single, page-wide ambient layer that stays out of the way: a near-black
 * field with a barely-there live "graph network" (drifting nodes, self-rewiring
 * edges, a few travelling signals) shimmering faintly inside it, plus the
 * faintest ruled plane. No coloured glow washes — the flat dark matches the
 * card surfaces so the page reads cohesive, and the amber lives in the content
 * (buttons, headings, stats), not the backdrop. Fixed to the viewport so it
 * shows through every section. aria-hidden + GPU-light, and completely still
 * under prefers-reduced-motion (the canvas draws one static frame).
 */
export default function AmbientBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* The living graph — a faint amber shimmer, the only colour in the
          black. Kept low so it reads as a slight golden glow, not a wash. */}
      <NetworkCanvas className="absolute inset-0 h-full w-full opacity-45" />
    </div>
  )
}
