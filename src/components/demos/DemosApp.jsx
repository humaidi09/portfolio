import { lazy, Suspense } from 'react'
import { useRoute } from '../../lib/router'
import { DEMOS, getDemo } from './registry'
import DemoShell from './DemoShell'
import DemosHub from './DemosHub'
import DemosNotFound from './DemosNotFound'

/**
 * Client-side router for the /demos subtree — mirrors BlogApp. `/demos` shows
 * the hub; `/demos/<slug>` lazy-loads that demo (one code-split chunk each,
 * fetched only when opened) inside the shared DemoShell. Deep links resolve
 * because vercel.json rewrites everything to index.html and App branches on the
 * path.
 */

// One lazy component per demo, built once at module load.
const LAZY = Object.fromEntries(DEMOS.map((d) => [d.slug, lazy(d.load)]))

function Loading() {
  return (
    <div className="grid min-h-[45vh] place-items-center">
      <div className="flex items-center gap-3 font-mono text-sm text-muted">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-hair border-t-neonCyan" />
        loading demo…
      </div>
    </div>
  )
}

export default function DemosApp() {
  const pathname = useRoute()
  const segs = pathname.replace(/\/+$/, '').split('/').filter(Boolean) // ['demos', slug?]

  if (segs.length === 1) return <DemosHub />

  const slug = decodeURIComponent(segs[1])
  const demo = getDemo(slug)
  const Cmp = LAZY[slug]
  if (!demo || !Cmp) return <DemosNotFound />

  return (
    <DemoShell demo={demo}>
      <Suspense fallback={<Loading />}>
        <Cmp />
      </Suspense>
    </DemoShell>
  )
}
