import mongoose from 'mongoose'

/** A semester academic result: GPA for a given term. */
const resultSchema = new mongoose.Schema(
  {
    term: { type: String, required: true, trim: true }, // e.g. "3rd Semester"
    gpa: { type: String, default: '', trim: true }, // e.g. "3.85"
    scale: { type: String, default: '4.00', trim: true },
    note: { type: String, default: '', trim: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
)

resultSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id
    delete ret._id
    delete ret.__v
    return ret
  },
})

export default mongoose.model('Result', resultSchema)
