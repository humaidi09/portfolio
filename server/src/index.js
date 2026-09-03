import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { connectDB } from './db.js'
import authRoutes from './routes/auth.js'
import projectRoutes from './routes/projects.js'

const app = express()

// CORS: only allow the configured frontend origin(s).
const origins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())
app.use(cors({ origin: origins }))
app.use(express.json())

// Health check (handy for uptime pings on Render).
app.get('/api/health', (_req, res) => res.json({ ok: true }))

app.use('/api/auth', authRoutes)
app.use('/api/projects', projectRoutes)

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
