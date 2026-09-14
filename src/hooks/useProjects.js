import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { readCache, writeCache } from '../lib/cache'
import { projects as staticProjects } from '../data/portfolioData'

// Bundled static entries indexed by slug/id, used to backfill fields a DB doc
// may not carry yet (liveUrl / alwaysShow before a re-seed) so the live in-house
// app links never disappear from the grid.
const STATIC_BY_KEY = new Map(staticProjects.map((p) => [p.id, p]))

/**
 * Load projects from the API — the source of truth managed from /admin — and
 * fall back to the bundled static list if the backend is unreachable (so the
 * site never renders an empty Projects section).
 *
 * Each API project has a `slug` (the old static `id`) plus a Mongo `id`; static
 * entries only have `id`. We expose a `key` on every project that matches the
 * CODE_PREVIEWS map either way. The always-show apps (the six standalone builds)
 * are floated to the front so the flagship apps lead the grid.
 */
export function useProjects() {
  // Seed from the last DB response (already merged/sorted) so a returning visitor
  // sees the real grid instantly while the API cold-starts; fall back to the
  // bundled static list on a first-ever visit.
  const [projects, setProjects] = useState(() => readCache('projects') || staticProjects.map(withKey))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    api
      .listProjects()
      .then((data) => {
        if (!alive || !Array.isArray(data) || !data.length) return
        // Backfill liveUrl/alwaysShow from the bundled static entry by slug when
        // a doc predates those fields, then float always-show apps to the front.
        // Array.prototype.sort is stable, so relative `order` is preserved within
        // each group.
        const merged = data.map((p) => {
          const s = STATIC_BY_KEY.get(p.slug || p.id)
          return withKey({
            ...p,
            liveUrl: p.liveUrl || s?.liveUrl || '',
            alwaysShow: p.alwaysShow ?? s?.alwaysShow ?? false,
          })
        })
        merged.sort((a, b) => Number(b.alwaysShow) - Number(a.alwaysShow))
        setProjects(merged)
        writeCache('projects', merged)
      })
      .catch(() => {
        // Keep the cached/static fallback already in state.
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
