import { useEffect, useState } from 'react'
import { readCache, writeCache } from '../lib/cache'

/**
 * Load a content collection from the API, falling back to a bundled static list
 * if the backend is unreachable or empty (so the site never renders blank).
 *
 *   const { items } = useCollection(api.listExperiences, staticExperiences, 'experiences')
 *
 * `fetcher` is any function returning a promise of an array; `fallback` is the
 * static data used until (or unless) the fetch succeeds with a non-empty array.
 *
 * Pass a stable `key` to enable stale-while-revalidate caching: the last
 * successful DB response is stored in localStorage and used to seed state on the
 * next visit, so returning visitors see the real (admin-managed) content
 * immediately instead of waiting on the API's cold start. The live fetch still
 * runs on mount and replaces it. Cached data is preferred over the bundled
 * fallback because it is fresher; the fallback only shows on a first-ever visit.
 */
export function useCollection(fetcher, fallback = [], key) {
  const [items, setItems] = useState(() => readCache(key) || fallback)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    Promise.resolve(fetcher())
      .then((data) => {
        if (alive && Array.isArray(data) && data.length) {
          setItems(data)
          writeCache(key, data)
        }
      })
      .catch(() => {
        // Keep the cached/static data already in state.
      })
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { items, loading }
}
