import { Router } from 'express'
import AppDataset from '../models/AppDataset.js'
import { requireAdmin } from '../middleware/auth.js'

/**
 * App-content API — the editable data behind the standalone apps.
 *
 *   GET  /api/app-data          → every dataset (admin editor loads all at once)
 *   GET  /api/app-data/:app     → one app's datasets (each app fetches this at boot)
 *   PUT  /api/app-data/:app/:slug   → create-or-update a dataset (admin)
 *   DELETE /api/app-data/:app/:slug → remove a dataset (admin)
 *
 * Reads are public (the apps are public); writes require the admin token. The
 * `data` payload is stored verbatim as JSON (array for a list, object for a
 * singleton), so a whole table or settings form is saved in one request.
 */
const router = Router()

const KINDS = new Set(['list', 'singleton'])

/** Whitelist the writable fields; leave `data` structurally intact. */
function sanitize(body = {}) {
  const out = {}
  if (body.kind !== undefined && KINDS.has(body.kind)) out.kind = body.kind
  if (body.label !== undefined) out.label = String(body.label).trim()
  if (body.order !== undefined) out.order = Number(body.order) || 0
  if (Array.isArray(body.fields)) out.fields = body.fields.map((f) => String(f))
  if (body.fieldTypes && typeof body.fieldTypes === 'object' && !Array.isArray(body.fieldTypes)) {
    out.fieldTypes = body.fieldTypes
  }
  // `data` must be an array (list) or a plain object (singleton). Stored as-is.
  if (body.data !== undefined) {
    if (Array.isArray(body.data) || (body.data && typeof body.data === 'object')) {
      out.data = body.data
    } else {
      throw new Error('`data` must be an array or object.')
    }
  }
  return out
}

const humanize = (err) =>
  err?.errors ? Object.values(err.errors).map((e) => e.message).join(', ') : err?.message || 'Could not save.'

// GET / — every dataset, grouped-friendly (app then order). Public.
router.get('/', async (_req, res) => {
  const docs = await AppDataset.find().sort({ app: 1, order: 1, slug: 1 })
  res.json(docs)
})

// GET /:app — one app's datasets. Public; this is what each standalone app calls.
router.get('/:app', async (req, res) => {
  const docs = await AppDataset.find({ app: req.params.app }).sort({ order: 1, slug: 1 })
  res.json(docs)
})

// PUT /:app/:slug — create-or-update one dataset (admin). Upserts so a brand-new
// dataset defined in the editor is created on first save.
router.put('/:app/:slug', requireAdmin, async (req, res) => {
  try {
    const update = sanitize(req.body)
    const doc = await AppDataset.findOneAndUpdate(
      { app: req.params.app, slug: req.params.slug },
      { $set: update, $setOnInsert: { app: req.params.app, slug: req.params.slug } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
    )
    res.json(doc)
  } catch (err) {
    res.status(400).json({ error: humanize(err) })
  }
})

// DELETE /:app/:slug — remove a dataset (admin).
router.delete('/:app/:slug', requireAdmin, async (req, res) => {
  const doc = await AppDataset.findOneAndDelete({ app: req.params.app, slug: req.params.slug })
  if (!doc) return res.status(404).json({ error: 'Not found.' })
  res.json({ ok: true })
})

export default router
