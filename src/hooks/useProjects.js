import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { projects as staticProjects } from '../data/portfolioData'

// Projects that must always appear even when the API list omits them — the live
// in-house apps that aren't stored in the projects database (e.g. Nonet). Merged
// in by key, ahead of the API list, so the flagship app leads the grid.
const PINNED = staticProjects.filter((p) => p.alwaysShow)

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
          // Keep the pinned in-house apps present and first, even though the DB
          // doesn't know about them; drop any API duplicate by key.
          const pinnedKeys = new Set(PINNED.map((p) => p.id))
          const rest = data.filter((p) => !pinnedKeys.has(p.slug || p.id))
          setProjects([...PINNED, ...rest].map(withKey))
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
