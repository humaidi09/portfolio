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

/**
 * Root layout. ThemeProvider keeps the dark/light class in sync on <html>;
 * ToastProvider exposes useToast() and renders the toast viewport. Sections
 * are ordered to match the navbar anchors (top → about → … → contact).
 *
 * Routing is deliberately tiny — the site is a single page plus one /admin
 * view — so we branch on the pathname rather than pulling in a router.
 */
export default function App() {
  const isAdmin = window.location.pathname.replace(/\/$/, '') === '/admin'

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
              <Hero />
              <About />
              <Skills />
              <CompetitiveProgramming />
              <Projects />
              <Experience />
              <Events />
              <Gallery />
              <Contact />
            </main>
            <Footer />
          </>
        )}
      </ToastProvider>
    </ThemeProvider>
  )
}
