import mongoose from 'mongoose'
import { slugify, jsonOptions } from '../lib/model.js'

/**
 * A blog video. The media itself lives in object storage (Cloudinary): we keep
 * only `videoUrl` (secure_url), `publicId` (for deletes), a `thumbnailUrl`
 * poster, and metadata. Public API returns published videos only.
 */
const videoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    description: { type: String, default: '' },
    videoUrl: { type: String, default: '' }, // Cloudinary secure_url
    publicId: { type: String, default: '' }, // Cloudinary public_id (needed to delete the asset)
    thumbnailUrl: { type: String, default: '' }, // poster frame (Cloudinary so_0 transform)
    category: { type: String, default: '', trim: true },
    tags: { type: [String], default: [] },
    duration: { type: Number, default: 0 }, // seconds
    fileSize: { type: Number, default: 0 }, // bytes
    mimeType: { type: String, default: '' },
    author: { type: String, default: 'Hussain Ahmed', trim: true },
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    featured: { type: Boolean, default: false },
    publishedAt: { type: Date, default: null },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
)

videoSchema.pre('validate', function deriveSlug(next) {
  if (!this.slug && this.title) this.slug = slugify(this.title)
  next()
})

videoSchema.pre('save', function stampPublish(next) {
  if (this.status === 'published' && !this.publishedAt) this.publishedAt = new Date()
  next()
})

videoSchema.set('toJSON', jsonOptions)

export default mongoose.model('Video', videoSchema)
