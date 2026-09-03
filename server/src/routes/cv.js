import { Router } from 'express'
import Cv from '../models/Cv.js'
import { requireAdmin } from '../middleware/auth.js'

/**
 * The current CV (a single PDF stored inline). The public GET streams the file
 * so the site's "Download CV" button just points at this URL. Upload is admin.
 */
const router = Router()

// GET /api/cv — download the current CV as a real PDF (public)
router.get('/', async (_req, res) => {
  const cv = await Cv.findById('current')
  if (!cv) return res.status(404).json({ error: 'No CV uploaded yet.' })
  const buffer = Buffer.from(cv.data, 'base64')
  res.setHeader('Content-Type', cv.mimeType || 'application/pdf')
  res.setHeader('Content-Disposition', `inline; filename="${cv.filename || 'CV.pdf'}"`)
  res.setHeader('Content-Length', buffer.length)
  res.send(buffer)
})

// GET /api/cv/meta — does a CV exist? (public, cheap — no file body)
router.get('/meta', async (_req, res) => {
  const cv = await Cv.findById('current').select('filename size updatedAt')
  if (!cv) return res.json({ exists: false })
  res.json({ exists: true, filename: cv.filename, size: cv.size, updatedAt: cv.updatedAt })
})

// PUT /api/cv — upload / replace the CV (admin). Body: { filename, data(base64) }
router.put('/', requireAdmin, async (req, res) => {
  const data = String(req.body?.data || '')
  if (!data) return res.status(400).json({ error: 'No file data received.' })

  const size = Math.round((data.length * 3) / 4) // approx bytes from base64 length
  if (size > 8 * 1024 * 1024) {
    return res.status(400).json({ error: 'CV is too large (max 8 MB).' })
  }

  const filename = String(req.body?.filename || 'CV.pdf').trim() || 'CV.pdf'
  const mimeType = String(req.body?.mimeType || 'application/pdf')

  const cv = await Cv.findByIdAndUpdate(
    'current',
    { filename, mimeType, data, size },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  )
  res.json({ ok: true, filename: cv.filename, size: cv.size })
})

// DELETE /api/cv — remove the current CV (admin)
router.delete('/', requireAdmin, async (_req, res) => {
  await Cv.findByIdAndDelete('current')
  res.json({ ok: true })
})

export default router
