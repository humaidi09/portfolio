import { useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { FileText, Image as ImageIcon, LayoutGrid, Search, Video } from 'lucide-react'
import { api } from '../../lib/api'
import { useCollection } from '../../hooks/useCollection'
import PostCard from './PostCard'

const TABS = [
  { id: 'all', label: 'All', Icon: LayoutGrid },
  { id: 'videos', label: 'Videos', Icon: Video },
  { id: 'posts', label: 'Posts', Icon: FileText },
  { id: 'photos', label: 'Photos', Icon: ImageIcon },
]

/** Case-insensitive substring match across a few text fields + tags. */
function matches(item, q) {
  if (!q) return true
  const hay = [item.title, item.subtitle, item.excerpt, item.caption, item.description, ...(item.tags || [])]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  return hay.includes(q)
}

/**
 * The public blog index. Hero + filter tabs + search over the three content
 * types (posts, videos, photos). Content is DB-backed via the public API
 * readers; when nothing is published yet, honest empty states show — no
 * fabricated posts. Per-type cards and detail pages arrive in later phases.
 */
export default function Blog() {
  const reduce = useReducedMotion()
  const [tab, setTab] = useState('all')
  const [query, setQuery] = useState('')

  const { items: posts, loading: lPosts } = useCollection(api.listPosts, [])
  const { items: videos, loading: lVideos } = useCollection(api.listVideos, [])
  const { items: photos, loading: lPhotos } = useCollection(api.listPhotos, [])
  const loading = lPosts || lVideos || lPhotos

  const q = query.trim().toLowerCase()
  const filtered = useMemo(
    () => ({
      posts: posts.filter((p) => matches(p, q)),
      videos: videos.filter((v) => matches(v, q)),
      photos: photos.filter((p) => matches(p, q)),
    }),
    [posts, videos, photos, q],
  )

  const counts = {
    all: filtered.posts.length + filtered.videos.length + filtered.photos.length,
    posts: filtered.posts.length,
    videos: filtered.videos.length,
    photos: filtered.photos.length,
  }

  const activeCount = counts[tab]

  return (
    <div className="relative">
      {/* ---- Hero ---- */}
      <section className="relative mx-auto max-w-6xl px-4 pt-28 pb-8 sm:px-6 md:pt-32 md:pb-10">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-hair bg-fill px-3 py-1 font-mono text-xs text-neonCyan">
            <span className="h-1.5 w-1.5 rounded-full bg-neonCyan" />
            // blog
          </span>
          <h1 className="mt-5 font-display text-5xl font-bold leading-[1.02] tracking-[-0.03em] text-ink sm:text-6xl md:text-7xl">
            Blog
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            Thoughts, tutorials, projects, events and moments.
          </p>
        </motion.div>
      </section>

      {/* ---- Filter tabs + search ---- */}
      <section className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col gap-3 border-b border-hair pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter blog content">
            {TABS.map(({ id, label, Icon }) => {
              const isActive = tab === id
              const n = counts[id]
              return (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setTab(id)}
                  className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'border-neonCyan bg-neonCyan text-void'
                      : 'border-hair bg-fill text-muted hover:border-neonCyan/40 hover:text-ink'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                  {n > 0 && (
                    <span
                      className={`rounded-full px-1.5 py-0.5 font-mono text-[10px] leading-none ${
                        isActive ? 'bg-void/15 text-void' : 'bg-hair text-muted'
                      }`}
                    >
                      {n}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          <label className="relative block w-full sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search the blog…"
              aria-label="Search the blog"
              className="w-full rounded-xl border border-hair bg-fill py-2 pl-9 pr-3 text-sm text-ink placeholder:text-muted/60 outline-none transition-colors focus:border-neonCyan/50 focus:bg-fill-2"
            />
          </label>
        </div>
      </section>

      {/* ---- Content ---- */}
      <section className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14">
        {loading ? (
          <LoadingState />
        ) : activeCount === 0 ? (
          <EmptyState tab={tab} query={q} />
        ) : (
          <Results tab={tab} filtered={filtered} />
        )}
      </section>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="glass h-56 animate-pulse rounded-2xl" />
      ))}
    </div>
  )
}

const EMPTY_COPY = {
  all: {
    Icon: LayoutGrid,
    title: 'Nothing published yet',
    text: 'New posts, videos, and photos will show up here as soon as they go live.',
  },
  posts: {
    Icon: FileText,
    title: 'No posts yet',
    text: 'Written pieces — tutorials, notes, and project write-ups — will appear here once published.',
  },
  videos: {
    Icon: Video,
    title: 'No videos yet',
    text: 'Recorded walkthroughs and clips will appear here once published.',
  },
  photos: {
    Icon: ImageIcon,
    title: 'No photos yet',
    text: 'Snapshots from events and moments will appear here once published.',
  },
}

function EmptyState({ tab, query }) {
  const { Icon, title, text } = EMPTY_COPY[tab] ?? EMPTY_COPY.all
  const searching = Boolean(query)
  return (
    <div className="glass mx-auto flex max-w-md flex-col items-center rounded-2xl px-6 py-14 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl border border-hair bg-fill text-neonCyan">
        <Icon className="h-6 w-6" />
      </span>
      <h2 className="mt-5 font-display text-xl font-semibold text-ink">
        {searching ? 'No results found' : title}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        {searching ? (
          <>
            Nothing matched &ldquo;<span className="text-ink">{query}</span>&rdquo;. Try a different
            search.
          </>
        ) : (
          text
        )}
      </p>
    </div>
  )
}

/**
 * Results grid. Posts render as full PostCards linking to their detail pages;
 * videos and photos get a minimal placeholder card until their media phases add
 * dedicated cards + detail pages. On the "all" tab each type gets a heading.
 */
function Results({ tab, filtered }) {
  const show = {
    posts: tab === 'all' || tab === 'posts',
    videos: tab === 'all' || tab === 'videos',
    photos: tab === 'all' || tab === 'photos',
  }
  const withHeading = tab === 'all'

  return (
    <div className="space-y-12">
      {show.posts && filtered.posts.length > 0 && (
        <div>
          {withHeading && <h2 className="mb-4 font-display text-lg font-semibold text-ink">Posts</h2>}
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.posts.map((post) => (
              <PostCard key={post.id || post.slug} post={post} />
            ))}
          </ul>
        </div>
      )}

      {[
        ['videos', 'Videos'],
        ['photos', 'Photos'],
      ].map(([key, label]) => {
        const items = filtered[key]
        if (!show[key] || !items.length) return null
        return (
          <div key={key}>
            {withHeading && <h2 className="mb-4 font-display text-lg font-semibold text-ink">{label}</h2>}
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <li key={item.id || item.slug} className="glass rounded-2xl p-5">
                  <p className="font-display text-base font-semibold text-ink">{item.title}</p>
                  {(item.caption || item.description) && (
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">
                      {item.caption || item.description}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </div>
  )
}
