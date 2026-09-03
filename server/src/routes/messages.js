import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import Message from '../models/Message.js'
import { requireAdmin } from '../middleware/auth.js'

/**
 * Contact messages. Anyone can submit (POST, rate-limited to curb spam);
 * only the admin can list, mark-read, or delete them.
 */
const router = Router()

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Cap public submissions: 5 per 10 min per IP.
const submitLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many messages — please try again in a little while.' },
})

// POST /api/messages — submit a contact message (public)
router.post('/', submitLimiter, async (req, res) => {
  const name = String(req.body?.name || '').trim()
  const email = String(req.body?.email || '').trim()
  const message = String(req.body?.message || '').trim()

  if (name.length < 2) return res.status(400).json({ error: 'Please tell me your name.' })
  if (!EMAIL_RE.test(email)) return res.status(400).json({ error: 'A valid email lets me reply.' })
  if (message.length < 10) return res.status(400).json({ error: 'Please add a little more detail.' })

  await Message.create({ name, email, message })
  res.status(201).json({ ok: true })
})

// GET /api/messages — list all, newest first (admin)
router.get('/', requireAdmin, async (_req, res) => {
  const messages = await Message.find().sort({ createdAt: -1 })
  res.json(messages)
})

// PATCH /api/messages/:id — mark read/unread (admin)
router.patch('/:id', requireAdmin, async (req, res) => {
  const message = await Message.findByIdAndUpdate(
    req.params.id,
    { read: Boolean(req.body?.read) },
    { new: true },
  )
  if (!message) return res.status(404).json({ error: 'Message not found.' })
  res.json(message)
})

// DELETE /api/messages/:id — remove (admin)
router.delete('/:id', requireAdmin, async (req, res) => {
  const message = await Message.findByIdAndDelete(req.params.id)
  if (!message) return res.status(404).json({ error: 'Message not found.' })
  res.json({ ok: true })
})

export default router
