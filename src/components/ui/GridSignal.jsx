import { useMemo } from 'react'
import { useReducedMotion } from 'framer-motion'

/**
 * The site's signature motion: an amber "signal" that routes across the
 * graph-paper plane along an orthogonal (Manhattan) path — a competitive
 * programmer's pathfinding trace, not a generic floating blob. Pure SVG +
 * SMIL/CSS, GPU-cheap, and fully still under prefers-reduced-motion.
 *
 * Snaps to a 44px lattice so the route lands exactly on the CSS grid lines
 * drawn by `.bg-grid-lines`. Decorative only — aria-hidden.
 */

const CELL = 44

// A few pre-plotted Manhattan routes on the lattice (grid coords, not px).
// Each is a short journey with 2–4 turns — reads like a solved path.
const ROUTES = [
  {
    nodes: [
      [0, 3], [4, 3], [4, 7], [9, 7], [9, 2], [14, 2],
    ],
    dur: 9,
    delay: 0,
  },
  {
    nodes: [
      [16, 9], [16, 5], [11, 5], [11, 10], [5, 10],
    ],
    dur: 11,
    delay: 2.4,
  },
]

/** Grid coords → an orthogonal SVG path string + its total length. */
function buildPath(nodes) {
  let d = ''
  let length = 0
  nodes.forEach(([gx, gy], i) => {
    const x = gx * CELL
    const y = gy * CELL
    if (i === 0) {
      d = `M ${x} ${y}`
    } else {
      d += ` L ${x} ${y}`
      const [px, py] = nodes[i - 1]
      length += (Math.abs(gx - px) + Math.abs(gy - py)) * CELL
    }
  })
  return { d, length, nodes }
}

export default function GridSignal({ className = '' }) {
  const reduce = useReducedMotion()
  const routes = useMemo(() => ROUTES.map((r) => ({ ...r, ...buildPath(r.nodes) })), [])

  return (
    <svg
      aria-hidden="true"
      className={className}
      width="100%"
      height="100%"
      viewBox="0 0 704 484"
      fill="none"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <radialGradient id="signal-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--color-neon-cyan)" stopOpacity="0.9" />
          <stop offset="100%" stopColor="var(--color-neon-cyan)" stopOpacity="0" />
        </radialGradient>
      </defs>

      {routes.map((route, i) => (
        <g key={i}>
          {/* Faint full route — the "explored" trail */}
          <path
            d={route.d}
            stroke="var(--color-neon-cyan)"
            strokeWidth="1.5"
            strokeOpacity="0.14"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Turn markers — small nodes where the route bends */}
          {route.nodes.map(([gx, gy], j) => (
            <circle
              key={j}
              cx={gx * CELL}
              cy={gy * CELL}
              r="2.5"
              fill="var(--color-neon-cyan)"
              fillOpacity="0.22"
            />
          ))}

          {/* The travelling signal: a bright dash sweeping the route */}
          {!reduce && (
            <>
              <path
                d={route.d}
                stroke="var(--color-neon-cyan)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={`54 ${route.length}`}
                strokeDashoffset={route.length}
              >
                <animate
                  attributeName="stroke-dashoffset"
                  from={route.length}
                  to={-54}
                  dur={`${route.dur}s`}
                  begin={`${route.delay}s`}
                  repeatCount="indefinite"
                />
              </path>

              {/* Glowing head that rides the same path */}
              <circle r="9" fill="url(#signal-glow)">
                <animateMotion
                  path={route.d}
                  dur={`${route.dur}s`}
                  begin={`${route.delay}s`}
                  repeatCount="indefinite"
                  keyPoints="0;1"
                  keyTimes="0;1"
                  calcMode="linear"
                />
              </circle>
              <circle r="2.5" fill="var(--color-neon-cyan)">
                <animateMotion
                  path={route.d}
                  dur={`${route.dur}s`}
                  begin={`${route.delay}s`}
                  repeatCount="indefinite"
                  keyPoints="0;1"
                  keyTimes="0;1"
                  calcMode="linear"
                />
              </circle>
            </>
          )}
        </g>
      ))}
    </svg>
  )
}
