import mongoose from 'mongoose'

/** A role / involvement entry shown on the journey timeline. */
const experienceSchema = new mongoose.Schema(
  {
    role: { type: String, required: true, trim: true },
    organization: { type: String, required: true, trim: true },
    period: { type: String, default: '', trim: true },
    skills: { type: [String], default: [] },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
)

experienceSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id
    delete ret._id
    delete ret.__v
    return ret
  },
})

export default mongoose.model('Experience', experienceSchema)
