import { useEffect, useState } from 'react'
import { ArrowLeft, Clock } from 'lucide-react'
import { Link } from '../../lib/router'
import { api } from '../../lib/api'
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
