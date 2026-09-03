import mongoose from 'mongoose'

/** A certification / achievement entry shown on the journey timeline. */
const certificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    issuer: { type: String, default: '', trim: true },
    date: { type: String, default: '', trim: true },
    credentialId: { type: String, default: '', trim: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
)

certificationSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id
    delete ret._id
    delete ret.__v
    return ret
  },
})

export default mongoose.model('Certification', certificationSchema)
