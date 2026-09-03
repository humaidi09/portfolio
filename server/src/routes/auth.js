import { Router } from 'express'
import jwt from 'jsonwebtoken'
import rateLimit from 'express-rate-limit'

/**
 * Single-admin login. There is no user table: the one password lives in
 * ADMIN_PASSWORD (env). A correct password returns a short-lived JWT the admin
 * UI stores and sends on write requests. Rate-limited to blunt brute force.
 */
const router = Router()

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts. Try again in a few minutes.' },
})

router.post('/login', loginLimiter, (req, res) => {
  const { password } = req.body || {}
  const expected = process.env.ADMIN_PASSWORD

  if (!expected) {
    return res.status(500).json({ error: 'Server is missing ADMIN_PASSWORD.' })
  }
  if (!password || password !== expected) {
    return res.status(401).json({ error: 'Wrong password.' })
  }

  const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '12h' })
  res.json({ token })
})

export default router
