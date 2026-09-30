import mongoose from 'mongoose'

/**
 * A single editable dataset belonging to one of the standalone apps (worldcup,
 * restaurant, cgpa, nonet, banking, login). Each app owns several datasets,
 * addressed by (`app`, `slug`) — e.g. ('restaurant', 'menu'), ('worldcup', 'teams').
 *
 * The payload lives in `data` as free-form JSON: an **array of rows** when
 * `kind === 'list'` (a table the owner edits row-by-row) or a plain **object**
 * when `kind === 'singleton'` (a settings form). `fields`/`fieldTypes` describe
 * the columns so the /admin editor can render proper inputs even for an empty
 * set. Each standalone app reads its datasets from `/api/app-data/:app` and
 * falls back to its bundled copy when offline, so this collection is the live
 * source of truth without ever breaking a first paint.
 */
const appDatasetSchema = new mongoose.Schema(
  {
    app: { type: String, required: true, index: true },
    slug: { type: String, required: true },
    kind: { type: String, enum: ['list', 'singleton'], default: 'list' },
    // Human label shown in the admin editor (e.g. "Menu items").
    label: { type: String, default: '' },
    // Ordered field/column names for the editor.
    fields: { type: [String], default: () => [] },
    // Per-field input hint: 'string' | 'number' | 'boolean' | 'json'. Anything
    // missing defaults to 'string'. Nested values (arrays/objects) use 'json'.
    fieldTypes: { type: mongoose.Schema.Types.Mixed, default: () => ({}) },
    // The payload: an array of row objects (list) or one object (singleton).
    data: { type: mongoose.Schema.Types.Mixed, default: () => [] },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
)

// One document per (app, slug).
appDatasetSchema.index({ app: 1, slug: 1 }, { unique: true })

appDatasetSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id
    delete ret._id
    return ret
  },
})

export default mongoose.model('AppDataset', appDatasetSchema)
