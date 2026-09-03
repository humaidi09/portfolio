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

export const api = {
  // Public
  listProjects: () => request('/api/projects'),

  // Admin
  login: (password) => request('/api/auth/login', { method: 'POST', body: { password } }),
  createProject: (project, token) =>
    request('/api/projects', { method: 'POST', body: project, token }),
  updateProject: (id, project, token) =>
    request(`/api/projects/${id}`, { method: 'PUT', body: project, token }),
  deleteProject: (id, token) =>
    request(`/api/projects/${id}`, { method: 'DELETE', token }),
}
