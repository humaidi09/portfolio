import jwt from 'jsonwebtoken'

/**
 * Gate for admin-only routes. Expects `Authorization: Bearer <token>` where the
 * token was issued by POST /api/auth/login. Rejects anything else with 401.
 */
export function requireAdmin(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null

  if (!token) {
    return res.status(401).json({ error: 'Missing admin token.' })
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    if (payload.role !== 'admin') throw new Error('not admin')
    req.admin = payload
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token.' })
  }
}

/**
 * Soft variant of requireAdmin for public routes that reveal *more* to an admin
 * (e.g. drafts). Sets `req.admin` when a valid token is present, but never
 * rejects: anonymous requests simply continue with `req.admin` unset.
 */
export function optionalAdmin(req, _res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (token) {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET)
      if (payload.role === 'admin') req.admin = payload
    } catch {
      // Invalid/expired token → treat as anonymous, don't fail the request.
    }
  }
  next()
}
