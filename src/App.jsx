import { lazy, Suspense } from 'react'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './context/ToastContext'
import Navbar from './components/Navbar'
import AmbientBackground from './components/ui/AmbientBackground'
import Hero from './components/Hero'
import About from './components/About'
import Skills from './components/Skills'
import CompetitiveProgramming from './components/CompetitiveProgramming'
import Projects from './components/Projects'
import Experience from './components/Experience'
import Events from './components/Events'
import Contact from './components/Contact'
import Footer from './components/Footer'
import { useRoute } from './lib/router'

// Admin (/admin) and the Blog subtree (/blog) are their own routes — a visitor
// on the landing page never needs their code. Loading them lazily keeps the
// main bundle small so the homepage paints fast on mobile. Each becomes its own
// chunk fetched only when its route is opened.
const Admin = lazy(() => import('./components/Admin'))
const BlogApp = lazy(() => import('./components/blog/BlogApp'))

/**
 * Root layout. ThemeProvider keeps the dark/light class in sync on <html>;
 * ToastProvider exposes useToast() and renders the toast viewport. Sections
 * are ordered to match the navbar anchors (top → about → … → contact).
 *
 * Routing is deliberately tiny — /admin is its own full-page view, the /blog
 * subtree is a client-routed app (see lib/router.js), and everything else is
 * the single scroll page. We branch on the pathname rather than pulling in a
 * router dependency.
 */
export default function App() {
  const pathname = useRoute()
  const path = pathname.replace(/\/+$/, '') || '/'
  const isAdmin = path === '/admin'
  const isBlog = path === '/blog' || path.startsWith('/blog/')

  return (
    <ThemeProvider>
      <ToastProvider>
        {isAdmin ? (
          <Suspense fallback={null}>
            <Admin />
          </Suspense>
        ) : (
          <>
            <AmbientBackground />
            <Navbar />
            <main>
              {isBlog ? (
                <Suspense fallback={null}>
                  <BlogApp />
                </Suspense>
              ) : (
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
              )}
            </main>
            <Footer />
          </>
        )}
      </ToastProvider>
    </ThemeProvider>
  )
}
