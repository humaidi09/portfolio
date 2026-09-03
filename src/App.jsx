import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './context/ToastContext'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Skills from './components/Skills'
import Projects from './components/Projects'
import Experience from './components/Experience'
import Terminal from './components/Terminal'
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
            <Navbar />
            <main>
              <Hero />
              <About />
              <Skills />
              <Projects />
              <Experience />
              <Terminal />
              <Contact />
            </main>
            <Footer />
          </>
        )}
      </ToastProvider>
    </ThemeProvider>
  )
}
