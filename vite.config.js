import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'node:fs'
import path from 'node:path'

// The six standalone apps are each their own Vite build, copied into
// public/<app>/ and deployed at /<app>/ (see vercel.json rewrites). Vite's dev
// and preview servers otherwise treat a bare "/banking/" navigation as an SPA
// request and fall back to the portfolio's own index.html — so every app card
// would land on the home page when running locally. This plugin mirrors the
// production rewrites (/<app> and /<app>/(.*) → /<app>/index.html): it serves
// the app's built index.html for the entry request AND any in-app route (so a
// hard load or refresh on /<app>/some/route works the same as on Vercel). Real
// files (/<app>/assets/*, favicon, …) are left to Vite's static layer so they
// are served as themselves rather than rewritten to index.html.
const APP_SUBPATHS = ['nonet', 'worldcup', 'banking', 'login', 'restaurant', 'cgpa']

function serveStandaloneApps() {
  const handler = (root) => (req, res, next) => {
    const pathname = (req.url || '').split('?')[0]
    const app = APP_SUBPATHS.find((a) => pathname === `/${a}` || pathname.startsWith(`/${a}/`))
    if (!app) return next()
    // Defer to Vite's static serving when the request maps to a real file on
    // disk (the built assets). Only genuine in-app routes fall through to the
    // app's index.html — matching the Vercel rewrite's (.*) behaviour.
    const rel = pathname.replace(/^\/+/, '')
    const onDisk = rel && path.join(root, rel)
    if (onDisk && fs.existsSync(onDisk) && fs.statSync(onDisk).isFile()) return next()
    const file = path.join(root, app, 'index.html')
    if (!fs.existsSync(file)) return next() // not built yet → normal fallback
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.end(fs.readFileSync(file))
  }
  return {
    name: 'serve-standalone-apps',
    // Registered directly (not via a returned function) so it runs before
    // Vite's SPA-fallback middleware and wins the entry request.
    configureServer(server) {
      server.middlewares.use(handler(path.resolve('public'))) // dev: public/<app>/
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler(path.resolve('dist'))) // preview: dist/<app>/
    },
  }
}

export default defineConfig({
  plugins: [serveStandaloneApps(), react(), tailwindcss()],
})
