import { ArrowUpRight, GraduationCap, Landmark, Puzzle, ShieldCheck, Trophy, UtensilsCrossed } from 'lucide-react'
import { apps } from '../data/portfolioData'

// One lucide mark per app, keyed by slug. Kept here (not in portfolioData) so the
// data stays plain and serialisable while the hub owns its presentation.
const ICONS = {
  nonet: Puzzle,
  'world-cup-2026': Trophy,
  'banking-system': Landmark,
  'auth-system': ShieldCheck,
  'restaurant-management': UtensilsCrossed,
  'cgpa-calculator': GraduationCap,
}

/**
 * The /apps landing — a gallery of the six standalone apps. Each is its own
 * Vite build served at its own URL, so every card is a real navigation (a plain
 * <a>, full load), not a client route. Driven entirely by the `apps` list in
 * portfolioData, so the hub stays in lockstep with the project and blog links.
 */
export default function AppsHub() {
  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-dot-grid opacity-60 mask-radial-fade" aria-hidden="true" />

      <div className="mx-auto max-w-6xl px-4 pb-24 pt-28 sm:px-6 sm:pt-32">
        {/* Header */}
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-neonCyan/25 bg-neonCyan/[0.06] py-1 pl-2 pr-3">
            <span className="grid h-5 min-w-5 place-items-center rounded-full bg-neonCyan/15 px-1 font-mono text-[11px] font-semibold text-neonCyan">
              {apps.length}
            </span>
            <span className="font-mono text-xs font-medium tracking-wide text-ink/80">apps to run</span>
          </span>
          <h1 className="mt-4 text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-4xl md:text-[3rem] md:leading-[1.05]">
            Six apps, not screenshots
          </h1>
          <p className="mt-4 leading-relaxed text-muted">
            Each one is a full standalone app with its own URL — the same engineering as the projects, running live in
            your browser. Solve a Sudoku, simulate the World Cup, post to a ledger, or plan your CGPA. No install, no sign-up.
          </p>
        </div>

        {/* Grid — every app opens at its own URL (full load) */}
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {apps.map((app) => {
            const Icon = ICONS[app.slug] ?? Puzzle
            return (
              <a
                key={app.slug}
                href={app.url}
                className="group glass tilt-card flex flex-col rounded-2xl border border-hair p-5 transition-colors hover:border-neonCyan/40"
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-hair bg-fill text-neonCyan transition-colors group-hover:border-neonCyan/40">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h2 className="text-lg font-semibold text-ink">{app.title}</h2>
                </div>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{app.tagline}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {app.tech.map((t) => (
                    <span key={t} className="rounded-full border border-hair bg-fill px-2 py-0.5 font-mono text-[10px] text-muted">
                      {t}
                    </span>
                  ))}
                </div>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-neonCyan">
                  Open the app
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </span>
              </a>
            )
          })}
        </div>
      </div>
    </div>
  )
}
