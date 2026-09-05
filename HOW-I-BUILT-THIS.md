# HOW I BUILT THIS — Full Step-by-Step Tutorial (Banglish)

> Ei document ta amar portfolio + blog/CMS ta kivabe banano hoise tar **full step-by-step guide**.
> Target: (1) tumi nije zero theke **emon ekta banate parba**, and (2) kaউke **bujhaite parba** "ami eita kivabe banaisi".
> Prose ta Banglish (Bangla + English), but code / command / technical term gula English e rakha — karon editor r terminal e oigula English ei lagbe.

---

## Table of Contents

1. [2-minute pitch — kaউke kivabe bujhaba](#1-2-minute-pitch)
2. [Big picture — puro system ta ki](#2-big-picture-architecture)
3. [Part 0 — Ki ki lagbe (tools + accounts)](#3-part-0--ki-ki-lagbe)
4. [Part 1 — Frontend setup (Vite + React + Tailwind v4)](#4-part-1--frontend-setup)
5. [Part 2 — Black+gold theme / design system](#5-part-2--theme--design-system)
6. [Part 3 — Sections + custom router](#6-part-3--sections--router)
7. [Part 4 — Backend API (Express + Mongoose + Atlas)](#7-part-4--backend-api)
8. [Part 5 — Route factories (DRY er magic)](#8-part-5--route-factories)
9. [Part 6 — Admin auth (JWT single password)](#9-part-6--admin-auth)
10. [Part 7 — Config-driven admin panel](#10-part-7--admin-panel)
11. [Part 8 — Frontend ↔ Backend connect](#11-part-8--frontend--backend-connect)
12. [Part 9 — Blog CMS: Posts (markdown, draft/publish)](#12-part-9--blog-cms-posts)
13. [Part 10 — Media: Photos/Videos with Cloudinary](#13-part-10--media-with-cloudinary)
14. [Part 11 — Deployment (Atlas + Render + Vercel)](#14-part-11--deployment)
15. [Part 12 — Security & gotchas (jei bhul gula ami korsi)](#15-part-12--security--gotchas)
16. [Appendix — Full command checklist](#16-appendix--command-checklist)

---

## 1. 2-minute pitch

> Ei part ta mukhosto koro — keউ jodi jiggesh kore "eita kivabe banaisos?", ei ta bole dile complete answer hoye jabe.

**"Eita ekta full-stack developer portfolio, jetate ekta real blog/CMS built-in.**

Frontend ta **React + Vite** diye banano, styling **Tailwind CSS v4** diye — ekta custom **black + gold** design system, nijer type scale, animations (framer-motion), ar background e ekta network effect.

Backend ta **alada** — **Node.js + Express** API, data thake **MongoDB Atlas** e (Mongoose diye modeled). Content (projects, skills, experience, blog posts) kono jayga te hardcode kora nai — shob **database theke ashe**, ar ami ekta **password-protected admin panel** (`/admin`) theke oigula add/edit/delete korte pari. Admin auth ta **JWT** diye — ekta single admin password.

Blog ta ekta **real CMS**: post gula **Markdown** e likhi, **draft/publish** kora jay, ar publish korle shathe shathe `/blog` e chole ashe — refresh dile kichu haray na, karon shob DB te. Photo/video gula DB te rakhi na (oita costly + slow) — oigula **Cloudinary** (object storage) te jay, ar DB te sudhu **URL + metadata** thake. Upload ta **browser theke direct Cloudinary te** jay, kintu server ekta **signature** kore dey jate secret keys frontend e kono din na ashe.

Deploy: frontend **Vercel** e, backend **Render** e, DB **Atlas**, media **Cloudinary** — **shob free tier, kono credit card lage nai.**"**

Ei paragraph tai tomar "elevator pitch". Nicher part gula holo oi pitch er proti line ta **kivabe** banaisi tar detail.

---

## 2. Big picture (architecture)

```
                         ┌──────────────────────────┐
      Visitor ─────────▶ │  Vercel (Frontend)        │   React SPA
                         │  https://your-site.app    │   (Vite build → static)
                         └───────────┬──────────────┘
                                     │  fetch() JSON (VITE_API_URL)
                                     ▼
                         ┌──────────────────────────┐
      Admin (/admin) ──▶ │  Render (Backend API)     │   Node + Express
                         │  https://your-api.onrender│   JWT auth, REST routes
                         └──────┬───────────┬────────┘
                                │           │
                 Mongoose       │           │   signed upload / destroy
                                ▼           ▼
                    ┌────────────────┐   ┌────────────────────┐
                    │ MongoDB Atlas  │   │ Cloudinary          │
                    │ (text/metadata)│   │ (images + videos)   │
                    └────────────────┘   └────────────────────┘
                                              ▲
                        Browser ──────────────┘  (file bytes go DIRECT here,
                                                  authorized by server signature)
```

**Key idea:** 3 ta alada "brain":
- **Frontend** = ja user dekhe (React).
- **Backend** = rules + database er gatekeeper (Express).
- **Storage** = MongoDB (text/metadata) + Cloudinary (heavy media).

Ei separation tai professional apps er standard. Ekta bhangle onno gula thake.

**Repo structure (monorepo style):**
```
portfolio/
├── src/                 # Frontend (React) — root e
│   ├── components/       # Navbar, Hero, About, ... , blog/, Admin.jsx
│   ├── lib/              # router.jsx, api.js
│   ├── hooks/            # useCollection.js
│   ├── data/             # portfolioData.js (fallback/seed data)
│   └── index.css         # Tailwind v4 @theme (design tokens)
├── server/              # Backend (Express) — alada folder
│   └── src/
│       ├── index.js      # express app + route registration
│       ├── db.js         # mongoose connect
│       ├── models/       # Post.js, Photo.js, Project.js, ...
│       ├── routes/       # posts.js, crud.js, blogRouter.js, media.js, auth.js
│       ├── middleware/   # auth.js (requireAdmin / optionalAdmin)
│       └── lib/          # model.js (slugify), cloudinary.js
├── vercel.json          # SPA rewrite
└── render.yaml          # Render blueprint
```

---

## 3. Part 0 — Ki ki lagbe

**Tools (local machine):**
- **Node.js** (v18+). `node -v` diye check koro.
- **Git** + ekta **GitHub** account.
- Ekta editor — **VS Code**.

**Free accounts (kono card lage na):**
- **MongoDB Atlas** — database (free M0 cluster).
- **Cloudinary** — image/video storage (free tier).
- **Render** — backend host korar jonno.
- **Vercel** — frontend host korar jonno.

> Mindset: prothome shob **local e** kaj korbe (`localhost`). Shob thik moto cholle tarpor deploy korba. Ekbare deploy kore debug korte gele pagol hoye jaba.

---

## 4. Part 1 — Frontend setup

Ekta folder khule, frontend scaffold koro:

```bash
npm create vite@latest portfolio -- --template react
cd portfolio
npm install
```

Erpor core libraries:

```bash
npm install tailwindcss @tailwindcss/vite framer-motion lucide-react
```

- **tailwindcss v4** + `@tailwindcss/vite` — styling. (v4 te alada `tailwind.config.js` lage **na**, config ta CSS er bhitor e.)
- **framer-motion** — animation.
- **lucide-react** — icon.

**`vite.config.js`** e Tailwind plugin add koro:

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

**`src/index.css`** er ekdom upore (Tailwind v4 er syntax):

```css
@import "tailwindcss";
```

Test: `npm run dev` → `http://localhost:5173` e default Vite page ashbe.

> ⚠️ **Gotcha #1:** Vite te, jekono file e JSX (`<div>` type) thakle tar extension **`.jsx`** hote hobe, `.js` na. Na hole build fail korbe.

---

## 5. Part 2 — Theme / design system

Ei portfolio er personality ta ashe **black + gold** theme theke. Amar tips: prothome ekta **token system** banao (color/type er naam), tarpor pura app oi token use korbe — future e theme change korte 1 jayga edit korlei hobe.

Tailwind v4 te tokens `@theme` block er bhitore define kori (`src/index.css`):

```css
@import "tailwindcss";

@theme {
  /* Base surfaces — pure black er upor warm layers */
  --color-void: #000000;          /* page background */
  --color-fill: #0e0d0b;          /* card background */
  --color-fill-2: #16140f;        /* raised card */
  --color-hair: #26221a;          /* thin borders */

  /* Text */
  --color-ink: #f5f1e8;           /* main text */
  --color-muted: #a89e88;         /* secondary text */

  /* Gold accents (naam gula legacy — "neon" bola holeও asole gold) */
  --color-neonCyan: #f2b43d;      /* primary gold */
  --color-neonPurple: #cf9038;    /* bronze */

  /* Fonts */
  --font-display: "Fraunces", serif;      /* headings */
  --font-sans: "Inter", sans-serif;        /* body */
  --font-mono: "JetBrains Mono", monospace;/* labels/code */
}
```

Ei token gula automatically Tailwind utility banaye dey: `bg-void`, `bg-fill`, `border-hair`, `text-ink`, `text-muted`, `text-neonCyan`, `font-display`, `font-mono` — eগula ami pura app e use korsi.

Fonts ta Google Fonts theke `index.html` er `<head>` e link kori (Fraunces, Inter, JetBrains Mono).

Reusable "glass" style gula ekta custom class e (`index.css`):

```css
@layer components {
  .glass {
    background: color-mix(in srgb, var(--color-fill) 92%, transparent);
    border: 1px solid var(--color-hair);
    backdrop-filter: blur(8px);
  }
}
```

> **Design philosophy (ja interviewer ke bola jay):** "Ami ekta 5-6 color er palette lock korsi, ekta display font (Fraunces) + ekta body font (Inter). Boldness ekta jaygায় — gold accent. Baki shob quiet. Eta template look ta avoid kore."

---

## 6. Part 3 — Sections + router

**Sections:** Prottek ta section ekta React component — `Hero`, `About`, `Skills`, `Projects`, `Experience`, `Events`, `Contact` (ar `CompetitiveProgramming`). `App.jsx` e egula ek er por ek boshai:

```jsx
export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Skills />
      <CompetitiveProgramming />
      <Projects />
      <Experience />
      <Events />
      <Contact />
    </>
  )
}
```

**Custom router (no library):** Amar dorkar chilo `/`, `/admin`, `/blog`, `/blog/post/:slug` — kintu React Router install korar dorkar nai. Ami ekta chhoto router banaisi `src/lib/router.jsx` e, browser er **History API** diye:

```jsx
import { useSyncExternalStore, useCallback } from 'react'

// path change korar function
export function navigate(to) {
  window.history.pushState({}, '', to)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

// current path ke subscribe kora (re-render on change)
export function useRoute() {
  return useSyncExternalStore(
    (cb) => {
      window.addEventListener('popstate', cb)
      return () => window.removeEventListener('popstate', cb)
    },
    () => window.location.pathname,
  )
}

// <Link> — <a> er moto, kintu full page reload kore na
export function Link({ to, children, ...rest }) {
  const onClick = useCallback((e) => {
    e.preventDefault()
    navigate(to)
  }, [to])
  return <a href={to} onClick={onClick} {...rest}>{children}</a>
}
```

`App.jsx` e path onujayi ki render hobe decide kori:

```jsx
const pathname = useRoute()
if (pathname === '/admin') return <Admin />
if (pathname.startsWith('/blog')) return <BlogApp />
return <Home />
```

> **Keno custom router?** App ta chhoto, tai 1 ta full library (extra KB) install na kore 20 line code e kaj sarlam. Interview e eita ekta bhalo talking point — "ami bujhe tool select korsi, over-engineer korini".

Ekhon frontend ekta static site — data hardcoded. Ebar backend banai jate data DB theke ashe.

---

## 7. Part 4 — Backend API

Alada folder e backend:

```bash
mkdir server && cd server
npm init -y
npm install express mongoose cors dotenv jsonwebtoken bcryptjs express-rate-limit
```

`server/package.json` e `"type": "module"` add koro (jate ESM `import` use kora jay) ar scripts:

```json
{
  "type": "module",
  "scripts": {
    "dev": "node --watch src/index.js",
    "start": "node src/index.js"
  }
}
```

**MongoDB Atlas setup:**
1. Atlas e ekta free **M0 cluster** banao.
2. **Database Access** → ekta user + password banao.
3. **Network Access** → IP add koro (dev er jonno `0.0.0.0/0` = allow all; production e careful).
4. **Connect → Drivers** → connection string copy koro. Eita `server/.env` e rakhbe (git e **kono din na**):

```
MONGODB_URI=mongodb+srv://USER:PASSWORD@cluster0.xxxx.mongodb.net/portfolio?retryWrites=true&w=majority
JWT_SECRET=ekta-lomba-random-string
ADMIN_PASSWORD=tomar-admin-password
CLIENT_ORIGIN=http://localhost:5173
PORT=4000
```

> ⚠️ `.env` file ta `.gitignore` e add koro **first**. Ei file e secret thake — GitHub e uthle bipod.

**Connect (`server/src/db.js`):**

```js
import mongoose from 'mongoose'

export async function connectDB() {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('✓ MongoDB connected')
}
```

**Express app (`server/src/index.js`):**

```js
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { connectDB } from './db.js'
import projectRoutes from './routes/projects.js'

const app = express()

// CORS: sudhu tomar frontend origin allow koro
const origins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(',')
app.use(cors({ origin: origins }))
app.use(express.json({ limit: '12mb' }))  // base64 image/PDF er jonno boro limit

app.get('/api/health', (_req, res) => res.json({ ok: true }))
app.use('/api/projects', projectRoutes)

const PORT = process.env.PORT || 4000
connectDB().then(() => {
  app.listen(PORT, () => console.log(`✓ API on http://localhost:${PORT}`))
})
```

**Ekta shared model helper (`server/src/lib/model.js`):**

```js
// title → url-safe slug
export function slugify(str = '') {
  return String(str).toLowerCase().trim()
    .replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '')
}

// API te _id ke id banaye dey, __v remove kore
export const jsonOptions = {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => { ret.id = ret._id; delete ret._id; return ret },
}
```

**Ekta model (`server/src/models/Project.js`):**

```js
import mongoose from 'mongoose'
import { jsonOptions } from '../lib/model.js'

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  tags: { type: [String], default: [] },
  liveUrl: { type: String, default: '' },
  repoUrl: { type: String, default: '' },
  order: { type: Number, default: 0 },
}, { timestamps: true })

projectSchema.set('toJSON', jsonOptions)
export default mongoose.model('Project', projectSchema)
```

Ekhon test: `npm run dev`, tarpor browser e `http://localhost:4000/api/health` → `{"ok":true}` ashle backend cholche.

---

## 8. Part 5 — Route factories

Amar onek collection (projects, experience, events, skills...) — protita r jonno same CRUD code likhle **repeat** hoye jay. Tai ami ekta **factory function** banaisi: model dile ready-made router feরত dey.

**`server/src/routes/crud.js`:**

```js
import { Router } from 'express'
import { requireAdmin } from '../middleware/auth.js'

export function crudRouter(Model, { fields = [], arrayFields = [], listFields = [] } = {}) {
  const router = Router()

  const sanitize = (body = {}) => {
    const out = {}
    for (const key of fields) if (body[key] !== undefined) out[key] = String(body[key]).trim()
    for (const key of arrayFields) if (body[key] !== undefined)
      out[key] = Array.isArray(body[key]) ? body[key] : String(body[key]).split(',').map(t => t.trim()).filter(Boolean)
    if (body.order !== undefined) out.order = Number(body.order) || 0
    return out
  }

  router.get('/', async (_req, res) => res.json(await Model.find().sort({ order: 1, createdAt: -1 })))
  router.post('/', requireAdmin, async (req, res) => res.status(201).json(await Model.create(sanitize(req.body))))
  router.put('/:id', requireAdmin, async (req, res) => res.json(await Model.findByIdAndUpdate(req.params.id, sanitize(req.body), { new: true })))
  router.delete('/:id', requireAdmin, async (req, res) => { await Model.findByIdAndDelete(req.params.id); res.json({ ok: true }) })

  return router
}
```

Ekhon ekta notun collection er jonno router ekটা line:

```js
// server/src/routes/experiences.js
import Experience from '../models/Experience.js'
import { crudRouter } from './crud.js'
export default crudRouter(Experience, { fields: ['role', 'company', 'summary'], arrayFields: ['tags'] })
```

**Rule:** GET public (shobai dekhte pare), kintu POST/PUT/DELETE er age `requireAdmin` — mane token lagbe.

> Blog er jonno ami ekta aro powerful factory banaisi — **`blogRouter`** — jeta extra kaj kore: draft/publish filter, search (`?q=`), category/tag filter, slug detail page. Oita Part 9 e.

---

## 9. Part 6 — Admin auth

Ami puro user system banai nai (dorkar chilo na) — sudhu **ekta admin password**. Flow ta:

1. `/admin` page e password type koro.
2. Backend password check kore, thik hole ekta **JWT token** dey.
3. Frontend token ta `localStorage` e rakhe.
4. Erpor protita admin action e token ta `Authorization: Bearer <token>` header e pathay.

**Login route (`server/src/routes/auth.js`):**

```js
import { Router } from 'express'
import jwt from 'jsonwebtoken'

const router = Router()
router.post('/login', (req, res) => {
  if (req.body.password !== process.env.ADMIN_PASSWORD)
    return res.status(401).json({ error: 'Wrong password.' })
  const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '7d' })
  res.json({ token })
})
export default router
```

**Gate middleware (`server/src/middleware/auth.js`):**

```js
import jwt from 'jsonwebtoken'

// Admin na hole 401 — write routes er jonno
export function requireAdmin(req, res, next) {
  const token = (req.headers.authorization || '').replace('Bearer ', '')
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    if (payload.role !== 'admin') throw new Error()
    req.admin = payload
    next()
  } catch {
    res.status(401).json({ error: 'Invalid or expired token.' })
  }
}

// Reject kore na, kintu token thakle req.admin set kore — drafts dekhanor jonno
export function optionalAdmin(req, _res, next) {
  const token = (req.headers.authorization || '').replace('Bearer ', '')
  try { if (token) { const p = jwt.verify(token, process.env.JWT_SECRET); if (p.role === 'admin') req.admin = p } } catch {}
  next()
}
```

> **`optionalAdmin` ta smart trick:** ekই route public visitor ke sudhu **published** content dey, kintu admin (token soho) **draft soho shob** dekhe. Same endpoint, dui rokom result.

---

## 10. Part 7 — Admin panel

Admin panel ta ekta single-file (`src/components/Admin.jsx`), kintu **config-driven** — mane protita collection er jonno alada form component likhi nai. Ekta `COLLECTIONS` map e ki ki field ache bole di, ar ekta generic `CollectionForm` oita render kore dey.

```js
const COLLECTIONS = {
  projects: {
    label: 'project', resource: 'projects',
    list: (token) => api.listProjects(),
    titleKey: 'title',
    fields: [
      { key: 'title', label: 'Title', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'tags', label: 'Tags', type: 'tags' },
      { key: 'liveUrl', label: 'Live URL' },
    ],
  },
  // skills, experiences, posts, photos... shob ekই pattern
}
```

Generic form ta `field.type` dekhe thik input render kore:

```jsx
{f.type === 'textarea' ? <textarea rows={f.rows || 3} .../>
 : f.type === 'tags'    ? <TagsInput .../>
 : f.type === 'select'  ? <select>...options...</select>
 : f.type === 'boolean' ? <input type="checkbox" .../>
 : f.type === 'image'   ? <ImageField .../>   // canvas diye compress kore base64
 : <input type="text" .../>}
```

Notun content type add korte gele sudhu `COLLECTIONS` e ekta entry add kori — notun UI code lage na. Ei "config over code" pattern tai admin ke maintainable rakhe.

> **Talking point:** "Ami admin ta data-driven banaisi. Notun ekta section add korte hole ekta config object e ekta line, notun form likhte hoy na." — DRY principle er real example.

---

## 11. Part 8 — Frontend ↔ Backend connect

**API client (`src/lib/api.js`):** ekta thin wrapper — JSON in/out, token attach, error readable kore.

```js
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000'

async function request(path, { method = 'GET', body, token } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  const data = await res.json().catch(() => null)
  if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`)
  return data
}

export const api = {
  listProjects: () => request('/api/projects'),
  create: (resource, body, token) => request(`/api/${resource}`, { method: 'POST', body, token }),
  update: (resource, id, body, token) => request(`/api/${resource}/${id}`, { method: 'PUT', body, token }),
  remove: (resource, id, token) => request(`/api/${resource}/${id}`, { method: 'DELETE', token }),
}
```

> `VITE_API_URL` — local e set na thakle `localhost:4000`. Production e Vercel er env var e Render er URL boshabo. Ei ekta variable e frontend jane API kothay.

**Data hook (`src/hooks/useCollection.js`):** component mount hole fetch kore, error hole fallback data dekhay (jate page kokhono khali/broken na dekhay):

```js
import { useState, useEffect } from 'react'

export function useCollection(fetcher, fallback = []) {
  const [items, setItems] = useState(fallback)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    let alive = true
    fetcher()
      .then((data) => { if (alive && Array.isArray(data) && data.length) setItems(data) })
      .catch(() => {}) // fallback e theke jabe
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [])
  return { items, loading }
}
```

Section e use:

```jsx
const { items: projects } = useCollection(api.listProjects, fallbackProjects)
```

Ekhon **loop ta complete**: admin e ekta project add koro → DB te jay → homepage refresh → notun project dekha jay. Eita "real" — hardcoded na.

---

## 12. Part 9 — Blog CMS: Posts

Blog er jonno crudRouter er poriborte ekta boro factory — **`blogRouter`** — jeta blog-specific kaj kore.

**Post model (`server/src/models/Post.js`)** e important field:
- `slug` (unique, URL er jonno), `content` (Markdown text), `status` ('draft' | 'published'), `featured` (Boolean), `readingTime` (save korar shomoy auto-compute), `publishedAt`.

Auto kaj gula Mongoose "hooks" e:

```js
postSchema.pre('validate', function (next) {
  if (!this.slug && this.title) this.slug = slugify(this.title)  // slug auto
  next()
})
postSchema.pre('save', function (next) {
  this.readingTime = Math.max(1, Math.round(this.content.split(/\s+/).length / 200)) // ~200 wpm
  if (this.status === 'published' && !this.publishedAt) this.publishedAt = new Date()
  next()
})
```

**`blogRouter` er behaviour (crudRouter er cheye extra):**
- `GET /` → `optionalAdmin`: public hole sudhu `status: 'published'`; token thakle **draft soho** shob. `?q=`, `?category=`, `?tag=`, `?status=` diye server-side filter/search.
- `GET /:slug` → detail page er jonno; draft holে sudhu admin dekhbe, na hole 404.
- `POST/PUT/DELETE` → `requireAdmin`.

> ⚠️ **Gotcha #2 (jeta amake dhorse):** `featured` field ta boolean. `Boolean("false")` JavaScript e **`true`**! Tai frontend theke ekta **asol** boolean pathate hobe (checkbox), string na. Server e `out.featured = Boolean(body.featured)` sudhu tokhoni thik jokhon body.featured already true/false.

**Frontend — Markdown render (`src/components/blog/Markdown.jsx`):**

```bash
npm install react-markdown remark-gfm
```

```jsx
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

// protita HTML tag ke amar black+gold style e map kori
const components = {
  h2: (p) => <h2 className="mt-10 font-display text-xl font-bold text-ink" {...p} />,
  a:  ({ href, ...p }) => <a href={href} className="text-neonCyan underline" {...p} />,
  code: ({ className, children }) => <code className="...">{children}</code>,
  // ... ul, blockquote, img, table
}
export default function Markdown({ children }) {
  return <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>{children || ''}</ReactMarkdown>
}
```

> ⚠️ **Gotcha #3:** react-markdown v9 te `inline` prop nai. Inline naki block code bujhi content dekhe: `/language-/.test(className) || String(children).includes('\n')`.

**Blog pages:**
- `Blog.jsx` — hero + filter tabs (All/Posts/Photos/Videos) + search. `useCollection` diye posts ane, `PostCard` grid e dekhay.
- `PostCard.jsx` — ekta card, `/blog/post/:slug` e link kore.
- `BlogPost.jsx` — detail page: `api.getPost(slug)` fetch kore `<Markdown>` diye content render kore. `document.title` o set kore (browser tab + share).
- `BlogApp.jsx` — chhoto router: `/blog` → list, `/blog/post/:slug` → detail.

**Full flow ja demo kora jay:** admin e post likho (Markdown) → draft save → `/blog` e dekha jay **na** → publish → shathe shathe card ashe → card e click → detail page e formatted Markdown + code highlight. Refresh dao — kichu haray na. **Eita ekta real CMS.**

---

## 13. Part 10 — Media with Cloudinary

Photo/video **DB te rakha jay na** — kারণ: MongoDB document max **16 MB**, request body ও limited, ar Render er disk temporary. Tai media object storage (**Cloudinary**) e jay, DB te sudhu **URL + metadata**.

**Core security idea:** file browser theke **direct Cloudinary te** upload hobe (fast, server er RAM khay na), kintu Cloudinary er **API secret** kono din frontend e ashbe na. Kivabe? Server ekta **signature** banaye dey — ekta short-lived proof je "ei upload ta admin approve korse".

**Cloudinary setup:**
1. Free account → Dashboard e **Cloud name**, **API Key**, **API Secret** pabe.
2. `server/.env` e rakho (secret — git e na):
```
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

**Server signing (`server/src/lib/cloudinary.js`)** — SDK lage na, Node er `crypto`:

```js
import crypto from 'node:crypto'
const { CLOUDINARY_CLOUD_NAME: CLOUD, CLOUDINARY_API_KEY: KEY, CLOUDINARY_API_SECRET: SECRET } = process.env

// params sort kore, k=v&k=v banai, secret jog kore SHA-1 hash — eita Cloudinary er niyom
export function signParams(params) {
  const toSign = Object.entries(params)
    .filter(([, v]) => v !== '' && v != null)
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([k, v]) => `${k}=${v}`).join('&')
  return crypto.createHash('sha1').update(toSign + SECRET).digest('hex')
}

export function signedUpload({ folder = 'portfolio', resourceType = 'image' } = {}) {
  const timestamp = Math.floor(Date.now() / 1000)
  const signature = signParams({ folder, timestamp })
  return { cloudName: CLOUD, apiKey: KEY, timestamp, folder, signature,
           uploadUrl: `https://api.cloudinary.com/v1_1/${CLOUD}/${resourceType}/upload` }
}
```

**Sign route (`server/src/routes/media.js`):**

```js
router.post('/sign', requireAdmin, (req, res) => {
  const kind = req.body?.kind === 'video' ? 'video' : 'image'
  const folder = kind === 'video' ? 'portfolio/videos' : 'portfolio/photos'
  res.json(signedUpload({ folder, resourceType: kind }))
})
```

**Browser upload (`src/lib/upload.js`)** — `XMLHttpRequest` diye (progress % pai):

```js
export async function uploadToCloudinary(file, { kind = 'image', token, onProgress } = {}) {
  const sig = await api.signUpload(kind, token)          // 1. server theke signature
  const form = new FormData()
  form.append('file', file)
  form.append('api_key', sig.apiKey)
  form.append('timestamp', sig.timestamp)
  form.append('folder', sig.folder)
  form.append('signature', sig.signature)
  return new Promise((resolve, reject) => {              // 2. direct Cloudinary te
    const xhr = new XMLHttpRequest()
    xhr.open('POST', sig.uploadUrl)
    xhr.upload.onprogress = (e) => onProgress?.(Math.round((e.loaded / e.total) * 100))
    xhr.onload = () => {
      const d = JSON.parse(xhr.responseText)
      resolve({ secureUrl: d.secure_url, publicId: d.public_id, width: d.width, height: d.height })
    }
    xhr.onerror = () => reject(new Error('Upload failed'))
    xhr.send(form)
  })
}
```

Upload success hole `secure_url` + `public_id` DB te save kori (`api.create('photos', {...})`). Delete korle server `public_id` diye Cloudinary er **destroy** endpoint call kore (eiটাও signed) — jate storage e orphan file na thake.

**Video bonus:** thumbnail alada banate hoy na — Cloudinary URL e `so_0` (second 0) transform boshale video er first frame ekta poster image hoye jay.

> **Talking point:** "Media direct-to-storage upload hoy, signed URL diye — server er RAM/bandwidth bache, ar secret key kono din client e jay na. Eita production-grade pattern."

---

## 14. Part 11 — Deployment

Sequence: **DB → Backend → Frontend** (dependency order).

**1. MongoDB Atlas** — already live (Part 4). Network Access e `0.0.0.0/0` allow (Render er IP fixed na).

**2. Backend → Render:**
- Code GitHub e push koro.
- Render → **New → Blueprint** → repo select. Ei `render.yaml` ta Render ke bole ki banate:
```yaml
services:
  - type: web
    name: portfolio-api
    runtime: node
    plan: free
    rootDir: server            # backend server/ folder e
    buildCommand: npm install
    startCommand: npm start
    healthCheckPath: /api/health
    envVars:
      - key: MONGODB_URI
        sync: false            # secret — dashboard e hate boshabo
      - key: JWT_SECRET
        sync: false
      - key: ADMIN_PASSWORD
        sync: false
      - key: CLIENT_ORIGIN
        sync: false
      - key: CLOUDINARY_CLOUD_NAME
        sync: false
      - key: CLOUDINARY_API_KEY
        sync: false
      - key: CLOUDINARY_API_SECRET
        sync: false
```
- `sync: false` env var gula Render **dashboard e hate** boshabo (secret, tai git e na).
- Deploy hole ekta URL pabe: `https://portfolio-api-xxxx.onrender.com`.
> ⚠️ Free tier "cold start" kore — 15 min idle thakle ghumay, prothom request e ~30s late. Normal.

**3. Frontend → Vercel:**
- Vercel → import repo.
- **Environment Variable:** `VITE_API_URL = https://portfolio-api-xxxx.onrender.com` (Render er URL).
- **`vercel.json`** (SPA er deep link er jonno — `/blog/post/x` refresh dile 404 na kore index.html serve kore):
```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```
- Deploy → live URL pabe.

**4. Last connect:** Render er `CLIENT_ORIGIN` env te Vercel er URL boshao (CORS er jonno), jate backend sudhu tomar frontend er request nay.

Order mne rakhbe: **Atlas আগে → Render (backend URL pai) → Vercel (oi URL + nijer URL pai) → Render er CLIENT_ORIGIN update.**

---

## 15. Part 12 — Security & gotchas

Jei bhul / shikkha gula real:

- **Secrets kono din git e na.** `.env` **first** e `.gitignore` e. Connection string / password / JWT secret / Cloudinary secret — kevol server env e. Frontend e (`VITE_` var) sudhu **public** jinish (API base URL) rakho — VITE_ var browser e chole ashe.
- **Boolean coercion:** `Boolean("false") === true`. String ke boolean vabo na. (Gotcha #2)
- **`.jsx` extension** JSX file e (Gotcha #1).
- **Tailwind v4:** config CSS er bhitor (`@theme`), alada `tailwind.config.js` nai.
- **CORS:** production e `origin: *` na, specific frontend origin.
- **`requireAdmin` protita write route e** — GET public, but create/update/delete/upload-sign shob protected.
- **No fake data:** empty hole honest "nothing yet" empty-state dekhabe, banano data na. (Portfolio e integrity important.)
- **Fallback data:** frontend e `useCollection(fetcher, fallback)` — API down thakleও site broken dekhabe na.
- **Deep-link rewrite** (`vercel.json`) na dile `/blog/post/x` refresh e 404.

---

## 16. Appendix — Command checklist

```bash
# --- Frontend ---
npm create vite@latest portfolio -- --template react
cd portfolio && npm install
npm install tailwindcss @tailwindcss/vite framer-motion lucide-react
npm install react-markdown remark-gfm
npm run dev                 # http://localhost:5173

# --- Backend ---
mkdir server && cd server && npm init -y
# package.json e "type": "module" add koro
npm install express mongoose cors dotenv jsonwebtoken bcryptjs express-rate-limit
# server/.env banao (MONGODB_URI, JWT_SECRET, ADMIN_PASSWORD, CLIENT_ORIGIN, CLOUDINARY_*)
npm run dev                 # http://localhost:4000/api/health

# --- Build test (deploy er age) ---
cd .. && npm run build      # frontend production build clean kina

# --- Deploy ---
# 1. GitHub e push
# 2. Render: New → Blueprint → repo (render.yaml pore) → secret env dashboard e boshao
# 3. Vercel: import repo → VITE_API_URL = <render url> → deploy
# 4. Render CLIENT_ORIGIN = <vercel url> update
```

**Full learning path (order):**
Frontend static → theme/tokens → components → backend + Atlas → model + route → route factory → auth (JWT) → admin panel → frontend↔backend connect → blog CMS (markdown) → Cloudinary media → deploy.

---

> Ei document tai tomar "How I built this" — nije rebuild korte parba, ar keউ jiggesh korle Part 1 (pitch) bole, tarpor jei part e interest, oita explain korte parba. 🚀
