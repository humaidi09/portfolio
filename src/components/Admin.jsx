import { useEffect, useRef, useState } from 'react'
import {
  Award, ArrowLeft, BarChart3, Briefcase, CalendarDays, FileText, FolderKanban,
  ImagePlus, Images, Inbox, LogOut, Mail, Pencil, Plus, Swords, Terminal, Trash2,
  TriangleAlert, Upload, X,
} from 'lucide-react'
import { api, auth, cvUrl } from '../lib/api'
import { LETTERS } from '../data/puzzles'
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
  { id: 'events', label: 'Events', Icon: CalendarDays },
  { id: 'gallery', label: 'Gallery', Icon: Images },
  { id: 'stats', label: 'Stats', Icon: BarChart3 },
  { id: 'competitiveProgramming', label: 'Competitive', Icon: Swords },
  { id: 'puzzles', label: 'Puzzles', Icon: Terminal },
  { id: 'wrong', label: 'Wrong answers', Icon: TriangleAlert },
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
  events: {
    label: 'event',
    resource: 'events',
    list: api.listEvents,
    titleKey: 'title',
    subKey: 'date',
    fields: [
      { key: 'title', label: 'Title', required: true, placeholder: 'ILUPC 2026 Programming Contest' },
      { key: 'date', label: 'Date', placeholder: 'Aug 2026' },
      { key: 'location', label: 'Location', placeholder: 'Leading University, Sylhet' },
      { key: 'description', label: 'Description', type: 'textarea', placeholder: 'A short line about the event.' },
      { key: 'images', label: 'Photos', type: 'images' },
    ],
  },
  gallery: {
    label: 'photo',
    resource: 'gallery',
    list: api.listGallery,
    titleKey: 'caption',
    subKey: null,
    thumbKey: 'image',
    // Bulk add: pick many photos at once → one record each (see CollectionTab).
    bulkImageKey: 'image',
    fields: [
      { key: 'image', label: 'Photo', type: 'image', required: true },
      { key: 'caption', label: 'Caption', type: 'textarea', placeholder: 'Optional — shown on hover / in the viewer' },
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
  competitiveProgramming: {
    label: 'CP profile',
    resource: 'competitive-programming',
    list: api.listCp,
    titleKey: 'name',
    subKey: 'handle',
    fields: [
      { key: 'name', label: 'Platform', required: true, placeholder: 'Codeforces' },
      { key: 'handle', label: 'Handle', placeholder: 'Humaidi_10 (blank = not linked)' },
      {
        key: 'source',
        label: 'Live source',
        type: 'select',
        options: [
          { value: 'link', label: 'Link only — show the manual stats below' },
          { value: 'codeforces', label: 'Codeforces — fetch live rating & heatmap' },
          { value: 'atcoder', label: 'AtCoder — fetch live problems & heatmap' },
        ],
      },
      { key: 'solvedOverride', label: 'Solved override', type: 'number', placeholder: 'e.g. 132 — blank uses the live count' },
      { key: 'stats', label: 'Manual stats', type: 'cpstats' },
      { key: 'profileUrl', label: 'Profile URL', placeholder: 'https://codeforces.com/profile/{handle}' },
      { key: 'logo', label: 'Logo path', placeholder: '/logos/codeforces.png' },
      { key: 'logoClass', label: 'Logo CSS classes', placeholder: 'p-1.5' },
      { key: 'mono', label: 'Monogram', placeholder: 'CF' },
      { key: 'accent', label: 'Accent colour', placeholder: '#4f8cff' },
      { key: 'key', label: 'Key (unique id)', required: true, placeholder: 'codeforces' },
    ],
  },
  puzzles: {
    label: 'puzzle',
    resource: 'puzzles',
    list: api.listPuzzles,
    titleKey: 'code',
    subKey: 'note',
    fields: [
      { key: 'code', label: 'C++ snippet', type: 'textarea', required: true, placeholder: 'cout << 7 / 2;' },
      // The options + which one is correct are edited together (see OptionsField).
      { key: 'options', label: 'Answer options', type: 'options', required: true },
      { key: 'note', label: 'Explanation', type: 'textarea', placeholder: 'One line on why that is the output.' },
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
        {tab === 'wrong' && <WrongAnswersTab token={token} onLogout={onLogout} />}
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
  for (const f of config.fields) {
    if (f.type === 'images') out[f.key] = []
    else if (f.type === 'options') { out[f.key] = ['', '', '']; out.answer = 0 }
    else if (f.type === 'cpstats') out[f.key] = {}
    else if (f.type === 'select') out[f.key] = f.options?.[0]?.value ?? ''
    else out[f.key] = ''
  }
  return out
}

/** Turn a stored doc into form values (arrays → comma strings for tag fields). */
function toForm(config, doc) {
  const out = { id: doc.id, order: doc.order ?? 0 }
  for (const f of config.fields) {
    const v = doc[f.key]
    if (f.type === 'tags') out[f.key] = Array.isArray(v) ? v.join(', ') : v || ''
    else if (f.type === 'images') out[f.key] = Array.isArray(v) ? v : v ? [v] : []
    else if (f.type === 'options') {
      out[f.key] = Array.isArray(v) && v.length ? v : ['', '', '']
      out.answer = Number(doc.answer) || 0
    } else if (f.type === 'cpstats') out[f.key] = v && typeof v === 'object' ? v : {}
    else out[f.key] = v ?? ''
  }
  return out
}

/** Read an image File into a compressed base64 data URL (long edge ≤ 1400px,
    JPEG q0.82) so photos stay small enough to store inline in the document. */
function imageToDataUrl(file, max = 1400, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = reject
    reader.onload = () => {
      const img = new Image()
      img.onerror = reject
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height))
        const w = Math.round(img.width * scale)
        const h = Math.round(img.height * scale)
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        canvas.getContext('2d').drawImage(img, 0, 0, w, h)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  })
}

