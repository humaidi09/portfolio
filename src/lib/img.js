// Cloudinary delivery helper. Given a stored image URL, inject on-the-fly
// transforms (auto format → WebP/AVIF, auto quality, a width cap) so the
// browser downloads a right-sized, modern-format image instead of the raw
// full-resolution upload. This is delivery-only — the original stays untouched
// in Cloudinary, and nothing about the stored value in Mongo changes.
//
// Anything that is NOT a Cloudinary upload URL (legacy base64 data URLs, or a
// stray external URL) is returned verbatim, so old records keep working.

/**
 * @param {string} url         the stored image URL (secure_url or legacy base64)
 * @param {object} [opts]
 * @param {number} [opts.width]   max width in px (Cloudinary w_)
 * @returns {string}
 */
export function cldnr(url, { width = 1200 } = {}) {
  if (typeof url !== 'string' || !url) return url
  // Only rewrite Cloudinary delivery URLs, which always contain "/upload/".
  const marker = '/upload/'
  const at = url.indexOf(marker)
  if (!url.includes('res.cloudinary.com') || at === -1) return url

  // If we've already inserted a transform (idempotent), leave it alone.
  const after = url.slice(at + marker.length)
  if (/^(f_auto|q_auto|w_\d)/.test(after)) return url

  const t = `f_auto,q_auto,w_${width},c_limit,dpr_auto`
  return `${url.slice(0, at + marker.length)}${t}/${after}`
}
