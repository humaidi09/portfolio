import mongoose from 'mongoose'

/**
 * A portfolio project. Mirrors the shape the frontend already renders from
 * `src/data/portfolioData.js`, so the API is a drop-in source for the same UI.
 * `slug` is the stable public id (was `id` in the static data).
 */
const projectSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true },
    title: { type: String, required: true, trim: true },
    category: { type: String, default: '', trim: true },
    tech: { type: [String], default: [] },
    summary: { type: String, default: '' },
    details: { type: String, default: '' },
    github: { type: String, default: '' },
    demo: { type: String, default: '' },
    // Controls display order (lower = shown first). Falls back to createdAt.
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
)

// Return a clean object to the client: `id` instead of `_id`, no `__v`.
projectSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id
    delete ret._id
    return ret
  },
})

export default mongoose.model('Project', projectSchema)
