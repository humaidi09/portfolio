import mongoose from 'mongoose'
import { slugify, jsonOptions } from '../lib/model.js'

/** A content category (shared across posts, videos, photos). */
const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    description: { type: String, default: '' },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
)

categorySchema.pre('validate', function deriveSlug(next) {
  if (!this.slug && this.name) this.slug = slugify(this.name)
  next()
})

categorySchema.set('toJSON', jsonOptions)

export default mongoose.model('Category', categorySchema)
