import mongoose from 'mongoose'
import { slugify, jsonOptions } from '../lib/model.js'

/** A lightweight tag (shared across posts, videos, photos). */
const tagSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
)

tagSchema.pre('validate', function deriveSlug(next) {
  if (!this.slug && this.name) this.slug = slugify(this.name)
  next()
})

tagSchema.set('toJSON', jsonOptions)

export default mongoose.model('Tag', tagSchema)
