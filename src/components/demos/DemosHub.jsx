import { ArrowRight } from 'lucide-react'
import { Link } from '../../lib/router'
import { DEMOS } from './registry'

/**
 * The /demos landing — a grid of one card per project. Each card is a single
 * clickable Link into that demo's own page (`/demos/<slug>`), so the six demos
 * are genuinely separate pages, not tabs. Purely registry-driven: a new demo
 * appears here the moment it's added to registry.js.
 */
export default function DemosHub() {
  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-dot-grid opacity-60 mask-radial-fade" aria-hidden="true" />

      <div className="mx-auto max-w-6xl px-4 pb-24 pt-28 sm:px-6 sm:pt-32">
        {/* Header */}
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-neonCyan/25 bg-neonCyan/[0.06] py-1 pl-2 pr-3">
            <span className="grid h-5 min-w-5 place-items-center rounded-full bg-neonCyan/15 px-1 font-mono text-[11px] font-semibold text-neonCyan">
              {DEMOS.length}
            </span>
            <span className="font-mono text-xs font-medium tracking-wide text-ink/80">live demos</span>
          </span>
          <h1 className="mt-4 text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-4xl md:text-[3rem] md:leading-[1.05]">
            Run the projects, right here
          </h1>
          <p className="mt-4 leading-relaxed text-muted">
            Each project below is real, working software. These are faithful in-browser ports of that same
            logic — solve a Sudoku, simulate the World Cup, post to a ledger — running live, with no install.
            The source and a full write-up are one click away on every page.
          </p>
        </div>

        {/* Grid */}
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {DEMOS.map((d) => {
            const Icon = d.icon
            return (
              <Link
                key={d.slug}
                to={`/demos/${d.slug}`}
                className="group glass tilt-card flex flex-col rounded-2xl border border-hair p-5 transition-colors hover:border-neonCyan/40"
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-hair bg-fill text-neonCyan transition-colors group-hover:border-neonCyan/40">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h2 className="text-lg font-semibold text-ink">{d.title}</h2>
                </div>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{d.tagline}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {d.tech.map((t) => (
                    <span key={t} className="rounded-full border border-hair bg-fill px-2 py-0.5 font-mono text-[10px] text-muted">
                      {t}
                    </span>
                  ))}
                </div>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-neonCyan">
                  Open demo
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
