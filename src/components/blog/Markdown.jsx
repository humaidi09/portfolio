import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'

/**
 * Renders a post's Markdown body in the site's voice: gold links, display-font
 * headings, dark code surfaces. GitHub-flavoured Markdown (tables, task lists,
 * strikethrough) via remark-gfm. Raw HTML is ignored by default, so post
 * content is safe to render even though it comes from the (single-admin) DB.
 *
 * Inline vs. block code is told apart by content, not by the removed v9 `inline`
 * prop: fenced blocks always carry newlines, inline spans never do.
 */
const components = {
  h1: (p) => <h2 className="mt-10 scroll-mt-24 font-display text-2xl font-bold tracking-tight text-ink" {...p} />,
  h2: (p) => <h2 className="mt-10 scroll-mt-24 font-display text-xl font-bold tracking-tight text-ink" {...p} />,
  h3: (p) => <h3 className="mt-8 scroll-mt-24 font-display text-lg font-semibold text-ink" {...p} />,
  h4: (p) => <h4 className="mt-6 scroll-mt-24 font-semibold text-ink" {...p} />,
  p: (p) => <p className="mt-4 leading-relaxed text-muted" {...p} />,
  a: ({ href, ...p }) => (
    <a
      href={href}
      target={href?.startsWith('http') ? '_blank' : undefined}
      rel={href?.startsWith('http') ? 'noreferrer' : undefined}
      className="text-neonCyan underline decoration-neonCyan/30 underline-offset-2 transition-colors hover:decoration-neonCyan"
      {...p}
    />
  ),
  ul: (p) => <ul className="mt-4 list-disc space-y-1.5 pl-5 text-muted marker:text-neonCyan/60" {...p} />,
  ol: (p) => <ol className="mt-4 list-decimal space-y-1.5 pl-5 text-muted marker:text-muted" {...p} />,
  li: (p) => <li className="leading-relaxed" {...p} />,
  blockquote: (p) => (
    <blockquote className="mt-5 border-l-2 border-neonCyan/50 bg-fill/40 py-1 pl-4 text-ink/80 italic" {...p} />
  ),
  hr: () => <hr className="my-9 border-hair" />,
  img: ({ src, alt }) => (
    <img src={src} alt={alt || ''} loading="lazy" className="mt-6 w-full rounded-xl border border-hair" />
  ),
  pre: (p) => (
    <pre
      className="mt-5 overflow-x-auto rounded-xl border border-hair bg-void/70 p-4 text-sm leading-relaxed text-ink/90"
      {...p}
    />
  ),
  code: ({ className, children, ...props }) => {
    const isBlock = /language-/.test(className || '') || String(children).includes('\n')
    if (isBlock) {
      return (
        <code className={`font-mono text-[0.85em] ${className || ''}`} {...props}>
          {children}
        </code>
      )
    }
    return (
      <code className="rounded-md border border-hair bg-fill px-1.5 py-0.5 font-mono text-[0.85em] text-neonCyan">
        {children}
      </code>
    )
  },
  table: (p) => (
    <div className="mt-5 overflow-x-auto">
      <table className="w-full border-collapse text-sm" {...p} />
    </div>
  ),
  th: (p) => <th className="border border-hair bg-fill px-3 py-2 text-left font-semibold text-ink" {...p} />,
  td: (p) => <td className="border border-hair px-3 py-2 text-muted" {...p} />,
}

export default function Markdown({ children }) {
  return (
    <div className="text-[15px]">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSlug]} components={components}>
        {children || ''}
      </ReactMarkdown>
    </div>
  )
}
