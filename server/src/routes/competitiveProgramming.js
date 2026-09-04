import { Router } from 'express'
import { requireAdmin } from '../middleware/auth.js'
import CpProfile from '../models/CpProfile.js'

/**
 * Competitive-programming judges. Same shape as crudRouter (public list, admin
 * create/update/delete) but hand-rolled because a judge carries a number
 * (`solvedOverride`) and a free-form object (`stats`) that the generic string/
 * array sanitizer can't express.
 */

// Straight-through trimmed string fields.
const STRING_FIELDS = ['key', 'name', 'mono', 'source', 'accent', 'handle', 'logo', 'logoClass', 'profileUrl']
// Numeric keys accepted inside the free-form `stats` object.
const STAT_NUMS = ['rating', 'solved', 'submissions', 'activeDays', 'maxStreak']

/** Coerce to a finite number, or null when blank / not a number. */
function num(v) {
  if (v === '' || v === null || v === undefined) return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

/** Keep only recognised, non-empty stat entries (numbers + an optional note). */
function cleanStats(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return null
  const out = {}
  for (const k of STAT_NUMS) {
    const n = num(input[k])
    if (n !== null) out[k] = n
  }
  if (input.note != null && String(input.note).trim()) out.note = String(input.note).trim()
  return Object.keys(out).length ? out : null
}

function sanitize(body = {}) {
  const out = {}
  for (const key of STRING_FIELDS) {
    if (body[key] !== undefined) out[key] = String(body[key]).trim()
  }
  if (body.solvedOverride !== undefined) out.solvedOverride = num(body.solvedOverride)
  if (body.stats !== undefined) out.stats = cleanStats(body.stats)
  if (body.order !== undefined) out.order = Number(body.order) || 0
  return out
}

const humanize = (err) => {
  if (err?.code === 11000) return 'A judge with that key already exists.'
  if (err?.errors) return Object.values(err.errors).map((e) => e.message).join(', ')
  return err?.message || 'Could not save.'
}

const router = Router()

// GET / — list all (public)
router.get('/', async (_req, res) => {
  const docs = await CpProfile.find().sort({ order: 1, createdAt: -1 })
  res.json(docs)
})

// POST / — create (admin)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const doc = await CpProfile.create(sanitize(req.body))
    res.status(201).json(doc)
  } catch (err) {
    res.status(400).json({ error: humanize(err) })
  }
})

// PUT /:id — update (admin)
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const doc = await CpProfile.findByIdAndUpdate(req.params.id, sanitize(req.body), {
      new: true,
      runValidators: true,
    })
    if (!doc) return res.status(404).json({ error: 'Not found.' })
    res.json(doc)
  } catch (err) {
    res.status(400).json({ error: humanize(err) })
  }
})

// DELETE /:id — remove (admin)
router.delete('/:id', requireAdmin, async (req, res) => {
  const doc = await CpProfile.findByIdAndDelete(req.params.id)
  if (!doc) return res.status(404).json({ error: 'Not found.' })
  res.json({ ok: true })
})

export default router
