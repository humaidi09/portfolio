// Thin API client for the portfolio backend. The base URL comes from
// VITE_API_URL (see .env); it falls back to the local dev server.
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000'

const TOKEN_KEY = 'portfolio_admin_token'

export const auth = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
}

// The API runs on Render's free tier, which spins the instance down after ~15
// min idle; the next request then waits ~20-50s for a cold start. While waking,
// Render returns 502/503/504 (or the socket fails outright) BEFORE our Express
// app sees the request — so retrying is safe even for POST/PUT: the server never
// processed it. We retry those "server not ready" signals on a ~60s budget so a
// save fired at a sleeping backend transparently waits for it to wake, instead
// of surfacing as an error. A real 4xx/5xx from the app itself is not retried.
const COLD_START_STATUSES = new Set([502, 503, 504])
const RETRY_DELAYS_MS = [2000, 4000, 6000, 8000, 10000, 12000, 15000] // ~57s total
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/** Core fetch wrapper: JSON in/out, bearer token, readable errors, cold-start retry. */
async function request(path, { method = 'GET', body, token } = {}) {
  const init = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  }

  for (let attempt = 0; ; attempt++) {
    let res
    try {
      res = await fetch(`${BASE}${path}`, init)
    } catch (err) {
      // Network-level failure (server asleep / unreachable). Retry within budget.
      if (attempt < RETRY_DELAYS_MS.length) {
        await sleep(RETRY_DELAYS_MS[attempt])
        continue
      }
      throw new Error('Could not reach the server. Please try again.')
    }

    // Render is still waking — retry rather than fail the user's action.
    if (COLD_START_STATUSES.has(res.status) && attempt < RETRY_DELAYS_MS.length) {
      await sleep(RETRY_DELAYS_MS[attempt])
      continue
    }

    const data = await res.json().catch(() => null)
    if (!res.ok) {
      throw new Error(data?.error || `Request failed (${res.status}).`)
    }
    return data
  }
}

// Fire-and-forget wake-up ping. Called when the admin panel mounts so the free-
// tier backend starts its cold start while the user is still typing/logging in,
// making the first real save land on an already-awake server.
export function warmApi() {
  fetch(`${BASE}/api/health`).catch(() => {})
}

/** Build a `?a=1&b=2` query string, dropping empty/null values. */
function qs(params) {
  if (!params) return ''
  const entries = Object.entries(params).filter(([, v]) => v != null && v !== '')
  return entries.length ? `?${new URLSearchParams(entries)}` : ''
}

// Absolute URL to the CV download — used directly as an href/src.
export const cvUrl = `${BASE}/api/cv`

export const api = {
  // Public
  listProjects: () => request('/api/projects'),
  getProfile: () => request('/api/profile'),
  sendMessage: (msg) => request('/api/messages', { method: 'POST', body: msg }),
  cvMeta: () => request('/api/cv/meta'),
  listPuzzles: () => request('/api/puzzles'),
  // Log a wrong guess from the hero game (public, rate-limited, fire-and-forget).
  logWrongAnswer: (body) => request('/api/wrong-answers', { method: 'POST', body }),

  // Admin
  login: (password) => request('/api/auth/login', { method: 'POST', body: { password } }),
  createProject: (project, token) =>
    request('/api/projects', { method: 'POST', body: project, token }),
  updateProject: (id, project, token) =>
    request(`/api/projects/${id}`, { method: 'PUT', body: project, token }),
  deleteProject: (id, token) =>
    request(`/api/projects/${id}`, { method: 'DELETE', token }),

  // Admin — messages
  listMessages: (token) => request('/api/messages', { token }),
  markMessage: (id, read, token) =>
    request(`/api/messages/${id}`, { method: 'PATCH', body: { read }, token }),
  deleteMessage: (id, token) =>
    request(`/api/messages/${id}`, { method: 'DELETE', token }),

  // Admin — CV
  uploadCv: (payload, token) => request('/api/cv', { method: 'PUT', body: payload, token }),
  deleteCv: (token) => request('/api/cv', { method: 'DELETE', token }),

  // Admin — profile (site identity singleton)
  updateProfile: (body, token) => request('/api/profile', { method: 'PUT', body, token }),

  // App content — the editable data behind the standalone apps. Reads are public
  // (each app fetches its own datasets at boot); the write is admin-only and
  // upserts a whole dataset (a list table or a settings object) in one request.
  listAppData: () => request('/api/app-data'),
  listAppDataFor: (app) => request(`/api/app-data/${app}`),
  updateAppDataset: (app, slug, body, token) =>
    request(`/api/app-data/${app}/${slug}`, { method: 'PUT', body, token }),
  deleteAppDataset: (app, slug, token) =>
    request(`/api/app-data/${app}/${slug}`, { method: 'DELETE', token }),

  // Admin — media uploads (Cloudinary signed direct-to-cloud). `signUpload`
  // returns the short-lived fields the browser POSTs with the file straight to
  // Cloudinary (see src/lib/upload.js); `destroyAsset` removes an asset by its
  // public_id when a photo/event image is deleted.
  signUpload: (body, token) => request('/api/media/sign', { method: 'POST', body, token }),
  destroyAsset: (body, token) => request('/api/media/destroy', { method: 'POST', body, token }),

  // Admin — wrong-answer log (from the hero game)
  listWrongAnswers: (token) => request('/api/wrong-answers', { token }),
  deleteWrongAnswer: (id, token) =>
    request(`/api/wrong-answers/${id}`, { method: 'DELETE', token }),
  clearWrongAnswers: (token) => request('/api/wrong-answers', { method: 'DELETE', token }),

  // Public — content collections
  listExperiences: () => request('/api/experiences'),
  listCertifications: () => request('/api/certifications'),
  listStats: () => request('/api/stats'),
  listResults: () => request('/api/results'),
  listEvents: () => request('/api/events'),
  listGallery: () => request('/api/gallery'),
  listCp: () => request('/api/competitive-programming'),
  listSkillGroups: () => request('/api/skill-groups'),

  // Public — blog. Published content only; when a valid admin token is passed
  // the server also returns drafts (used by the CMS list views). `params` may
  // carry { q, category, tag } for server-side filtering.
  listPosts: ({ token, ...params } = {}) => request(`/api/posts${qs(params)}`, { token }),
  getPost: (slug, token) => request(`/api/posts/${slug}`, { token }),
  listVideos: ({ token, ...params } = {}) => request(`/api/videos${qs(params)}`, { token }),
  getVideo: (slug, token) => request(`/api/videos/${slug}`, { token }),
  listPhotos: ({ token, ...params } = {}) => request(`/api/photos${qs(params)}`, { token }),
  getPhoto: (slug, token) => request(`/api/photos/${slug}`, { token }),
  listCategories: () => request('/api/categories'),
  listTags: () => request('/api/tags'),
  blogSummary: (token) => request('/api/blog/summary', { token }),

  // Admin — content collections (generic create/update/delete)
  create: (resource, body, token) =>
    request(`/api/${resource}`, { method: 'POST', body, token }),
  update: (resource, id, body, token) =>
    request(`/api/${resource}/${id}`, { method: 'PUT', body, token }),
  remove: (resource, id, token) =>
    request(`/api/${resource}/${id}`, { method: 'DELETE', token }),
}
