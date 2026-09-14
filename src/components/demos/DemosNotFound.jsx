import { ArrowLeft } from 'lucide-react'
import { Link } from '../../lib/router'

/** Shown for an unknown /demos/<slug>. Sends visitors back to the hub. */
export default function DemosNotFound() {
  return (
    <div className="mx-auto grid min-h-screen max-w-2xl place-items-center px-4 pb-24 pt-28 text-center">
      <div>
        <p className="font-mono text-sm text-neonCyan">// 404</p>
        <h1 className="mt-3 text-3xl font-semibold text-ink sm:text-4xl">That demo doesn’t exist</h1>
        <p className="mt-3 text-muted">The demo you’re looking for isn’t here — but the others are.</p>
        <Link
          to="/demos"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-neonCyan px-4 py-2 text-sm font-semibold text-void transition-opacity hover:opacity-90"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to all demos
        </Link>
      </div>
    </div>
  )
}
