import { ArrowLeft, ArrowUpRight, BookOpen } from 'lucide-react'
import { GithubIcon } from '../ui/BrandIcons'
import { Link } from '../../lib/router'

/**
 * The frame every live demo renders inside. It supplies the consistent chrome —
 * back-to-hub link, the eyebrow/title/tagline header, and the "view source /
 * read the write-up" links — so each demo component only has to build its own
 * interactive body. Keeps the six demos visually of a piece with each other and
 * with the rest of the site (amber pill header, black glass, warm ink).
 */
export default function DemoShell({ demo, children }) {
  return (
    <div className="relative min-h-screen">
      {/* Faint graph-paper wash, masked so it fades at the edges. */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid-lines opacity-[0.35] mask-radial-fade" aria-hidden="true" />

      <div className="mx-auto max-w-5xl px-4 pb-24 pt-28 sm:px-6 sm:pt-32">
        {/* Breadcrumb / back */}
        <div className="flex items-center gap-2 text-sm">
          <Link
            to="/demos"
            className="inline-flex items-center gap-1.5 rounded-lg border border-hair bg-fill px-3 py-1.5 text-muted transition-colors hover:border-neonCyan/45 hover:text-neonCyan"
          >
            <ArrowLeft className="h-4 w-4" />
            All demos
          </Link>
        </div>

        {/* Header */}
        <header className="mt-6">
          <span className="inline-flex flex-wrap items-center gap-2 rounded-full border border-neonCyan/25 bg-neonCyan/[0.06] py-1 pl-2 pr-3">
            <span className="grid h-5 place-items-center rounded-full bg-neonCyan/15 px-2 font-mono text-[10px] font-semibold uppercase tracking-wider text-neonCyan">
              Live demo
            </span>
            <span className="font-mono text-xs text-ink/80">{demo.tech.join(' · ')}</span>
          </span>

          <h1 className="mt-4 text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-4xl md:text-[3rem] md:leading-[1.05]">
            {demo.title}
          </h1>
          <p className="mt-4 max-w-2xl leading-relaxed text-muted">{demo.tagline}</p>

          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            <a
              href={demo.repo}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-hair bg-fill px-3.5 py-2 text-sm text-ink transition-colors hover:border-neonCyan/45 hover:text-neonCyan"
            >
              <GithubIcon className="h-4 w-4" />
              View source
              <ArrowUpRight className="h-3.5 w-3.5 text-muted" />
            </a>
            <Link
              to={`/blog/post/${demo.blogSlug}`}
              className="inline-flex items-center gap-2 rounded-lg border border-hair bg-fill px-3.5 py-2 text-sm text-ink transition-colors hover:border-neonCyan/45 hover:text-neonCyan"
            >
              <BookOpen className="h-4 w-4" />
              Read the write-up
            </Link>
          </div>
        </header>

        <div className="rule-gradient mt-8" />

        {/* The demo itself */}
        <div className="mt-8">{children}</div>

        {/* Footer note */}
        <p className="mt-14 border-t border-hair pt-6 text-center font-mono text-xs leading-relaxed text-muted/70">
          <span className="text-neonCyan/70">// </span>
          This runs a faithful port of the real project logic, entirely in your browser — nothing is sent to a server.
        </p>
      </div>
    </div>
  )
}
