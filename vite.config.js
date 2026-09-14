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
// production rewrites: it serves the app's built index.html for the entry
// request. Asset requests (/banking/assets/*) are plain static files that Vite
// already serves from public/ (dev) or dist/ (preview).
const APP_SUBPATHS = ['nonet', 'worldcup', 'banking', 'login', 'restaurant', 'cgpa']

function serveStandaloneApps() {
  const handler = (root) => (req, res, next) => {
    const pathname = (req.url || '').split('?')[0]
    const app = APP_SUBPATHS.find((a) => pathname === `/${a}` || pathname === `/${a}/`)
    if (!app) return next()
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
