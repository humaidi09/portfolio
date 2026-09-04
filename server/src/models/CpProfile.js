import mongoose from 'mongoose'

/**
 * One competitive-programming judge card (Codeforces, LeetCode, AtCoder, …).
 *
 * `source` decides how the frontend fills the card:
 *   'codeforces' | 'atcoder' → live stats fetched in the browser (src/lib/cp.js)
 *   'link'                    → the manual `stats` object is shown as-is
 * `profileUrl` is a plain string template with a `{handle}` placeholder the UI
 * interpolates (kept serializable — no function to persist). `stats` is free-form
 * (rating / solved / submissions / activeDays / maxStreak / note) so link judges
 * can surface whatever numbers they expose.
 */
const cpSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    mono: { type: String, default: '', trim: true },
    source: { type: String, default: 'link', trim: true }, // 'link' | 'codeforces' | 'atcoder'
    accent: { type: String, default: '', trim: true },
    handle: { type: String, default: '', trim: true },
    logo: { type: String, default: '', trim: true },
    logoClass: { type: String, default: '', trim: true },
    profileUrl: { type: String, default: '', trim: true }, // e.g. https://…/{handle}
    solvedOverride: { type: Number, default: null }, // "132+" lifetime figure; null = use live tally
    stats: { type: mongoose.Schema.Types.Mixed, default: undefined },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
)

cpSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id
    delete ret._id
    delete ret.__v
    return ret
  },
})

export default mongoose.model('CpProfile', cpSchema)
