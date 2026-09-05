import { useSyncExternalStore } from 'react'

/**
 * A tiny history-based router — no dependency. The site is a single scroll page
 * plus /admin and the /blog subtree. This powers client-side navigation *within*
 * /blog (list ⇆ detail, back button); crossing between home and /blog is left as
 * a normal full load. Deep links like /blog/post/:slug still resolve because
 * vercel.json rewrites everything to index.html and App branches on the path.
 */

// pushState/replaceState don't emit popstate, so we fire our own event that
// useRoute() also listens for.
const EVT = 'locationchange'

export function navigate(to, { replace = false } = {}) {
  const here = window.location.pathname + window.location.search + window.location.hash
  if (to === here) return
  window.history[replace ? 'replaceState' : 'pushState']({}, '', to)
  window.dispatchEvent(new Event(EVT))
  window.scrollTo(0, 0)
}

function subscribe(cb) {
  window.addEventListener('popstate', cb)
  window.addEventListener(EVT, cb)
  return () => {
    window.removeEventListener('popstate', cb)
    window.removeEventListener(EVT, cb)
  }
}

/** Current pathname; re-renders the caller whenever it changes. */
export function useRoute() {
  return useSyncExternalStore(
    subscribe,
    () => window.location.pathname,
    () => '/',
  )
}

/**
 * Anchor that navigates client-side for internal paths. Falls back to normal
 * browser behaviour for modified clicks (new tab), non-left buttons, target
 * _blank, and external URLs.
 */
export function Link({ to, children, className, onClick, ...rest }) {
  const handle = (e) => {
    onClick?.(e)
    const external = /^https?:\/\//.test(to) || rest.target === '_blank'
    if (
      e.defaultPrevented ||
      e.button !== 0 ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey ||
      external
    ) {
      return
    }
    e.preventDefault()
    navigate(to)
  }
  return (
    <a href={to} onClick={handle} className={className} {...rest}>
      {children}
    </a>
  )
}
