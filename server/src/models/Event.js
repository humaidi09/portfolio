import mongoose from 'mongoose'

/**
 * An event Humaidi took part in (contest, workshop, volunteering, meetup).
 * `images` holds base64 data URLs so the photos travel with the record — no
 * separate file store needed. It's optional; the card falls back to an icon.
 */
const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    date: { type: String, default: '', trim: true }, // free text, e.g. "Aug 2026"
    location: { type: String, default: '', trim: true },
    description: { type: String, default: '', trim: true },
    images: { type: [String], default: [] }, // data URLs (data:image/...;base64,…)
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
)

eventSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id
    delete ret._id
    delete ret.__v
    return ret
  },
})

export default mongoose.model('Event', eventSchema)
