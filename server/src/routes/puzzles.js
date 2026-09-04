import { Router } from 'express'
import Puzzle from '../models/Puzzle.js'
import { requireAdmin } from '../middleware/auth.js'

/**
 * Guess-the-output puzzles. Public list (GET /); admin create/update/delete.
 * A dedicated router (not the generic crudRouter) because `answer` is a numeric
 * index and `options` is a verbatim string array that must not be comma-split.
 */
const router = Router()

const sanitize = (body = {}) => {
  const out = {}
  if (body.code !== undefined) out.code = String(body.code)
  if (body.note !== undefined) out.note = String(body.note).trim()
  if (body.options !== undefined) {
    // Accept an array, or a newline-separated string from a plain textarea.
    const arr = Array.isArray(body.options)
      ? body.options
      : String(body.options).split('\n')
    out.options = arr.map((o) => String(o).trim()).filter(Boolean)
  }
  if (body.answer !== undefined) out.answer = Number(body.answer) || 0
  if (body.order !== undefined) out.order = Number(body.order) || 0
  return out
}

const humanize = (err) => {
  if (err?.errors) return Object.values(err.errors).map((e) => e.message).join(', ')
  return err?.message || 'Could not save.'
}

// GET / — list all (public)
router.get('/', async (_req, res) => {
  const docs = await Puzzle.find().sort({ order: 1, createdAt: -1 })
  res.json(docs)
})

// POST / — create (admin)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const doc = await Puzzle.create(sanitize(req.body))
    res.status(201).json(doc)
  } catch (err) {
    res.status(400).json({ error: humanize(err) })
  }
})

// PUT /:id — update (admin)
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const doc = await Puzzle.findByIdAndUpdate(req.params.id, sanitize(req.body), {
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
  const doc = await Puzzle.findByIdAndDelete(req.params.id)
  if (!doc) return res.status(404).json({ error: 'Not found.' })
  res.json({ ok: true })
})

export default router
