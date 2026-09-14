// A tiny stale-while-revalidate cache backed by localStorage.
//
// Sections seed their state from the last DB response we saw, so a returning
// visitor gets the real content instantly — even while the API (which cold-starts
// on Render's free tier, ~30-50s after it has spun down) is still waking up. The
// live fetch still runs on mount and replaces the cached copy the moment it
// arrives. Every access is guarded: private-mode or disabled storage must never
// break a render or a fetch.

const PREFIX = 'pf_cache_'

/** Last cached list for `key`, or null if none / empty / storage unavailable. */
export function readCache(key) {
  if (!key) return null
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (!raw) return null
    const data = JSON.parse(raw)
    return Array.isArray(data) && data.length ? data : null
  } catch {
    return null
  }
}

/** Persist a non-empty list for `key`. No-ops on empty data or storage errors. */
export function writeCache(key, data) {
  if (!key || !Array.isArray(data) || !data.length) return
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(data))
  } catch {
    // Quota exceeded or storage blocked — the live fetch still populates state.
  }
}
