import mongoose from 'mongoose'

/**
 * A logged wrong guess from the hero terminal game. The game has no login, so
 * "who" is best-effort: we store what the snippet was, which option they picked
 * vs. the correct one, and when. Written by the public POST /api/wrong-answers
 * route (rate-limited), read/cleared by the admin.
 */
const wrongAnswerSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, trim: true, maxlength: 2000 },
    chosen: { type: String, default: '', trim: true, maxlength: 200 }, // the option they picked
    correct: { type: String, default: '', trim: true, maxlength: 200 }, // the right option
  },
  { timestamps: true },
)

wrongAnswerSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id
    delete ret._id
    delete ret.__v
    return ret
  },
})

export default mongoose.model('WrongAnswer', wrongAnswerSchema)
