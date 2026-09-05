import { Router } from 'express'
import Post from '../models/Post.js'
import Video from '../models/Video.js'
import Photo from '../models/Photo.js'
import { requireAdmin } from '../middleware/auth.js'

/** Aggregate counts for the CMS dashboard. */
const router = Router()

// GET /api/blog/summary — per-type totals (admin).
router.get('/summary', requireAdmin, async (_req, res) => {
  const [posts, videos, photos] = await Promise.all([Post, Video, Photo].map(countByStatus))
  res.json({ posts, videos, photos })
})

async function countByStatus(Model) {
  const [total, published, draft, featured] = await Promise.all([
    Model.countDocuments(),
    Model.countDocuments({ status: 'published' }),
    Model.countDocuments({ status: 'draft' }),
    Model.countDocuments({ featured: true }),
  ])
  return { total, published, draft, featured }
}

export default router
