import { lazy, Suspense, useEffect } from 'react'
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
import AppsHub from './components/AppsHub'
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
  const isApps = path === '/apps'

  // Recover the #hash scroll after a hard load onto the home page. Crossing
  // /blog → /#section is a full reload (see lib/router.jsx), and the browser
  // tries to jump to the anchor before React has mounted the sections, so it
  // gives up at the top. We jump once the DOM is committed, then re-align each
  // time the page grows under us — sections whose images and data arrive async
  // (Projects/Experience/Events) reflow after first paint and keep nudging the
  // target below the navbar. We stop the instant the visitor scrolls for real
  // (wheel / touch / arrow keys) so we never fight them; browser scroll
  // anchoring, which moves scrollY on its own during those reflows, is ignored.
  useEffect(() => {
    if (isAdmin || isBlog || isApps) return
    const id = decodeURIComponent(window.location.hash.replace(/^#/, ''))
    if (!id) return

    const jump = () => {
      const el = document.getElementById(id)
      if (el) el.scrollIntoView({ behavior: 'auto', block: 'start' }) // respects scroll-mt
    }
    const onKey = (e) => {
      if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(e.key)) stop()
    }
    const raf = requestAnimationFrame(jump)
    const ro = new ResizeObserver(jump)
    ro.observe(document.body)
    const timer = setTimeout(stop, 2500) // give async images time, then release
    function stop() {
      cancelAnimationFrame(raf)
      ro.disconnect()
      clearTimeout(timer)
      window.removeEventListener('wheel', stop)
      window.removeEventListener('touchstart', stop)
      window.removeEventListener('keydown', onKey)
    }
    window.addEventListener('wheel', stop, { passive: true })
    window.addEventListener('touchstart', stop, { passive: true })
    window.addEventListener('keydown', onKey)
    return stop
  }, [isAdmin, isBlog, isApps])

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
              ) : isApps ? (
                <AppsHub />
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
