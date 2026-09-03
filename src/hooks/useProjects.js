import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { projects as staticProjects } from '../data/portfolioData'

/**
 * Load projects from the API, falling back to the bundled static list if the
 * backend is unreachable (so the site never renders an empty Projects section).
 *
 * The API returns each project with a `slug` (the old static `id`) plus a Mongo
 * `id`. Static entries only have `id`. We expose a `key` on every project that
 * matches the CODE_PREVIEWS map either way.
 */
export function useProjects() {
  const [projects, setProjects] = useState(staticProjects.map(withKey))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    api
      .listProjects()
      .then((data) => {
        if (alive && Array.isArray(data) && data.length) {
          setProjects(data.map(withKey))
        }
      })
      .catch(() => {
        // Keep the static fallback already in state.
      })
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [])

  return { projects, loading }
}

function withKey(p) {
  return { ...p, key: p.slug || p.id }
}
