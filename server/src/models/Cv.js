import mongoose from 'mongoose'

/**
 * The single current CV. Only one document is ever kept (a fixed `_id` of
 * "current"), so uploading a new CV overwrites the old one. The PDF is stored
 * inline as base64 — fine for a one-file CV on the free tier, and it keeps the
 * whole app on MongoDB with no extra file-storage service.
 */
const cvSchema = new mongoose.Schema(
  {
    _id: { type: String, default: 'current' },
    filename: { type: String, default: 'CV.pdf' },
    mimeType: { type: String, default: 'application/pdf' },
    data: { type: String, required: true }, // base64, no data-URL prefix
    size: { type: Number, default: 0 }, // bytes
  },
  { timestamps: true, versionKey: false },
)

export default mongoose.model('Cv', cvSchema)
