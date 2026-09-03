import { useEffect, useState } from 'react'
import { ArrowLeft, LogOut, Pencil, Plus, Trash2 } from 'lucide-react'
import { api, auth } from '../lib/api'
import { useToast } from '../context/ToastContext'

/**
 * Single-admin panel for managing projects without touching code.
 * Login (password → JWT in localStorage) then create / edit / delete.
 * Reachable at /admin; reads are public, writes send the bearer token.
 */
export default function Admin() {
  const [token, setToken] = useState(() => auth.get())

  if (!token) return <Login onAuthed={(t) => setToken(t)} />
  return <Dashboard token={token} onLogout={() => { auth.clear(); setToken(null) }} />
}

function Login({ onAuthed }) {
  const { toast } = useToast()
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    try {
      const { token } = await api.login(password)
      auth.set(token)
      onAuthed(token)
    } catch (err) {
      toast({ type: 'error', title: 'Login failed', message: err.message })
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="grid min-h-screen place-items-center px-4">
      <form onSubmit={submit} className="glass-strong w-full max-w-sm rounded-2xl p-8">
        <a href="/" className="mb-6 inline-flex items-center gap-1.5 font-mono text-xs text-muted hover:text-ink">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to site
        </a>
        <h1 className="font-display text-2xl font-bold text-ink">Admin</h1>
        <p className="mt-1 text-sm text-muted">Sign in to manage projects.</p>

        <label className="mt-6 block text-sm font-medium text-ink" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-2 w-full rounded-xl border border-hair bg-fill px-4 py-2.5 text-ink outline-none transition-colors focus:border-neonCyan"
          placeholder="••••••••"
        />

        <button
          type="submit"
          disabled={busy || !password}
          className="mt-5 w-full rounded-xl bg-neonCyan px-5 py-2.5 font-semibold text-void transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </main>
  )
}

const EMPTY = { slug: '', title: '', category: '', tech: '', summary: '', details: '', github: '', demo: '', order: 0 }

