import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { connectDB } from './db.js'
import authRoutes from './routes/auth.js'
import projectRoutes from './routes/projects.js'
import messageRoutes from './routes/messages.js'
import cvRoutes from './routes/cv.js'

const app = express()

// CORS: only allow the configured frontend origin(s).
const origins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())
app.use(cors({ origin: origins }))
// Raised from the 100kb default so a base64-encoded CV PDF fits in the body.
app.use(express.json({ limit: '12mb' }))

// Health check (handy for uptime pings on Render).
app.get('/api/health', (_req, res) => res.json({ ok: true }))

app.use('/api/auth', authRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/cv', cvRoutes)

// Fallback 404 for unknown API routes.
app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found.' }))

const PORT = process.env.PORT || 4000

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`✓ API listening on http://localhost:${PORT}`))
  })
  .catch((err) => {
    console.error('✗ Failed to start:', err.message)
    process.exit(1)
  })
