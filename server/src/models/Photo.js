import mongoose from 'mongoose'
import { slugify, jsonOptions } from '../lib/model.js'

/**
 * A blog photo. The image lives in object storage (Cloudinary): we keep
 * `imageUrl` (secure_url), `publicId` (for deletes), the caption, and the
 * intrinsic dimensions so the grid can lay out without distortion. Public API
 * returns published photos only.
 */
const photoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    imageUrl: { type: String, default: '' }, // Cloudinary secure_url
    publicId: { type: String, default: '' }, // Cloudinary public_id (needed to delete the asset)
    caption: { type: String, default: '' },
    category: { type: String, default: '', trim: true },
    tags: { type: [String], default: [] },
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 },
    author: { type: String, default: 'Hussain Ahmed', trim: true },
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    featured: { type: Boolean, default: false },
    publishedAt: { type: Date, default: null },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
)

photoSchema.pre('validate', function deriveSlug(next) {
  if (!this.slug && this.title) this.slug = slugify(this.title)
  next()
})

photoSchema.pre('save', function stampPublish(next) {
  if (this.status === 'published' && !this.publishedAt) this.publishedAt = new Date()
  next()
})

photoSchema.set('toJSON', jsonOptions)

export default mongoose.model('Photo', photoSchema)
