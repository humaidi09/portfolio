import { Router } from 'express'
import Media from '../models/Media.js'
import { requireAdmin } from '../middleware/auth.js'
import { cloudinaryConfigured, signedUpload, destroyAsset } from '../lib/cloudinary.js'

/**
 * Media endpoints (admin only):
 *   POST /sign      → short-lived signature so the browser can upload a file
 *                     straight to Cloudinary (the API secret never leaves here).
 *   POST /destroy   → remove a Cloudinary asset by public_id.
 *   GET  /          → Media-library list (separate CMS concept).
 *   DELETE /:id     → remove a Media-library record.
 * Events/Gallery uploads use /sign + /destroy only; they don't create Media docs.
 */
const router = Router()

// POST /sign — hand the client the fields it needs to POST a signed upload.
router.post('/sign', requireAdmin, (req, res) => {
  if (!cloudinaryConfigured()) {
    return res.status(503).json({ error: 'Image uploads are not configured yet.' })
  }
  const resourceType = req.body?.resourceType === 'video' ? 'video' : 'image'
  const folder = String(req.body?.folder || 'portfolio').trim() || 'portfolio'
  res.json(signedUpload({ folder, resourceType }))
})

// POST /destroy — delete a Cloudinary asset. Idempotent: "not found" is a success.
router.post('/destroy', requireAdmin, async (req, res) => {
  const publicId = String(req.body?.publicId || '').trim()
  if (!publicId) return res.status(400).json({ error: 'publicId is required.' })
  const resourceType = req.body?.resourceType === 'video' ? 'video' : 'image'
  try {
    const result = await destroyAsset(publicId, resourceType)
    res.json(result)
  } catch (err) {
    res.status(400).json({ error: err.message || 'Cloudinary destroy failed.' })
  }
})

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