function CollectionTab({ config, token, onLogout }) {
  const { toast } = useToast()
  const run = useAuthedAction(onLogout)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [bulk, setBulk] = useState(null) // { done, total } while a bulk upload runs
  const bulkRef = useRef(null)

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

  // Bulk photo upload (Gallery): each selected image becomes its own record,
  // appended after the existing ones. Compresses client-side before sending.
  async function onBulkPick(e) {
    const files = [...(e.target.files || [])].filter((f) => f.type.startsWith('image/'))
    e.target.value = ''
    if (!files.length) return
    const baseOrder = items.reduce((m, it) => Math.max(m, it.order ?? 0), 0)
    setBulk({ done: 0, total: files.length })
    let ok = 0
    try {
      for (let i = 0; i < files.length; i += 1) {
        try {
          const dataUrl = await imageToDataUrl(files[i])
          await api.create(config.resource, { [config.bulkImageKey]: dataUrl, order: baseOrder + i + 1 }, token)
          ok += 1
        } catch (err) {
          if (/401|unauth|token|expired/i.test(err.message)) { onLogout(); return }
        }
        setBulk({ done: i + 1, total: files.length })
      }
      toast({ type: 'success', title: 'Photos added', message: `Uploaded ${ok} of ${files.length}.` })
      load()
    } finally {
      setBulk(null)
    }
  }

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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          {bulk ? `Uploading ${bulk.done}/${bulk.total}…` : `${items.length} ${config.label}${items.length === 1 ? '' : 's'}`}
        </p>
        <div className="flex gap-2">
          {config.bulkImageKey && (
            <>
              <input ref={bulkRef} type="file" accept="image/*" multiple onChange={onBulkPick} className="hidden" />
              <button
                type="button"
                onClick={() => bulkRef.current?.click()}
                disabled={Boolean(bulk)}
                className="inline-flex items-center gap-2 rounded-xl border border-hair bg-fill px-4 py-2 text-sm font-semibold text-ink transition-opacity hover:bg-fill-strong disabled:opacity-50"
              >
                <Upload className="h-4 w-4" />
                {bulk ? 'Uploading…' : 'Upload photos'}
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => setEditing(emptyOf(config))}
            className="inline-flex items-center gap-2 rounded-xl bg-neonCyan px-4 py-2 text-sm font-semibold text-void transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            New {config.label}
          </button>
        </div>
      </div>

      {loading ? (
        <p className="mt-6 text-muted">Loading…</p>
      ) : (
        <ul className="mt-5 space-y-3">
          {items.map((item) => (
            <li key={item.id} className="glass flex items-center justify-between gap-4 rounded-xl p-4">
              <div className="flex min-w-0 items-center gap-3">
                {config.thumbKey && item[config.thumbKey] && (
                  <img
                    src={item[config.thumbKey]}
                    alt=""
                    className="h-11 w-14 shrink-0 rounded-lg border border-hair object-cover"
                  />
                )}
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink">{item[config.titleKey] || (config.thumbKey ? 'Untitled photo' : '—')}</p>
                  {config.subKey && (
                    <p className="truncate font-mono text-xs text-muted">{item[config.subKey]}</p>
                  )}
                </div>
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
  const { toast } = useToast()
  const [form, setForm] = useState(initial)
  const [busy, setBusy] = useState(false)
  const [imgBusy, setImgBusy] = useState(false)
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    await onSave(form)
    setBusy(false)
  }

  async function onPickImage(key, e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast({ type: 'error', title: 'Image only', message: 'Please choose an image file.' })
      return
    }
    setImgBusy(true)
    try {
      const dataUrl = await imageToDataUrl(file)
      setForm((f) => ({ ...f, [key]: dataUrl }))
    } catch {
      toast({ type: 'error', title: 'Could not read image', message: 'Try a different photo.' })
    } finally {
      setImgBusy(false)
      e.target.value = ''
    }
  }

  // Append one or more chosen images to an array field (compressed).
  async function onAddImages(key, e) {
    const files = [...(e.target.files || [])].filter((f) => f.type.startsWith('image/'))
    e.target.value = ''
    if (!files.length) return
    setImgBusy(true)
    try {
      const urls = []
      for (const file of files) urls.push(await imageToDataUrl(file))
      setForm((f) => ({ ...f, [key]: [...(f[key] || []), ...urls] }))
    } catch {
      toast({ type: 'error', title: 'Could not read image', message: 'Try a different photo.' })
    } finally {
      setImgBusy(false)
    }
  }

  const field = 'mt-1.5 w-full rounded-xl border border-hair bg-fill px-4 py-2.5 text-ink outline-none transition-colors focus:border-neonCyan'
  const label = 'block text-sm font-medium text-ink'
  const wide = (f) =>
    f.type === 'tags' || f.type === 'textarea' || f.type === 'image' || f.type === 'images' || f.type === 'options' || f.type === 'cpstats'

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
            <div key={f.key} className={wide(f) ? 'sm:col-span-2' : ''}>
              <label className={label} htmlFor={f.key}>
                {f.label}
                {f.type === 'tags' && <span className="font-normal text-muted"> (comma-separated)</span>}
              </label>

              {f.type === 'textarea' ? (
                <textarea
                  id={f.key}
                  rows={3}
                  required={f.required}
                  value={form[f.key] ?? ''}
                  onChange={set(f.key)}
                  className={field}
                  placeholder={f.placeholder}
                />
              ) : f.type === 'image' ? (
                <ImageField
                  value={form[f.key]}
                  busy={imgBusy}
                  onPick={(e) => onPickImage(f.key, e)}
                  onClear={() => setForm((s) => ({ ...s, [f.key]: '' }))}
                />
              ) : f.type === 'images' ? (
                <MultiImageField
                  values={form[f.key] || []}
                  busy={imgBusy}
                  onAdd={(e) => onAddImages(f.key, e)}
                  onRemove={(idx) => setForm((s) => ({ ...s, [f.key]: (s[f.key] || []).filter((_, i) => i !== idx) }))}
                />
              ) : f.type === 'options' ? (
                <OptionsField
                  options={form[f.key] || ['', '', '']}
                  answer={Number(form.answer) || 0}
                  onChange={(options, answer) => setForm((s) => ({ ...s, [f.key]: options, answer }))}
                />
              ) : f.type === 'cpstats' ? (
                <CpStatsField
                  value={form[f.key] || {}}
                  onChange={(stats) => setForm((s) => ({ ...s, [f.key]: stats }))}
                />
              ) : f.type === 'select' ? (
                <select id={f.key} value={form[f.key] ?? ''} onChange={set(f.key)} className={field}>
                  {f.options.map((o) => {
                    const value = o.value ?? o
                    return (
                      <option key={value} value={value}>
                        {o.label ?? o}
                      </option>
                    )
                  })}
                </select>
              ) : f.type === 'number' ? (
                <input
                  id={f.key}
                  type="number"
                  required={f.required}
                  value={form[f.key] ?? ''}
                  onChange={set(f.key)}
                  className={field}
                  placeholder={f.placeholder}
                />
              ) : (
                <input
                  id={f.key}
                  required={f.required}
                  value={form[f.key] ?? ''}
                  onChange={set(f.key)}
                  className={field}
                  placeholder={f.placeholder}
                />
              )}
            </div>
          ))}
          <div>
            <label className={label} htmlFor="order">Order</label>
            <input id="order" type="number" value={form.order} onChange={set('order')} className={field} />
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={busy || imgBusy} className="rounded-xl bg-neonCyan px-6 py-2.5 font-semibold text-void transition-opacity hover:opacity-90 disabled:opacity-50">
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

/** A photo picker: shows a preview thumbnail + replace/remove once a photo is
    chosen, or an upload dropzone when empty. Stores a base64 data URL in form. */
function ImageField({ value, busy, onPick, onClear }) {
  const ref = useRef(null)
  return (
    <div className="mt-1.5">
      <input ref={ref} type="file" accept="image/*" onChange={onPick} className="hidden" />
      {value ? (
        <div className="flex items-center gap-4 rounded-xl border border-hair bg-fill p-3">
          <img src={value} alt="Event preview" className="h-20 w-28 shrink-0 rounded-lg object-cover" />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => ref.current?.click()}
              disabled={busy}
              className="rounded-lg border border-hair bg-void/40 px-3 py-1.5 text-sm text-ink hover:bg-fill-strong disabled:opacity-50"
            >
              {busy ? 'Processing…' : 'Replace'}
            </button>
            <button
              type="button"
              onClick={onClear}
              className="inline-flex items-center gap-1.5 rounded-lg border border-hair bg-void/40 px-3 py-1.5 text-sm text-muted hover:text-red-400"
            >
              <X className="h-4 w-4" />
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => ref.current?.click()}
          disabled={busy}
          className="flex w-full flex-col items-center gap-2 rounded-xl border border-dashed border-hair-strong bg-fill px-4 py-8 text-muted transition-colors hover:border-neonCyan/50 hover:text-ink disabled:opacity-50"
        >
          <ImagePlus className="h-6 w-6" />
          <span className="text-sm">{busy ? 'Processing…' : 'Choose a photo'}</span>
          <span className="font-mono text-[11px] text-muted">JPG or PNG · auto-resized</span>
        </button>
      )}
    </div>
  )
}

