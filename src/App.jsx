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
import Gallery from './components/Gallery'
import Contact from './components/Contact'
import Footer from './components/Footer'
import Admin from './components/Admin'
import BlogApp from './components/blog/BlogApp'
import { useRoute } from './lib/router'

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
          <Admin />
        ) : (
          <>
            <AmbientBackground />
            <Navbar />
            <main>
              {isBlog ? (
                <BlogApp />
              ) : (
                <>
                  <Hero />
                  <About />
                  <Skills />
                  <CompetitiveProgramming />
                  <Projects />
                  <Experience />
                  <Events />
                  <Gallery />
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
