// Small shared helpers for the blog Mongoose models.

/** URL-safe slug from a title/name: lowercase, punctuation dropped, spaces → "-". */
export function slugify(str = '') {
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // drop punctuation
    .replace(/[\s_-]+/g, '-') // collapse whitespace/underscores to a single hyphen
    .replace(/^-+|-+$/g, '') // trim leading/trailing hyphens
}

// Return a clean object to the client: `id` instead of `_id`, no `__v`.
// Mirrors the inline transform the existing models (Project.js …) use.
export const jsonOptions = {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id
    delete ret._id
    return ret
  },
}
