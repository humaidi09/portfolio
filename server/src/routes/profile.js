import { Router } from 'express'
import Profile from '../models/Profile.js'
import { requireAdmin } from '../middleware/auth.js'

/**
 * Profile API — the site's personal identity as a single document. Read is public
 * (every page fetches it); the update is admin-only and upserts, so there is
 * always exactly one record. Modeled on the CV route's singleton pattern rather
 * than the list-based crudRouter.
 */
const router = Router()

// String fields written verbatim (trimmed).
const STRING_FIELDS = [
  'name', 'photo', 'role', 'tagline', 'phone', 'email', 'github', 'linkedin',
  'whatsapp', 'facebook', 'instagram', 'twitter', 'university', 'degree',
  'gpa', 'semester', 'bio',
]
// Skill lists — coerced from a comma string or an array (mirrors crud.js).
const ARRAY_FIELDS = ['skillLanguages', 'skillCoreCS', 'skillTools']

/** Keep only known fields; coerce the skill lists from comma-string-or-array. */
function sanitize(body = {}) {
  const out = {}
  for (const key of STRING_FIELDS) {
    // `photo` may be a long base64 data URL — never trim its contents, only its ends.
    if (body[key] !== undefined) out[key] = String(body[key]).trim()
  }
  for (const key of ARRAY_FIELDS) {
    if (body[key] !== undefined) {
      out[key] = Array.isArray(body[key])
        ? body[key].map((t) => String(t).trim()).filter(Boolean)
        : String(body[key]).split(',').map((t) => t.trim()).filter(Boolean)
    }
  }
  return out
}

// GET /api/profile — the identity document, or null before it is first saved (public).
router.get('/', async (_req, res) => {
  const profile = await Profile.findOne()
  res.json(profile)
})

// PUT /api/profile — create-or-update the single document (admin).
router.put('/', requireAdmin, async (req, res) => {
  try {
    const profile = await Profile.findOneAndUpdate({}, sanitize(req.body), {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    })
    res.json(profile)
  } catch (err) {
    const msg = err?.errors
      ? Object.values(err.errors).map((e) => e.message).join(', ')
      : err?.message || 'Could not save the profile.'
    res.status(400).json({ error: msg })
  }
})

export default router
