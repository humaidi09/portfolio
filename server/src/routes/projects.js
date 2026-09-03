import { Router } from 'express'
import Project from '../models/Project.js'
import { requireAdmin } from '../middleware/auth.js'

/**
 * Projects API. Reads are public (the site fetches them); create/update/delete
 * require a valid admin token. Ordered by `order` then newest-first.
 */
const router = Router()

// GET /api/projects — list all (public)
router.get('/', async (_req, res) => {
  const projects = await Project.find().sort({ order: 1, createdAt: -1 })
  res.json(projects)
})

// GET /api/projects/:id — one by mongo id or slug (public)
router.get('/:id', async (req, res) => {
  const { id } = req.params
  const query = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { slug: id }
  const project = await Project.findOne(query)
  if (!project) return res.status(404).json({ error: 'Project not found.' })
  res.json(project)
})

// POST /api/projects — create (admin)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const project = await Project.create(sanitize(req.body))
    res.status(201).json(project)
  } catch (err) {
    res.status(400).json({ error: humanize(err) })
  }
})

// PUT /api/projects/:id — update (admin)
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, sanitize(req.body), {
      new: true,
      runValidators: true,
    })
    if (!project) return res.status(404).json({ error: 'Project not found.' })
    res.json(project)
  } catch (err) {
    res.status(400).json({ error: humanize(err) })
  }
})

// DELETE /api/projects/:id — remove (admin)
router.delete('/:id', requireAdmin, async (req, res) => {
  const project = await Project.findByIdAndDelete(req.params.id)
  if (!project) return res.status(404).json({ error: 'Project not found.' })
  res.json({ ok: true })
})

/** Keep only known fields; coerce `tech` from a comma string if needed. */
function sanitize(body = {}) {
  const out = {}
  for (const key of ['slug', 'title', 'category', 'summary', 'details', 'github', 'demo']) {
    if (body[key] !== undefined) out[key] = String(body[key]).trim()
  }
  if (body.order !== undefined) out.order = Number(body.order) || 0
  if (body.tech !== undefined) {
    out.tech = Array.isArray(body.tech)
      ? body.tech.map((t) => String(t).trim()).filter(Boolean)
      : String(body.tech)
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
  }
  return out
}

/** Turn mongoose/validation errors into a short readable message. */
function humanize(err) {
  if (err?.code === 11000) return 'A project with that slug already exists.'
  if (err?.errors) return Object.values(err.errors).map((e) => e.message).join(', ')
  return err?.message || 'Could not save the project.'
}

export default router
