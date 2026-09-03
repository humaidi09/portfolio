import { useEffect, useRef, useState } from 'react'
import {
  Award, ArrowLeft, BarChart3, Briefcase, FileText, FolderKanban, GraduationCap,
  Inbox, LogOut, Mail, Pencil, Plus, Trash2, Upload, X,
} from 'lucide-react'
import { api, auth, cvUrl } from '../lib/api'
import { useToast } from '../context/ToastContext'

/**
 * Single-admin panel. Login (password → JWT in localStorage) then manage
 * projects, read contact messages, and upload the CV. Reachable at /admin.
 */
export default function Admin() {
  const [token, setToken] = useState(() => auth.get())

  if (!token) return <Login onAuthed={(t) => setToken(t)} />
  return <Dashboard token={token} onLogout={() => { auth.clear(); setToken(null) }} />
}

/** Shared "your token expired" handler for any admin request. */
function useAuthedAction(onLogout) {
  const { toast } = useToast()
  return async (fn, { onError } = {}) => {
    try {
      return await fn()
    } catch (err) {
      if (/401|unauth|token|expired/i.test(err.message)) {
        toast({ type: 'error', title: 'Session expired', message: 'Please sign in again.' })
        onLogout()
      } else {
        toast({ type: 'error', title: 'Something went wrong', message: err.message })
        onError?.(err)
      }
      throw err
    }
  }
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
        <p className="mt-1 text-sm text-muted">Sign in to manage your portfolio.</p>

        <label className="mt-6 block text-sm font-medium text-ink" htmlFor="password">Password</label>
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

const TABS = [
  { id: 'projects', label: 'Projects', Icon: FolderKanban },
  { id: 'experiences', label: 'Experience', Icon: Briefcase },
  { id: 'certifications', label: 'Certs', Icon: Award },
  { id: 'results', label: 'Results', Icon: GraduationCap },
  { id: 'stats', label: 'Stats', Icon: BarChart3 },
  { id: 'messages', label: 'Messages', Icon: Inbox },
  { id: 'cv', label: 'CV', Icon: FileText },
]

/**
 * Field definitions for the simple content collections. Each drives a generic
 * list + form (CollectionTab). `type: 'tags'` renders as a comma-separated
 * input and is sent as an array; everything else is a plain text field.
 */
const COLLECTIONS = {
  experiences: {
    label: 'experience',
    resource: 'experiences',
    list: api.listExperiences,
    titleKey: 'role',
    subKey: 'organization',
    fields: [
      { key: 'role', label: 'Role', required: true },
      { key: 'organization', label: 'Organization', required: true },
      { key: 'period', label: 'Period', placeholder: 'Jul 2026 – Present' },
      { key: 'skills', label: 'Skills', type: 'tags', placeholder: 'Leadership, Teamwork' },
    ],
  },
  certifications: {
    label: 'certification',
    resource: 'certifications',
    list: api.listCertifications,
    titleKey: 'title',
    subKey: 'issuer',
    fields: [
      { key: 'title', label: 'Title', required: true },
      { key: 'issuer', label: 'Issuer' },
      { key: 'date', label: 'Date', placeholder: 'Jul 2026' },
      { key: 'credentialId', label: 'Credential ID', placeholder: 'optional' },
    ],
  },
  results: {
    label: 'result',
    resource: 'results',
    list: api.listResults,
    titleKey: 'term',
    subKey: 'gpa',
    fields: [
      { key: 'term', label: 'Term', required: true, placeholder: '3rd Semester' },
      { key: 'gpa', label: 'GPA', placeholder: '3.85' },
      { key: 'scale', label: 'Scale', placeholder: '4.00' },
      { key: 'note', label: 'Note', placeholder: 'optional' },
    ],
  },
  stats: {
    label: 'stat',
    resource: 'stats',
    list: api.listStats,
    titleKey: 'label',
    subKey: 'value',
    fields: [
      { key: 'label', label: 'Label', required: true, placeholder: 'Current CGPA' },
      { key: 'value', label: 'Value', placeholder: '3.85' },
      { key: 'suffix', label: 'Suffix', placeholder: ' / 4.00' },
    ],
  },
}

function Dashboard({ token, onLogout }) {
  const [tab, setTab] = useState('projects')
  const [unread, setUnread] = useState(0)

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="flex items-center justify-between">
        <a href="/" className="inline-flex items-center gap-1.5 font-mono text-xs text-muted hover:text-ink">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to site
        </a>
        <button
          type="button"
          onClick={onLogout}
          className="inline-flex items-center gap-2 rounded-xl border border-hair bg-fill px-4 py-2 text-sm font-medium text-muted hover:text-ink"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </div>

      <h1 className="mt-4 font-display text-3xl font-bold text-ink">Dashboard</h1>

      {/* Tabs */}
      <div className="mt-6 flex flex-wrap gap-2">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              tab === id ? 'border-transparent bg-neonCyan text-void' : 'border-hair bg-fill text-muted hover:text-ink'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
            {id === 'messages' && unread > 0 && (
              <span className={`ml-0.5 rounded-full px-1.5 text-[10px] font-bold ${tab === id ? 'bg-void/20 text-void' : 'bg-neonCyan text-void'}`}>
                {unread}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {tab === 'projects' && <ProjectsTab token={token} onLogout={onLogout} />}
        {COLLECTIONS[tab] && (
          <CollectionTab key={tab} config={COLLECTIONS[tab]} token={token} onLogout={onLogout} />
        )}
        {tab === 'messages' && <MessagesTab token={token} onLogout={onLogout} onUnread={setUnread} />}
        {tab === 'cv' && <CvTab token={token} onLogout={onLogout} />}
      </div>
    </main>
  )
}

/* ─────────────────────────── Projects ─────────────────────────── */

const EMPTY = { slug: '', title: '', category: '', tech: '', summary: '', details: '', github: '', demo: '', order: 0 }

function ProjectsTab({ token, onLogout }) {
  const { toast } = useToast()
  const run = useAuthedAction(onLogout)
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)

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
    await run(async () => {
      if (form.id) {
        await api.updateProject(form.id, form, token)
        toast({ type: 'success', title: 'Saved', message: `Updated “${form.title}”.` })
      } else {
        await api.createProject(form, token)
        toast({ type: 'success', title: 'Created', message: `Added “${form.title}”.` })
      }
      setEditing(null)
      load()
    }).catch(() => {})
  }

  async function remove(p) {
    if (!confirm(`Delete “${p.title}”? This cannot be undone.`)) return
    await run(async () => {
      await api.deleteProject(p.id, token)
      toast({ type: 'success', title: 'Deleted', message: `Removed “${p.title}”.` })
      load()
    }).catch(() => {})
  }

  if (editing) return <ProjectForm initial={editing} onCancel={() => setEditing(null)} onSave={save} />

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">{projects.length} projects</p>
        <button
          type="button"
          onClick={() => setEditing({ ...EMPTY })}
          className="inline-flex items-center gap-2 rounded-xl bg-neonCyan px-4 py-2 text-sm font-semibold text-void transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          New project
        </button>
      </div>

      {loading ? (
        <p className="mt-6 text-muted">Loading…</p>
      ) : (
        <ul className="mt-5 space-y-3">
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
    </div>
  )
}

function ProjectForm({ initial, onCancel, onSave }) {
  const [form, setForm] = useState(initial)
  const [busy, setBusy] = useState(false)
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    await onSave(form)
    setBusy(false)
  }

  const field = 'mt-1.5 w-full rounded-xl border border-hair bg-fill px-4 py-2.5 text-ink outline-none transition-colors focus:border-neonCyan'
  const label = 'block text-sm font-medium text-ink'

  return (
    <div>
      <button type="button" onClick={onCancel} className="inline-flex items-center gap-1.5 font-mono text-xs text-muted hover:text-ink">
        <ArrowLeft className="h-3.5 w-3.5" />
        Cancel
      </button>
      <h2 className="mt-2 font-display text-2xl font-bold text-ink">{form.id ? 'Edit project' : 'New project'}</h2>

      <form onSubmit={submit} className="mt-6 space-y-5">
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
          <button type="submit" disabled={busy} className="rounded-xl bg-neonCyan px-6 py-2.5 font-semibold text-void transition-opacity hover:opacity-90 disabled:opacity-50">
            {busy ? 'Saving…' : 'Save'}
          </button>
          <button type="button" onClick={onCancel} className="rounded-xl border border-hair bg-fill px-6 py-2.5 font-semibold text-ink hover:bg-fill-strong">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

/* ───────────────────── Generic content collections ───────────────────── */

/** Build an empty form object from a collection's field list. */
function emptyOf(config) {
  const out = { order: 0 }
  for (const f of config.fields) out[f.key] = ''
  return out
}

/** Turn a stored doc into form values (arrays → comma strings for tag fields). */
function toForm(config, doc) {
  const out = { id: doc.id, order: doc.order ?? 0 }
  for (const f of config.fields) {
    const v = doc[f.key]
    out[f.key] = f.type === 'tags' ? (Array.isArray(v) ? v.join(', ') : v || '') : v ?? ''
  }
  return out
}

function CollectionTab({ config, token, onLogout }) {
  const { toast } = useToast()
  const run = useAuthedAction(onLogout)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)

  async function load() {
    setLoading(true)
    try {
      setItems(await config.list())
    } catch (err) {
      toast({ type: 'error', title: 'Could not load', message: err.message })
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [])

  async function save(form) {
    const label = form[config.titleKey] || config.label
    await run(async () => {
      if (form.id) {
        await api.update(config.resource, form.id, form, token)
        toast({ type: 'success', title: 'Saved', message: `Updated “${label}”.` })
      } else {
        await api.create(config.resource, form, token)
        toast({ type: 'success', title: 'Created', message: `Added “${label}”.` })
      }
      setEditing(null)
      load()
    }).catch(() => {})
  }

  async function remove(item) {
    const label = item[config.titleKey] || 'this entry'
    if (!confirm(`Delete “${label}”? This cannot be undone.`)) return
    await run(async () => {
      await api.remove(config.resource, item.id, token)
      toast({ type: 'success', title: 'Deleted', message: `Removed “${label}”.` })
      load()
    }).catch(() => {})
  }

  if (editing) {
    return <CollectionForm config={config} initial={editing} onCancel={() => setEditing(null)} onSave={save} />
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">{items.length} {config.label}{items.length === 1 ? '' : 's'}</p>
        <button
          type="button"
          onClick={() => setEditing(emptyOf(config))}
          className="inline-flex items-center gap-2 rounded-xl bg-neonCyan px-4 py-2 text-sm font-semibold text-void transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          New {config.label}
        </button>
      </div>

      {loading ? (
        <p className="mt-6 text-muted">Loading…</p>
      ) : (
        <ul className="mt-5 space-y-3">
          {items.map((item) => (
            <li key={item.id} className="glass flex items-center justify-between gap-4 rounded-xl p-4">
              <div className="min-w-0">
                <p className="truncate font-medium text-ink">{item[config.titleKey] || '—'}</p>
                {config.subKey && (
                  <p className="truncate font-mono text-xs text-muted">{item[config.subKey]}</p>
                )}
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => setEditing(toForm(config, item))}
                  aria-label="Edit"
                  className="grid h-9 w-9 place-items-center rounded-lg border border-hair bg-fill text-muted hover:text-ink"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => remove(item)}
                  aria-label="Delete"
                  className="grid h-9 w-9 place-items-center rounded-lg border border-hair bg-fill text-muted hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function CollectionForm({ config, initial, onCancel, onSave }) {
  const [form, setForm] = useState(initial)
  const [busy, setBusy] = useState(false)
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    await onSave(form)
    setBusy(false)
  }

  const field = 'mt-1.5 w-full rounded-xl border border-hair bg-fill px-4 py-2.5 text-ink outline-none transition-colors focus:border-neonCyan'
  const label = 'block text-sm font-medium text-ink'

  return (
    <div>
      <button type="button" onClick={onCancel} className="inline-flex items-center gap-1.5 font-mono text-xs text-muted hover:text-ink">
        <ArrowLeft className="h-3.5 w-3.5" />
        Cancel
      </button>
      <h2 className="mt-2 font-display text-2xl font-bold text-ink capitalize">
        {form.id ? `Edit ${config.label}` : `New ${config.label}`}
      </h2>

      <form onSubmit={submit} className="mt-6 space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          {config.fields.map((f) => (
            <div key={f.key} className={f.type === 'tags' ? 'sm:col-span-2' : ''}>
              <label className={label} htmlFor={f.key}>
                {f.label}
                {f.type === 'tags' && <span className="font-normal text-muted"> (comma-separated)</span>}
              </label>
              <input
                id={f.key}
                required={f.required}
                value={form[f.key] ?? ''}
                onChange={set(f.key)}
                className={field}
                placeholder={f.placeholder}
              />
            </div>
          ))}
          <div>
            <label className={label} htmlFor="order">Order</label>
            <input id="order" type="number" value={form.order} onChange={set('order')} className={field} />
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={busy} className="rounded-xl bg-neonCyan px-6 py-2.5 font-semibold text-void transition-opacity hover:opacity-90 disabled:opacity-50">
            {busy ? 'Saving…' : 'Save'}
          </button>
          <button type="button" onClick={onCancel} className="rounded-xl border border-hair bg-fill px-6 py-2.5 font-semibold text-ink hover:bg-fill-strong">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

/* ─────────────────────────── Messages ─────────────────────────── */

function MessagesTab({ token, onLogout, onUnread }) {
  const { toast } = useToast()
  const run = useAuthedAction(onLogout)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    try {
      const list = await api.listMessages(token)
      setMessages(list)
      onUnread(list.filter((m) => !m.read).length)
    } catch (err) {
      if (/401|unauth|token|expired/i.test(err.message)) onLogout()
      else toast({ type: 'error', title: 'Could not load messages', message: err.message })
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [])

  async function toggleRead(m) {
    await run(async () => {
      await api.markMessage(m.id, !m.read, token)
      load()
    }).catch(() => {})
  }

  async function remove(m) {
    if (!confirm(`Delete the message from ${m.name}?`)) return
    await run(async () => {
      await api.deleteMessage(m.id, token)
      toast({ type: 'success', title: 'Deleted', message: 'Message removed.' })
      load()
    }).catch(() => {})
  }

  if (loading) return <p className="text-muted">Loading…</p>
  if (!messages.length) {
    return (
      <div className="glass grid place-items-center rounded-2xl p-12 text-center">
        <Inbox className="h-8 w-8 text-muted" />
        <p className="mt-3 font-medium text-ink">No messages yet</p>
        <p className="mt-1 text-sm text-muted">Contact-form submissions will show up here.</p>
      </div>
    )
  }

  return (
    <ul className="space-y-3">
      {messages.map((m) => (
        <li key={m.id} className={`glass rounded-xl p-4 ${!m.read ? 'border-neonCyan/40' : ''}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="flex items-center gap-2 font-medium text-ink">
                {!m.read && <span className="h-2 w-2 shrink-0 rounded-full bg-neonCyan" aria-label="Unread" />}
                {m.name}
              </p>
              <a href={`mailto:${m.email}`} className="inline-flex items-center gap-1.5 font-mono text-xs text-muted hover:text-neonCyan">
                <Mail className="h-3 w-3" />
                {m.email}
              </a>
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => toggleRead(m)}
                className="rounded-lg border border-hair bg-fill px-2.5 py-1 font-mono text-[11px] text-muted hover:text-ink"
              >
                {m.read ? 'Mark unread' : 'Mark read'}
              </button>
              <button
                type="button"
                onClick={() => remove(m)}
                aria-label="Delete message"
                className="grid h-7 w-7 place-items-center rounded-lg border border-hair bg-fill text-muted hover:text-red-400"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-ink/90">{m.message}</p>
          <p className="mt-2 font-mono text-[10px] text-muted">
            {new Date(m.createdAt).toLocaleString()}
          </p>
        </li>
      ))}
    </ul>
  )
}

/* ─────────────────────────── CV ─────────────────────────── */

function CvTab({ token, onLogout }) {
  const { toast } = useToast()
  const run = useAuthedAction(onLogout)
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const fileRef = useRef(null)

  async function load() {
    setLoading(true)
    try {
      setMeta(await api.cvMeta())
    } catch {
      setMeta({ exists: false })
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [])

  async function onFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.type !== 'application/pdf') {
      toast({ type: 'error', title: 'PDF only', message: 'Please choose a .pdf file.' })
      return
    }
    if (file.size > 8 * 1024 * 1024) {
      toast({ type: 'error', title: 'Too large', message: 'Max CV size is 8 MB.' })
      return
    }

    setBusy(true)
    try {
      const data = await toBase64(file)
      await run(() => api.uploadCv({ filename: file.name, mimeType: file.type, data }, token))
      toast({ type: 'success', title: 'CV uploaded', message: file.name })
      load()
    } catch {
      /* handled by run() / toast above */
    } finally {
      setBusy(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function remove() {
    if (!confirm('Remove the current CV? The site will fall back to the generated text CV.')) return
    await run(async () => {
      await api.deleteCv(token)
      toast({ type: 'success', title: 'CV removed', message: 'The uploaded CV was deleted.' })
      load()
    }).catch(() => {})
  }

  if (loading) return <p className="text-muted">Loading…</p>

  return (
    <div className="glass rounded-2xl p-6">
      <h2 className="font-display text-xl font-bold text-ink">Current CV</h2>
      {meta?.exists ? (
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <span className="grid h-11 w-11 place-items-center rounded-xl border border-hair bg-fill text-neonCyan">
            <FileText className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-ink">{meta.filename}</p>
            <p className="font-mono text-xs text-muted">
              {(meta.size / 1024).toFixed(0)} KB · updated {new Date(meta.updatedAt).toLocaleDateString()}
            </p>
          </div>
          <a href={cvUrl} target="_blank" rel="noreferrer" className="rounded-xl border border-hair bg-fill px-4 py-2 text-sm font-medium text-ink hover:bg-fill-strong">
            View
          </a>
          <button type="button" onClick={remove} className="inline-flex items-center gap-1.5 rounded-xl border border-hair bg-fill px-4 py-2 text-sm font-medium text-muted hover:text-red-400">
            <X className="h-4 w-4" />
            Remove
          </button>
        </div>
      ) : (
        <p className="mt-2 text-sm text-muted">
          No CV uploaded yet. The site shows a generated text CV until you upload a PDF here.
        </p>
      )}

      <div className="mt-6 border-t border-hair pt-6">
        <input ref={fileRef} type="file" accept="application/pdf" onChange={onFile} className="hidden" id="cv-file" />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-xl bg-neonCyan px-5 py-2.5 font-semibold text-void transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          <Upload className="h-4 w-4" />
          {busy ? 'Uploading…' : meta?.exists ? 'Replace CV' : 'Upload CV'}
        </button>
        <p className="mt-2 font-mono text-[11px] text-muted">PDF only, up to 8 MB.</p>
      </div>
    </div>
  )
}

/** Read a File into a bare base64 string (no data-URL prefix). */
function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result).split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
