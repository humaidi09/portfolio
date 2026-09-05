import { Router } from 'express'
import { requireAdmin, optionalAdmin } from '../middleware/auth.js'
import { slugify } from '../lib/model.js'

/**
 * Shared router for the three blog content types (posts, videos, photos). They
 * differ only in their type-specific fields; everything else is identical and
 * lives here:
 *   - the published/draft gate (public sees `status: 'published'` only; a valid
 *     admin token also returns drafts),
 *   - slug (or mongo-id) lookup for detail pages,
 *   - server-side `?q=` / `?category=` / `?tag=` filtering,
 *   - admin create / update / delete.
 *
 * `stringFields` / `numberFields` are the writable fields on top of the shared
 * set (title, slug, category, author, status, featured, order, tags,
 * publishedAt). `searchFields` are the string fields `?q=` matches (tags are
 * always searched too).
 */
export function blogRouter(
  Model,
  { label = 'item', stringFields = [], numberFields = [], searchFields = [] } = {},
) {
  const router = Router()

  // Translate query params into a Mongo filter, honouring the admin gate.
  const buildFilter = (req) => {
    const filter = {}
    if (!req.admin) filter.status = 'published' // anonymous → published only
    const { q, category, tag, status } = req.query
    if (req.admin && status) filter.status = status // admins may narrow (?status=draft)
    if (category) filter.category = new RegExp(`^${escapeRegex(category)}$`, 'i')
    if (tag) filter.tags = new RegExp(`^${escapeRegex(tag)}$`, 'i')
    if (q) {
      const rx = new RegExp(escapeRegex(q), 'i')
      filter.$or = [...searchFields.map((f) => ({ [f]: rx })), { tags: rx }]
    }
    return filter
  }

  // Keep only known fields; coerce types the way the schema expects.
  const sanitize = (body = {}) => {
    const out = {}
    for (const key of ['title', 'slug', 'category', 'author', 'status', ...stringFields]) {
      if (body[key] !== undefined) out[key] = String(body[key]).trim()
    }
    for (const key of numberFields) {
      if (body[key] !== undefined) out[key] = Number(body[key]) || 0
    }
    if (body.tags !== undefined) {
      out.tags = Array.isArray(body.tags)
        ? body.tags.map((t) => String(t).trim()).filter(Boolean)
        : String(body.tags)
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
    }
    if (body.featured !== undefined) out.featured = Boolean(body.featured)
    if (body.order !== undefined) out.order = Number(body.order) || 0
    // Allow an explicit publish date; otherwise the model stamps it on publish.
    if (body.publishedAt) out.publishedAt = new Date(body.publishedAt)
    // Derive the slug from the title if the client left it blank.
    if (out.slug === '' && out.title) out.slug = slugify(out.title)
    return out
  }

  const humanize = (err) => {
    if (err?.code === 11000) return `A ${label} with that slug already exists.`
    if (err?.errors) return Object.values(err.errors).map((e) => e.message).join(', ')
    return err?.message || `Could not save the ${label}.`
  }

  // GET / — list (public: published only; admin: all). Supports ?q/category/tag.
  router.get('/', optionalAdmin, async (req, res) => {
    const docs = await Model.find(buildFilter(req)).sort({
      order: 1,
      publishedAt: -1,
      createdAt: -1,
    })
    res.json(docs)
  })

  // GET /:slug — one by slug (or mongo id). Drafts are visible to admins only.
  router.get('/:slug', optionalAdmin, async (req, res) => {
    const { slug } = req.params
    const query = slug.match(/^[0-9a-fA-F]{24}$/) ? { _id: slug } : { slug }
    const doc = await Model.findOne(query)
    if (!doc || (doc.status !== 'published' && !req.admin)) {
      return res.status(404).json({ error: `${cap(label)} not found.` })
    }
    res.json(doc)
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

  // PUT /:id — update (admin). Load → assign → save so the pre-save hooks
  // (reading time, publish stamp) run, unlike findByIdAndUpdate.
  router.put('/:id', requireAdmin, async (req, res) => {
    try {
      const doc = await Model.findById(req.params.id)
      if (!doc) return res.status(404).json({ error: `${cap(label)} not found.` })
      Object.assign(doc, sanitize(req.body))
      await doc.save()
      res.json(doc)
    } catch (err) {
      res.status(400).json({ error: humanize(err) })
    }
  })

  // DELETE /:id — remove (admin)
  router.delete('/:id', requireAdmin, async (req, res) => {
    const doc = await Model.findByIdAndDelete(req.params.id)
    if (!doc) return res.status(404).json({ error: `${cap(label)} not found.` })
    res.json({ ok: true })
  })

  return router
}

/** Escape user input before embedding it in a RegExp. */
function escapeRegex(s = '') {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function cap(s = '') {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
