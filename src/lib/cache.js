// A tiny stale-while-revalidate cache backed by localStorage.
//
// Sections seed their state from the last DB response we saw, so a returning
// visitor gets the real content instantly — even while the API (which cold-starts
// on Render's free tier, ~30-50s after it has spun down) is still waking up. The
// live fetch still runs on mount and replaces the cached copy the moment it
// arrives. Every access is guarded: private-mode or disabled storage must never
// break a render or a fetch.

const PREFIX = 'pf_cache_'

/** Last cached value for `key`, or null if none / empty / storage unavailable.
    Accepts both lists (collections) and plain objects (singletons like the
    profile) — an empty array is treated as "nothing cached". */
export function readCache(key) {
  if (!key) return null
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (!raw) return null
    const data = JSON.parse(raw)
    if (Array.isArray(data)) return data.length ? data : null
    if (data && typeof data === 'object') return data
    return null
  } catch {
    return null
  }
}

/** Persist a non-empty value for `key`. Accepts a list or a plain object;
    no-ops on empty arrays, non-objects, or storage errors. */
export function writeCache(key, data) {
  if (!key || !data || typeof data !== 'object') return
  if (Array.isArray(data) && !data.length) return
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(data))
  } catch {
    // Quota exceeded or storage blocked — the live fetch still populates state.
  }
}
