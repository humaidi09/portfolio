import { useEffect, useState } from 'react'

/**
 * Load a content collection from the API, falling back to a bundled static list
 * if the backend is unreachable or empty (so the site never renders blank).
 *
 *   const { items } = useCollection(api.listExperiences, staticExperiences)
 *
 * `fetcher` is any function returning a promise of an array; `fallback` is the
 * static data used until (or unless) the fetch succeeds with a non-empty array.
 */
export function useCollection(fetcher, fallback = []) {
  const [items, setItems] = useState(fallback)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    Promise.resolve(fetcher())
      .then((data) => {
        if (alive && Array.isArray(data) && data.length) setItems(data)
      })
      .catch(() => {
        // Keep the static fallback already in state.
      })
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { items, loading }
}
