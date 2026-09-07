// Direct browser → Cloudinary uploads. The server signs a short-lived request
// (its API secret never leaves the backend); we then POST the raw file straight
// to Cloudinary, so large photos never travel base64 through Mongo/Render.
import { api } from './api'

/**
 * Upload one image file to Cloudinary and return its hosted URL + handle.
 *
 * @param {File} file
 * @param {object} opts
 * @param {string} opts.token        admin JWT (required — /sign is admin-gated)
 * @param {string} [opts.folder]     Cloudinary folder, e.g. "portfolio/gallery"
 * @param {'image'|'video'} [opts.resourceType]
 * @param {(pct:number)=>void} [opts.onProgress]  0–100 upload progress
 * @param {AbortSignal} [opts.signal]
 * @returns {Promise<{url:string, publicId:string, width:number, height:number, bytes:number, format:string}>}
 */
export async function uploadToCloudinary(
  file,
  { token, folder = 'portfolio', resourceType = 'image', onProgress, signal } = {},
) {
  // 1. Ask our server to sign the upload (secret stays server-side).
  const sig = await api.signUpload({ folder, resourceType }, token)

  // 2. POST the bytes straight to Cloudinary with exactly the signed params.
  const body = new FormData()
  body.append('file', file)
  body.append('api_key', sig.apiKey)
  body.append('timestamp', String(sig.timestamp))
  body.append('folder', sig.folder)
  body.append('signature', sig.signature)

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', sig.uploadUrl)
    xhr.responseType = 'json'

    if (onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100))
      }
    }
    xhr.onload = () => {
      const data = xhr.response
      if (xhr.status >= 200 && xhr.status < 300 && data?.secure_url) {
        resolve({
          url: data.secure_url,
          publicId: data.public_id,
          width: data.width,
          height: data.height,
          bytes: data.bytes,
          format: data.format,
        })
      } else {
        reject(new Error(data?.error?.message || `Upload failed (HTTP ${xhr.status}).`))
      }
    }
    xhr.onerror = () => reject(new Error('Network error while uploading.'))
    xhr.onabort = () => reject(new DOMException('Upload cancelled', 'AbortError'))

    if (signal) {
      if (signal.aborted) return xhr.abort()
      signal.addEventListener('abort', () => xhr.abort(), { once: true })
    }
    xhr.send(body)
  })
}
