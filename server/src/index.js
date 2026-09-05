import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { connectDB } from './db.js'
import authRoutes from './routes/auth.js'
import projectRoutes from './routes/projects.js'
import messageRoutes from './routes/messages.js'
import cvRoutes from './routes/cv.js'
import experienceRoutes from './routes/experiences.js'
import certificationRoutes from './routes/certifications.js'
import statRoutes from './routes/stats.js'
import resultRoutes from './routes/results.js'
import eventRoutes from './routes/events.js'
import galleryRoutes from './routes/gallery.js'
import puzzleRoutes from './routes/puzzles.js'
import wrongAnswerRoutes from './routes/wrongAnswers.js'
import cpRoutes from './routes/competitiveProgramming.js'
import postRoutes from './routes/posts.js'
import videoRoutes from './routes/videos.js'
import photoRoutes from './routes/photos.js'
import categoryRoutes from './routes/categories.js'
import tagRoutes from './routes/tags.js'
import mediaRoutes from './routes/media.js'
import blogRoutes from './routes/blog.js'
import skillGroupRoutes from './routes/skillGroups.js'

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
app.use('/api/experiences', experienceRoutes)
app.use('/api/certifications', certificationRoutes)
app.use('/api/stats', statRoutes)
app.use('/api/results', resultRoutes)
app.use('/api/events', eventRoutes)
app.use('/api/gallery', galleryRoutes)
app.use('/api/puzzles', puzzleRoutes)
app.use('/api/wrong-answers', wrongAnswerRoutes)
app.use('/api/competitive-programming', cpRoutes)
app.use('/api/posts', postRoutes)
app.use('/api/videos', videoRoutes)
app.use('/api/photos', photoRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/tags', tagRoutes)
app.use('/api/media', mediaRoutes)
app.use('/api/blog', blogRoutes)
app.use('/api/skill-groups', skillGroupRoutes)

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
