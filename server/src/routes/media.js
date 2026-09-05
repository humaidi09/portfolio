import { Router } from 'express'
import Media from '../models/Media.js'
import { requireAdmin } from '../middleware/auth.js'

/**
 * Media library (admin only). Lists uploaded Cloudinary objects and removes the
 * DB record. Signed uploads and Cloudinary `destroy` are added in the media
 * phase (routes/media sign/destroy) — for now this just backs the library list.
 */
const router = Router()

router.get('/', requireAdmin, async (_req, res) => {
  const docs = await Media.find().sort({ createdAt: -1 })
  res.json(docs)
})

router.delete('/:id', requireAdmin, async (req, res) => {
  const doc = await Media.findByIdAndDelete(req.params.id)
  if (!doc) return res.status(404).json({ error: 'Media not found.' })
  res.json({ ok: true })
})

export default router
