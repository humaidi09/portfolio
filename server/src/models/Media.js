import mongoose from 'mongoose'
import { jsonOptions } from '../lib/model.js'

/**
 * One record per uploaded object in Cloudinary — the backing store for the CMS
 * Media library. Written server-side after an upload succeeds; `publicId` is
 * the Cloudinary handle used to serve and (later) destroy the asset.
 */
const mediaSchema = new mongoose.Schema(
  {
    publicId: { type: String, required: true, unique: true, trim: true },
    url: { type: String, required: true },
    filename: { type: String, default: '' },
    mimeType: { type: String, default: '' },
    size: { type: Number, default: 0 }, // bytes
    kind: { type: String, enum: ['image', 'video'], required: true },
  },
  { timestamps: true },
)

mediaSchema.set('toJSON', jsonOptions)

export default mongoose.model('Media', mediaSchema)
