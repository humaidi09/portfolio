// Thin API client for the portfolio backend. The base URL comes from
// VITE_API_URL (see .env); it falls back to the local dev server.
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000'

const TOKEN_KEY = 'portfolio_admin_token'

export const auth = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
}

/** Core fetch wrapper: JSON in/out, bearer token, readable errors. */
async function request(path, { method = 'GET', body, token } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })

  const data = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(data?.error || `Request failed (${res.status}).`)
  }
  return data
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
