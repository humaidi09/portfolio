import mongoose from 'mongoose'

/** A single hero/summary stat (e.g. "Current CGPA" → 3.85 / 4.00). */
const statSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
    value: { type: String, default: '', trim: true }, // string so "3.85" and "3" both work
    suffix: { type: String, default: '', trim: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
)

statSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id
    delete ret._id
    delete ret.__v
    return ret
  },
})

export default mongoose.model('Stat', statSchema)
