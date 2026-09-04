import mongoose from 'mongoose'

/**
 * A single gallery photo. `image` holds a base64 data URL so the picture
 * travels with the record — no separate file store. `caption` is optional and
 * shown under the photo / in the lightbox.
 */
const gallerySchema = new mongoose.Schema(
  {
    image: { type: String, required: true }, // data URL (data:image/...;base64,…)
    caption: { type: String, default: '', trim: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
)

gallerySchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id
    delete ret._id
    delete ret.__v
    return ret
  },
})

export default mongoose.model('Gallery', gallerySchema)
