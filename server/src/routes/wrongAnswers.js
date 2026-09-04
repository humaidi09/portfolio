import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import WrongAnswer from '../models/WrongAnswer.js'
import { requireAdmin } from '../middleware/auth.js'

/**
 * Wrong-guess log for the hero terminal game. Anyone can log a wrong pick
 * (POST, rate-limited to curb spam); only the admin can list, delete one, or
 * clear them all.
 */
const router = Router()

// Cap public writes: 60 per 10 min per IP (a keen player still fits under this).
const logLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts logged — please slow down.' },
})

// POST /api/wrong-answers — log a wrong guess (public)
router.post('/', logLimiter, async (req, res) => {
  const code = String(req.body?.code || '').trim()
  const chosen = String(req.body?.chosen || '').trim().slice(0, 200)
  const correct = String(req.body?.correct || '').trim().slice(0, 200)
  if (!code) return res.status(400).json({ error: 'Missing snippet.' })

  await WrongAnswer.create({ code: code.slice(0, 2000), chosen, correct })
  res.status(201).json({ ok: true })
})

// GET /api/wrong-answers — list all, newest first (admin)
router.get('/', requireAdmin, async (_req, res) => {
  const rows = await WrongAnswer.find().sort({ createdAt: -1 }).limit(500)
  res.json(rows)
})

// DELETE /api/wrong-answers — clear all (admin). Must come before /:id.
router.delete('/', requireAdmin, async (_req, res) => {
  await WrongAnswer.deleteMany({})
  res.json({ ok: true })
})

// DELETE /api/wrong-answers/:id — remove one (admin)
router.delete('/:id', requireAdmin, async (req, res) => {
  const row = await WrongAnswer.findByIdAndDelete(req.params.id)
  if (!row) return res.status(404).json({ error: 'Not found.' })
  res.json({ ok: true })
})

export default router
