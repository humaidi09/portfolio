import { useRoute, Link } from '../../lib/router'
import Blog from './Blog'
import BlogPost from './BlogPost'

/**
 * Client-side router for the /blog subtree. The site's top-level branch (in
 * App.jsx) hands off here whenever the path starts with /blog. The index and
 * post detail pages (/blog/post/:slug) are wired up; /blog/video/:slug and
 * /blog/photo/:slug arrive with the media phases. Unknown paths render a
 * friendly 404 rather than crashing.
 */
export default function BlogApp() {
  const pathname = useRoute()
  const segs = pathname.replace(/\/+$/, '').split('/').filter(Boolean) // ['blog', 'post', 'slug']

  if (segs.length === 1) return <Blog />
  if (segs[1] === 'post' && segs[2]) return <BlogPost slug={decodeURIComponent(segs[2])} />

  return <BlogNotFound />
}

function BlogNotFound() {
  return (
    <section className="relative mx-auto flex min-h-[62vh] max-w-6xl flex-col items-center justify-center px-4 pt-28 pb-16 text-center sm:px-6">
      <p className="font-mono text-sm text-neonCyan">// 404</p>
      <h1 className="mt-3 font-display text-4xl font-bold text-ink sm:text-5xl">Nothing here yet</h1>
      <p className="mt-4 max-w-md leading-relaxed text-muted">
        This page doesn&rsquo;t exist or hasn&rsquo;t been published. Head back to the blog to see
        what&rsquo;s live.
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
