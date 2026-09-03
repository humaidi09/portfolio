import { TrendingUp } from 'lucide-react'
import SectionHeading from './ui/SectionHeading'
import Reveal from './ui/Reveal'
import { api } from '../lib/api'
import { useCollection } from '../hooks/useCollection'

// No static source for results yet — the section simply hides if the API
// returns nothing (and no fallback is bundled).
export default function Results() {
  const { items: results } = useCollection(api.listResults, [])
  if (!results.length) return null

  return (
    <section id="results" className="relative mx-auto max-w-5xl scroll-mt-24 px-4 py-24 sm:px-6 md:py-28">
      <SectionHeading
        index="05"
        eyebrow="// academics"
        title="Semester results"
        kicker="Grade point average per term, straight from the transcript."
      />

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((r) => (
          <Reveal key={r.id || r.term}>
            <div className="glass flex flex-col gap-3 rounded-2xl p-5 transition-colors hover:border-hair-strong">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs text-neonCyan">{r.term}</span>
                <span className="grid h-8 w-8 place-items-center rounded-lg border border-hair bg-fill text-neonCyan">
                  <TrendingUp className="h-4 w-4" />
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-display text-3xl font-semibold text-gradient">{r.gpa}</span>
                {r.scale && <span className="font-mono text-sm text-muted">/ {r.scale}</span>}
              </div>
              {r.note && <p className="text-sm text-muted">{r.note}</p>}
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