function Dashboard({ token, onLogout }) {
  const { toast } = useToast()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null) // project object or EMPTY (new) or null (list)

  async function load() {
    setLoading(true)
    try {
      setProjects(await api.listProjects())
    } catch (err) {
      toast({ type: 'error', title: 'Could not load projects', message: err.message })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function save(form) {
    const payload = { ...form, tech: form.tech }
    try {
      if (form.id) {
        await api.updateProject(form.id, payload, token)
        toast({ type: 'success', title: 'Saved', message: `Updated “${form.title}”.` })
      } else {
        await api.createProject(payload, token)
        toast({ type: 'success', title: 'Created', message: `Added “${form.title}”.` })
      }
      setEditing(null)
      load()
    } catch (err) {
      // Expired/invalid token → force re-login.
      if (/401|unauth|token/i.test(err.message)) onLogout()
      toast({ type: 'error', title: 'Save failed', message: err.message })
    }
  }

  async function remove(p) {
    if (!confirm(`Delete “${p.title}”? This cannot be undone.`)) return
    try {
      await api.deleteProject(p.id, token)
      toast({ type: 'success', title: 'Deleted', message: `Removed “${p.title}”.` })
      load()
    } catch (err) {
      if (/401|unauth|token/i.test(err.message)) onLogout()
      toast({ type: 'error', title: 'Delete failed', message: err.message })
    }
  }

  if (editing) {
    return <ProjectForm initial={editing} onCancel={() => setEditing(null)} onSave={save} />
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <a href="/" className="inline-flex items-center gap-1.5 font-mono text-xs text-muted hover:text-ink">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to site
          </a>
          <h1 className="mt-2 font-display text-3xl font-bold text-ink">Projects</h1>
          <p className="mt-1 text-sm text-muted">{projects.length} total</p>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="inline-flex items-center gap-2 rounded-xl border border-hair bg-fill px-4 py-2 text-sm font-medium text-muted hover:text-ink"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </div>

      <button
        type="button"
        onClick={() => setEditing({ ...EMPTY })}
        className="mt-8 inline-flex items-center gap-2 rounded-xl bg-neonCyan px-5 py-2.5 font-semibold text-void transition-opacity hover:opacity-90"
      >
        <Plus className="h-4 w-4" />
        New project
      </button>

      {loading ? (
        <p className="mt-8 text-muted">Loading…</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {projects.map((p) => (
            <li key={p.id} className="glass flex items-center justify-between gap-4 rounded-xl p-4">
              <div className="min-w-0">
                <p className="truncate font-medium text-ink">{p.title}</p>
                <p className="truncate font-mono text-xs text-muted">{p.category} · {p.slug}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => setEditing({ ...p, tech: (p.tech || []).join(', ') })}
                  aria-label={`Edit ${p.title}`}
                  className="grid h-9 w-9 place-items-center rounded-lg border border-hair bg-fill text-muted hover:text-ink"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => remove(p)}
                  aria-label={`Delete ${p.title}`}
                  className="grid h-9 w-9 place-items-center rounded-lg border border-hair bg-fill text-muted hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}

function ProjectForm({ initial, onCancel, onSave }) {
  const [form, setForm] = useState(initial)
  const [busy, setBusy] = useState(false)

  function set(key) {
    return (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  }

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    await onSave(form)
    setBusy(false)
  }

  const field = 'mt-1.5 w-full rounded-xl border border-hair bg-fill px-4 py-2.5 text-ink outline-none transition-colors focus:border-neonCyan'
  const label = 'block text-sm font-medium text-ink'

  return (
    <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <button type="button" onClick={onCancel} className="inline-flex items-center gap-1.5 font-mono text-xs text-muted hover:text-ink">
        <ArrowLeft className="h-3.5 w-3.5" />
        Cancel
      </button>
      <h1 className="mt-2 font-display text-3xl font-bold text-ink">
        {form.id ? 'Edit project' : 'New project'}
      </h1>

      <form onSubmit={submit} className="mt-8 space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={label} htmlFor="title">Title</label>
            <input id="title" required value={form.title} onChange={set('title')} className={field} />
          </div>
          <div>
            <label className={label} htmlFor="slug">Slug</label>
            <input id="slug" required value={form.slug} onChange={set('slug')} className={field} placeholder="my-project" />
          </div>
          <div>
            <label className={label} htmlFor="category">Category</label>
            <input id="category" value={form.category} onChange={set('category')} className={field} />
          </div>
          <div>
            <label className={label} htmlFor="order">Order</label>
            <input id="order" type="number" value={form.order} onChange={set('order')} className={field} />
          </div>
        </div>

        <div>
          <label className={label} htmlFor="tech">Tech <span className="font-normal text-muted">(comma-separated)</span></label>
          <input id="tech" value={form.tech} onChange={set('tech')} className={field} placeholder="C++, OOP, File I/O" />
        </div>

        <div>
          <label className={label} htmlFor="summary">Summary</label>
          <textarea id="summary" rows={2} value={form.summary} onChange={set('summary')} className={field} />
        </div>

        <div>
          <label className={label} htmlFor="details">Details</label>
          <textarea id="details" rows={4} value={form.details} onChange={set('details')} className={field} />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={label} htmlFor="github">GitHub URL</label>
            <input id="github" value={form.github} onChange={set('github')} className={field} placeholder="https://github.com/…" />
          </div>
          <div>
            <label className={label} htmlFor="demo">Demo URL</label>
            <input id="demo" value={form.demo} onChange={set('demo')} className={field} placeholder="https://… (optional)" />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={busy}
            className="rounded-xl bg-neonCyan px-6 py-2.5 font-semibold text-void transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {busy ? 'Saving…' : 'Save'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-hair bg-fill px-6 py-2.5 font-semibold text-ink hover:bg-fill-strong"
          >
            Cancel
          </button>
        </div>
      </form>
    </main>
  )
}