/** A multi-photo picker: a grid of thumbnails (each removable) plus an "add"
    tile that accepts several files at once. Stores an array of data URLs. */
function MultiImageField({ values, busy, onAdd, onRemove }) {
  const ref = useRef(null)
  return (
    <div className="mt-1.5">
      <input ref={ref} type="file" accept="image/*" multiple onChange={onAdd} className="hidden" />
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {values.map((src, i) => (
          <div key={i} className="group relative aspect-square overflow-hidden rounded-lg border border-hair bg-fill">
            <img src={src} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onRemove(i)}
              aria-label={`Remove photo ${i + 1}`}
              className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/70 text-white opacity-0 transition-opacity hover:bg-red-500 group-hover:opacity-100"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => ref.current?.click()}
          disabled={busy}
          className="grid aspect-square place-items-center gap-1 rounded-lg border border-dashed border-hair-strong bg-fill text-muted transition-colors hover:border-neonCyan/50 hover:text-ink disabled:opacity-50"
        >
          <ImagePlus className="h-5 w-5" />
          <span className="text-[11px]">{busy ? 'Processing…' : 'Add'}</span>
        </button>
      </div>
      <p className="mt-2 font-mono text-[11px] text-muted">
        {values.length} photo{values.length === 1 ? '' : 's'} · pick several at once · auto-resized
      </p>
    </div>
  )
}

/** Editor for a puzzle's answer options: a row per option (text + a radio to
    mark it correct), add/remove controls, and the correct-answer index kept in
    sync. 2–6 options; the marked option is the one revealed as right. */
function OptionsField({ options, answer, onChange }) {
  const setText = (idx, text) => {
    const next = options.map((o, i) => (i === idx ? text : o))
    onChange(next, answer)
  }
  const add = () => {
    if (options.length >= 6) return
    onChange([...options, ''], answer)
  }
  const remove = (idx) => {
    if (options.length <= 2) return
    const next = options.filter((_, i) => i !== idx)
    // Keep the correct-answer pointer valid after a removal.
    let a = answer
    if (idx === answer) a = 0
    else if (idx < answer) a = answer - 1
    onChange(next, a)
  }

  return (
    <div className="mt-1.5 space-y-2">
      {options.map((opt, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <label className="flex shrink-0 items-center gap-1.5 rounded-lg border border-hair bg-fill px-2.5 py-2 text-xs text-muted">
            <input
              type="radio"
              name="correct-option"
              checked={answer === idx}
              onChange={() => onChange(options, idx)}
              className="accent-neonCyan"
            />
            correct
          </label>
          <input
            value={opt}
            onChange={(e) => setText(idx, e.target.value)}
            placeholder={`Option ${LETTERS[idx]}`}
            className="w-full rounded-xl border border-hair bg-fill px-4 py-2.5 font-mono text-ink outline-none transition-colors focus:border-neonCyan"
          />
          <button
            type="button"
            onClick={() => remove(idx)}
            disabled={options.length <= 2}
            aria-label={`Remove option ${LETTERS[idx]}`}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-hair bg-fill text-muted hover:text-red-400 disabled:opacity-40"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
      {options.length < 6 && (
        <button
          type="button"
          onClick={add}
          className="inline-flex items-center gap-1.5 rounded-lg border border-hair bg-fill px-3 py-1.5 text-xs font-medium text-muted hover:text-ink"
        >
          <Plus className="h-3.5 w-3.5" />
          Add option
        </button>
      )}
      <p className="font-mono text-[11px] text-muted">
        Pick the radio next to the option that is the correct output.
      </p>
    </div>
  )
}

/** Manual stats for a CP judge without a live API (LeetCode, CodeChef, AtCoder…).
    Each field is optional; blank ones are dropped so the card only shows what's set. */
function CpStatsField({ value, onChange }) {
  const NUMS = [
    { k: 'rating', label: 'Rating' },
    { k: 'solved', label: 'Solved' },
    { k: 'submissions', label: 'Submissions' },
    { k: 'activeDays', label: 'Active days' },
    { k: 'maxStreak', label: 'Max streak' },
  ]
  const setNum = (k) => (e) => {
    const next = { ...value }
    const raw = e.target.value
    if (raw === '') delete next[k]
    else next[k] = Number(raw)
    onChange(next)
  }
  const setNote = (e) => {
    const next = { ...value }
    if (e.target.value.trim() === '') delete next.note
    else next.note = e.target.value
    onChange(next)
  }
  const cell =
    'w-full rounded-xl border border-hair bg-fill px-3 py-2 text-ink outline-none transition-colors focus:border-neonCyan'
  return (
    <div className="mt-1.5 rounded-xl border border-hair bg-fill/40 p-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {NUMS.map(({ k, label }) => (
          <label key={k} className="block">
            <span className="font-mono text-[11px] text-muted">{label}</span>
            <input
              type="number"
              value={value?.[k] ?? ''}
              onChange={setNum(k)}
              className={cell}
              placeholder="—"
            />
          </label>
        ))}
      </div>
      <label className="mt-3 block">
        <span className="font-mono text-[11px] text-muted">Note (optional)</span>
        <input value={value?.note ?? ''} onChange={setNote} className={cell} placeholder="e.g. 4★ on CodeChef" />
      </label>
      <p className="mt-2 font-mono text-[11px] text-muted">
        Blank fields are hidden. Used for judges without a live API (LeetCode, CodeChef…).
      </p>
    </div>
  )
}

/* ─────────────────────────── Wrong answers ─────────────────────────── */

/** Read-only log of wrong guesses from the hero game: which snippet, what the
    player picked vs. the right answer, and when. Clear one or all. */
function WrongAnswersTab({ token, onLogout }) {
  const { toast } = useToast()
  const run = useAuthedAction(onLogout)
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    try {
      setRows(await api.listWrongAnswers(token))
    } catch (err) {
      if (/401|unauth|token|expired/i.test(err.message)) onLogout()
      else toast({ type: 'error', title: 'Could not load', message: err.message })
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [])

  async function remove(row) {
    await run(async () => {
      await api.deleteWrongAnswer(row.id, token)
      load()
    }).catch(() => {})
  }

  async function clearAll() {
    if (!rows.length) return
    if (!confirm(`Clear all ${rows.length} logged wrong answers? This cannot be undone.`)) return
    await run(async () => {
      await api.clearWrongAnswers(token)
      toast({ type: 'success', title: 'Cleared', message: 'Wrong-answer log emptied.' })
      load()
    }).catch(() => {})
  }

  if (loading) return <p className="text-muted">Loading…</p>
  if (!rows.length) {
    return (
      <div className="glass grid place-items-center rounded-2xl p-12 text-center">
        <TriangleAlert className="h-8 w-8 text-muted" />
        <p className="mt-3 font-medium text-ink">No wrong answers yet</p>
        <p className="mt-1 text-sm text-muted">When a visitor picks the wrong output in the hero game, it shows up here.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted">{rows.length} wrong guess{rows.length === 1 ? '' : 'es'} logged</p>
        <button
          type="button"
          onClick={clearAll}
          className="inline-flex items-center gap-1.5 rounded-xl border border-hair bg-fill px-3 py-1.5 text-sm font-medium text-muted hover:text-red-400"
        >
          <Trash2 className="h-4 w-4" />
          Clear all
        </button>
      </div>
      <ul className="mt-5 space-y-3">
        {rows.map((r) => (
          <li key={r.id} className="glass rounded-xl p-4">
            <div className="flex items-start justify-between gap-3">
              <pre className="min-w-0 flex-1 overflow-x-auto whitespace-pre-wrap font-mono text-xs text-ink/90">{r.code}</pre>
              <button
                type="button"
                onClick={() => remove(r)}
                aria-label="Delete entry"
                className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-hair bg-fill text-muted hover:text-red-400"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs">
              <span className="text-red-300">picked: {r.chosen || '—'}</span>
              <span className="text-neonCyan">correct: {r.correct || '—'}</span>
              <span className="text-muted">{new Date(r.createdAt).toLocaleString()}</span>
            </div>
          </li>
        ))}
      </ul>
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
