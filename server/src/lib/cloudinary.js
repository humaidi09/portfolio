// Cloudinary signed direct-upload helpers — no SDK, just Node crypto + fetch.
// The API secret lives only here (server env) and never reaches the browser:
// we hand the client a short-lived signature, and it uploads the file bytes
// straight to Cloudinary. Deletes are proxied through the server (they need the
// secret too). Env: CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET.
import crypto from 'node:crypto'

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || ''
const API_KEY = process.env.CLOUDINARY_API_KEY || ''
const API_SECRET = process.env.CLOUDINARY_API_SECRET || ''

/** True once all three Cloudinary env vars are set — routes 503 otherwise. */
export function cloudinaryConfigured() {
  return Boolean(CLOUD_NAME && API_KEY && API_SECRET)
}

// Never signed / never part of the signature string, per Cloudinary's spec.
const UNSIGNED = new Set(['file', 'api_key', 'resource_type', 'cloud_name'])

/**
 * Cloudinary signature: the params to sign, sorted by key and joined as
 * `k=v&k=v` (raw values, not URL-encoded), API secret appended, SHA-1 hex.
 */
export function signParams(params = {}) {
  const toSign = Object.entries(params)
    .filter(([k, v]) => v !== undefined && v !== null && v !== '' && !UNSIGNED.has(k))
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([k, v]) => `${k}=${v}`)
    .join('&')
  return crypto.createHash('sha1').update(toSign + API_SECRET).digest('hex')
}

/**
 * Fields the browser needs to POST a signed upload directly to Cloudinary.
 * `resourceType` is 'image' or 'video'; `folder` keeps assets tidy per kind.
 */
export function signedUpload({ folder = 'portfolio', resourceType = 'image' } = {}) {
  const timestamp = Math.floor(Date.now() / 1000)
  const signature = signParams({ folder, timestamp })
  return {
    cloudName: CLOUD_NAME,
    apiKey: API_KEY,
    timestamp,
    folder,
    signature,
    uploadUrl: `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`,
  }
}

/** Delete an asset by public_id via Cloudinary's REST destroy endpoint. */
export async function destroyAsset(publicId, resourceType = 'image') {
  if (!cloudinaryConfigured()) throw new Error('Cloudinary is not configured.')
  const timestamp = Math.floor(Date.now() / 1000)
  const signature = signParams({ public_id: publicId, timestamp })
  const body = new URLSearchParams({
    public_id: publicId,
    timestamp: String(timestamp),
    api_key: API_KEY,
    signature,
  })
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/destroy`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data?.error?.message || 'Cloudinary destroy failed.')
  return data // { result: 'ok' | 'not found' }
}
