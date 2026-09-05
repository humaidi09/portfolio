import { Link } from '../../lib/router'
import { Clock } from 'lucide-react'

/** "Sep 5, 2026" — or '' for a missing/invalid date. */
function formatDate(value) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

/** A single post in the blog grid → links to its detail page at /blog/post/:slug. */
export default function PostCard({ post }) {
  const date = formatDate(post.publishedAt || post.createdAt)
  return (
    <li className="group">
      <Link
        to={`/blog/post/${post.slug}`}
        className="flex h-full flex-col overflow-hidden rounded-2xl border border-hair bg-fill/40 transition-colors hover:border-neonCyan/40"
      >
        {post.coverImage ? (
          <div className="aspect-[16/9] overflow-hidden border-b border-hair">
            <img
              src={post.coverImage}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          </div>
        ) : null}
        <div className="flex flex-1 flex-col p-5">
          <div className="flex items-center gap-2 font-mono text-[11px] text-muted">
            {post.category ? <span className="text-neonCyan">{post.category}</span> : null}
            {post.category && date ? <span aria-hidden="true">·</span> : null}
            {date ? <span>{date}</span> : null}
          </div>
          <h3 className="mt-2 font-display text-lg font-semibold leading-snug text-ink">{post.title}</h3>
          {post.excerpt ? (
            <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">{post.excerpt}</p>
          ) : null}
          <div className="mt-auto flex items-center gap-3 pt-4 font-mono text-[11px] text-muted">
            {post.readingTime ? (
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {post.readingTime} min read
              </span>
            ) : null}
            {post.tags?.length ? (
              <span className="truncate">
                {post.tags.slice(0, 3).map((t) => `#${t}`).join(' ')}
              </span>
            ) : null}
          </div>
        </div>
      </Link>
    </li>
  )
}
