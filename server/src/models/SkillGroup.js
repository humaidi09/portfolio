import mongoose from 'mongoose'
import { jsonOptions } from '../lib/model.js'

/** A named group of skills (e.g. "Core CS skills") shown in the Skills section. */
const skillGroupSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    items: { type: [String], default: [] },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
)

skillGroupSchema.set('toJSON', jsonOptions)

export default mongoose.model('SkillGroup', skillGroupSchema)
