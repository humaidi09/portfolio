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

/**
 * Root layout. ThemeProvider keeps the dark/light class in sync on <html>;
 * ToastProvider exposes useToast() and renders the toast viewport. Sections
 * are ordered to match the navbar anchors (top → about → … → contact).
 */
export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
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
      </ToastProvider>
    </ThemeProvider>
  )
}
