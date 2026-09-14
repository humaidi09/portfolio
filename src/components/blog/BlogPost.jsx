import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowUpRight, Clock, Play } from 'lucide-react'
import { Link } from '../../lib/router'
import { api } from '../../lib/api'
import { apps } from '../../data/portfolioData'
import Markdown from './Markdown'

/** "Sep 5, 2026" — or '' for a missing/invalid date. */
function formatDate(value) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

/**
 * A single post detail page at /blog/post/:slug. Fetches by slug from the public
 * API (published only; drafts 404 for visitors) and renders the Markdown body.
 * Sets the document title for the tab / shared link while mounted.
 */
export default function BlogPost({ slug }) {
  const [post, setPost] = useState(null)
  const [status, setStatus] = useState('loading') // loading | ready | notfound

  useEffect(() => {
    let alive = true
    setStatus('loading')
    api
      .getPost(slug)
      .then((data) => {
        if (!alive) return
        setPost(data)
        setStatus('ready')
      })
      .catch(() => {
        if (alive) setStatus('notfound')
      })
    return () => {
      alive = false
    }
  }, [slug])

  useEffect(() => {
    if (!post?.title) return undefined
    const prev = document.title
    document.title = `${post.title} — Hussain Ahmed`
    return () => {
      document.title = prev
    }
  }, [post])

  if (status === 'loading') return <LoadingState />
  if (status === 'notfound' || !post) return <NotFound />

  const date = formatDate(post.publishedAt || post.createdAt)
  // By convention a post's slug matches its project id (see portfolioData `apps`),
  // so a write-up about one of the apps links straight to the live standalone
  // app — derived, never hand-wired.
  const app = apps.find((a) => a.slug === post.slug)

  return (
    <article className="relative mx-auto max-w-3xl px-4 pt-28 pb-20 sm:px-6 md:pt-32">
      <Link
        to="/blog"
        className="inline-flex items-center gap-1.5 font-mono text-xs text-muted transition-colors hover:text-neonCyan"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to the blog
      </Link>

      {post.coverImage ? (
        <img src={post.coverImage} alt="" className="mt-6 w-full rounded-2xl border border-hair" />
      ) : null}

      <div className="mt-6 flex flex-wrap items-center gap-2 font-mono text-xs text-muted">
        {post.category ? <span className="text-neonCyan">{post.category}</span> : null}
        {post.category && date ? <span aria-hidden="true">·</span> : null}
        {date ? <span>{date}</span> : null}
        {post.readingTime ? (
          <>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {post.readingTime} min read
            </span>
          </>
        ) : null}
      </div>

      <h1 className="mt-4 font-display text-4xl font-bold leading-[1.05] tracking-tight text-ink sm:text-5xl">
        {post.title}
      </h1>
      {post.subtitle ? <p className="mt-4 text-lg leading-relaxed text-muted">{post.subtitle}</p> : null}

      {app ? (
        <a
          href={app.url}
          className="group mt-8 flex items-center gap-4 rounded-2xl border border-neonCyan/30 bg-neonCyan/[0.06] p-5 transition-colors hover:border-neonCyan/50 hover:bg-neonCyan/[0.1]"
        >
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-neonCyan text-void">
            <Play className="h-5 w-5 fill-current" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-mono text-[11px] uppercase tracking-wider text-neonCyan">
              Live app
            </span>
            <span className="mt-0.5 block font-display text-lg font-semibold leading-snug text-ink">
              Open {app.title} in your browser
            </span>
            <span className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted">{app.tagline}</span>
          </span>
          <ArrowUpRight className="h-5 w-5 shrink-0 text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-neonCyan" />
        </a>
      ) : null}

      <div className="mt-8">
        <Markdown>{post.content}</Markdown>
      </div>

      {post.tags?.length ? (
        <div className="mt-10 flex flex-wrap gap-2 border-t border-hair pt-6">
          {post.tags.map((t) => (
            <span
              key={t}
              className="rounded-full border border-hair bg-fill px-3 py-1 font-mono text-xs text-muted"
            >
              #{t}
            </span>
          ))}
        </div>
      ) : null}
    </article>
  )
}

function LoadingState() {
  return (
    <div className="relative mx-auto max-w-3xl px-4 pt-32 pb-20 sm:px-6" aria-hidden="true">
      <div className="h-4 w-24 animate-pulse rounded bg-fill" />
      <div className="mt-6 h-10 w-3/4 animate-pulse rounded bg-fill" />
      <div className="mt-4 h-4 w-1/2 animate-pulse rounded bg-fill" />
      <div className="mt-8 aspect-[16/9] w-full animate-pulse rounded-2xl bg-fill" />
    </div>
  )
}

function NotFound() {
  return (
    <section className="relative mx-auto flex min-h-[62vh] max-w-6xl flex-col items-center justify-center px-4 pt-28 pb-16 text-center sm:px-6">
      <p className="font-mono text-sm text-neonCyan">// 404</p>
      <h1 className="mt-3 font-display text-4xl font-bold text-ink sm:text-5xl">Post not found</h1>
      <p className="mt-4 max-w-md leading-relaxed text-muted">
        This post doesn&rsquo;t exist or hasn&rsquo;t been published yet.
      </p>
      <Link
        to="/blog"
        className="mt-8 inline-flex items-center gap-2 rounded-xl bg-neonCyan px-5 py-3 text-sm font-semibold text-void transition-opacity hover:opacity-90"
      >
        &larr; Back to the blog
      </Link>
    </section>
  )
}
