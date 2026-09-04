import { Router } from 'express'
import { requireAdmin } from '../middleware/auth.js'

/**
 * Build a standard collection router: public list (GET /), admin create/update/
 * delete. Ordered by `order` then newest-first. `fields` names the writable
 * string fields; `arrayFields` are coerced from a comma string or array.
 */
export function crudRouter(Model, { fields = [], arrayFields = [], listFields = [] } = {}) {
  const router = Router()

  const sanitize = (body = {}) => {
    const out = {}
    for (const key of fields) {
      if (body[key] !== undefined) out[key] = String(body[key]).trim()
    }
    // Comma-separated tag fields (e.g. "React, Node") → trimmed string array.
    for (const key of arrayFields) {
      if (body[key] !== undefined) {
        out[key] = Array.isArray(body[key])
          ? body[key].map((t) => String(t).trim()).filter(Boolean)
          : String(body[key]).split(',').map((t) => t.trim()).filter(Boolean)
      }
    }
    // Verbatim string arrays (e.g. base64 image data URLs) — never split on
    // commas, since data URLs contain them. Only drop empty entries.
    for (const key of listFields) {
      if (body[key] !== undefined) {
        const arr = Array.isArray(body[key]) ? body[key] : [body[key]]
        out[key] = arr.map((v) => String(v)).filter(Boolean)
      }
    }
    if (body.order !== undefined) out.order = Number(body.order) || 0
    return out
  }

  const humanize = (err) => {
    if (err?.errors) return Object.values(err.errors).map((e) => e.message).join(', ')
    return err?.message || 'Could not save.'
  }

  // GET / — list all (public)
  router.get('/', async (_req, res) => {
    const docs = await Model.find().sort({ order: 1, createdAt: -1 })
    res.json(docs)
  })

  // POST / — create (admin)
  router.post('/', requireAdmin, async (req, res) => {
    try {
      const doc = await Model.create(sanitize(req.body))
      res.status(201).json(doc)
    } catch (err) {
      res.status(400).json({ error: humanize(err) })
    }
  })

  // PUT /:id — update (admin)
  router.put('/:id', requireAdmin, async (req, res) => {
    try {
      const doc = await Model.findByIdAndUpdate(req.params.id, sanitize(req.body), {
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
    const doc = await Model.findByIdAndDelete(req.params.id)
    if (!doc) return res.status(404).json({ error: 'Not found.' })
    res.json({ ok: true })
  })

  return router
}
