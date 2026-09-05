import mongoose from 'mongoose'
import { slugify, jsonOptions } from '../lib/model.js'

/**
 * A blog post / article. `content` is Markdown, rendered on the client. `slug`
 * is the stable public id used in /blog/post/:slug. Only `status: 'published'`
 * posts are returned to the public API; drafts are admin-only.
 */
const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    subtitle: { type: String, default: '', trim: true },
    excerpt: { type: String, default: '' },
    content: { type: String, default: '' }, // Markdown
    coverImage: { type: String, default: '' }, // data URL or hosted URL
    category: { type: String, default: '', trim: true },
    tags: { type: [String], default: [] },
    author: { type: String, default: 'Hussain Ahmed', trim: true },
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    featured: { type: Boolean, default: false },
    readingTime: { type: Number, default: 0 }, // minutes, computed on save
    publishedAt: { type: Date, default: null },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
)

// Derive a slug from the title when the client didn't supply one.
postSchema.pre('validate', function deriveSlug(next) {
  if (!this.slug && this.title) this.slug = slugify(this.title)
  next()
})

postSchema.pre('save', function computeMeta(next) {
  // Reading time from the Markdown word count (~200 wpm, min 1).
  const words = (this.content || '').trim().split(/\s+/).filter(Boolean).length
  this.readingTime = Math.max(1, Math.round(words / 200))
  // Stamp the publish date the first time the post goes live.
  if (this.status === 'published' && !this.publishedAt) this.publishedAt = new Date()
  next()
})

postSchema.set('toJSON', jsonOptions)

export default mongoose.model('Post', postSchema)
