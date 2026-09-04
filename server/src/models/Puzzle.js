import mongoose from 'mongoose'

/**
 * A "guess the output" puzzle for the hero terminal (guess.cpp). `code` is the
 * C++ snippet, `options` the three answer choices, `answer` the 0-based index of
 * the correct one, and `note` a one-line explanation shown after a guess.
 * Managed from /admin → Puzzles; read publicly by the widget.
 */
const puzzleSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, trim: true, maxlength: 2000 },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length >= 2 && arr.length <= 6,
        message: 'A puzzle needs between 2 and 6 options.',
      },
    },
    // 0-based index into `options`. Validated against the array length on save.
    answer: { type: Number, required: true, min: 0, default: 0 },
    note: { type: String, default: '', trim: true, maxlength: 500 },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
)

// Keep `answer` in range for whatever options were provided.
puzzleSchema.pre('validate', function ensureAnswerInRange(next) {
  if (Array.isArray(this.options) && this.answer >= this.options.length) {
    this.invalidate('answer', 'The correct-answer index is outside the options list.')
  }
  next()
})

puzzleSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id
    delete ret._id
    delete ret.__v
    return ret
  },
})

export default mongoose.model('Puzzle', puzzleSchema)
