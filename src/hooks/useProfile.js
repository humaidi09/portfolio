import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { readCache, writeCache } from '../lib/cache'
import { personalInfo, skills } from '../data/portfolioData'

// The static identity, shaped exactly like the API document (skill lists folded
// in as skillLanguages/skillCoreCS/skillTools). Used as the first-paint fallback
// and to fill any key a doc genuinely lacks — never to override a saved value.
const STATIC_PROFILE = {
  ...personalInfo,
  skillLanguages: skills.languages || [],
  skillCoreCS: skills.coreCS || [],
  skillTools: skills.toolsAndDB || [],
}

/**
 * Load the site's identity (name, photo, contact, bio, Hero CV skill lists) from
 * the API — the source of truth managed at /admin — with the bundled static data
 * as the offline fallback so the site never renders blank.
 *
 * When a document exists it wins WHOLESALE: `{ ...STATIC_PROFILE, ...doc }` means
 * the doc's value is used for every key it carries, INCLUDING empty strings — so
 * a field cleared in /admin actually clears on the site (this is the singleton
 * analog of useCollection's "DB wins when non-empty"). Static only fills keys the
 * doc lacks entirely (e.g. a schema field added later). The three skill lists are
 * the one exception: an empty array falls back to the static list, since a blank
 * skills row on the résumé is never intended.
 */
export function useProfile() {
  const [profile, setProfile] = useState(() => {
    const cached = readCache('profile')
    return cached ? mergeProfile(cached) : STATIC_PROFILE
  })

  useEffect(() => {
    let alive = true
    api
      .getProfile()
      .then((doc) => {
        if (!alive || !doc || typeof doc !== 'object') return
        setProfile(mergeProfile(doc))
        writeCache('profile', doc)
      })
      .catch(() => {
        // Keep the cached/static fallback already in state.
      })
    return () => {
      alive = false
    }
  }, [])

  return { profile }
}

/** Doc wins for every scalar key; skill lists fall back to static when empty. */
function mergeProfile(doc) {
  const merged = { ...STATIC_PROFILE, ...doc }
  for (const key of ['skillLanguages', 'skillCoreCS', 'skillTools']) {
    if (!Array.isArray(doc[key]) || doc[key].length === 0) {
      merged[key] = STATIC_PROFILE[key]
    }
  }
  return merged
}
