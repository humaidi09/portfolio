import mongoose from 'mongoose'

/**
 * The site's personal identity — a single document (like the CV, one record only).
 * Mirrors `personalInfo` in `src/data/portfolioData.js` plus the Hero terminal-CV
 * skill lists, so every piece of identity text becomes editable from /admin and
 * flows to the site through the API instead of being hardcoded in components.
 */
const profileSchema = new mongoose.Schema(
  {
    name: { type: String, default: '' },
    // Hero/Navbar headshot — a base64 data URL or a path like "/profile.jpg".
    photo: { type: String, default: '' },
    role: { type: String, default: '' },
    tagline: { type: String, default: '' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    github: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    whatsapp: { type: String, default: '' },
    facebook: { type: String, default: '' },
    instagram: { type: String, default: '' },
    twitter: { type: String, default: '' },
    university: { type: String, default: '' },
    degree: { type: String, default: '' },
    gpa: { type: String, default: '' },
    semester: { type: String, default: '' },
    bio: { type: String, default: '' },
    // The Hero terminal-CV skill lists (rendered as the typed résumé text).
    skillLanguages: { type: [String], default: [] },
    skillCoreCS: { type: [String], default: [] },
    skillTools: { type: [String], default: [] },
  },
  { timestamps: true },
)

// Return a clean object to the client: `id` instead of `_id`, no `__v`.
profileSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id
    delete ret._id
    return ret
  },
})

export default mongoose.model('Profile', profileSchema)
