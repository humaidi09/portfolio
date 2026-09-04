import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, Moon, Sun, X } from 'lucide-react'
import { GithubIcon, LinkedinIcon } from './ui/BrandIcons'
import { useTheme } from '../context/ThemeContext'
import { personalInfo } from '../data/portfolioData'

const NAV_ITEMS = [
  { id: 'top', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'cp', label: 'CP' },
  { id: 'projects', label: 'Projects' },
  { id: 'experience', label: 'Experience' },
  { id: 'events', label: 'Events' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'contact', label: 'Contact' },
]

/** Sun ⇄ Moon toggle wired to ThemeContext. */
function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
      className={`relative grid h-9 w-9 place-items-center overflow-hidden rounded-lg border border-hair bg-fill text-muted transition-colors hover:border-neonCyan/40 hover:text-neonCyan ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ y: -18, opacity: 0, rotate: -30 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: 18, opacity: 0, rotate: 30 }}
          transition={{ duration: 0.2 }}
        >
          {isDark ? <Moon className="h-[18px] w-[18px]" /> : <Sun className="h-[18px] w-[18px]" />}
        </motion.span>
      </AnimatePresence>
    </button>
  )
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [progress, setProgress] = useState(0)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('top')
  const rafRef = useRef(0)

  // Scroll progress + frosted state, throttled with rAF for smoothness.
  useEffect(() => {
    const onScroll = () => {
      if (rafRef.current) return
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = 0
        const el = document.documentElement
        const max = el.scrollHeight - el.clientHeight
        setProgress(max > 0 ? el.scrollTop / max : 0)
        setScrolled(el.scrollTop > 12)
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  // Highlight the nav item for the section currently in view.
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id)
        })
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    NAV_ITEMS.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) obs.observe(el)
    })
    return () => obs.disconnect()
  }, [])

  // Lock body scroll while the mobile drawer is open, and close on Escape.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  const iconLink =
    'grid h-9 w-9 place-items-center rounded-lg border border-hair bg-fill text-muted transition-colors hover:border-neonCyan/40 hover:text-neonCyan'

  return (
    <>
      {/* Top scroll-progress bar */}
      <div className="fixed inset-x-0 top-0 z-[60] h-[3px] bg-transparent" aria-hidden="true">
        <div
          className="h-full origin-left bg-gradient-to-r from-neonCyan to-neonPurple"
          style={{ transform: `scaleX(${progress})` }}
        />
      </div>

      <header className={`fixed inset-x-0 top-0 z-50 px-4 transition-all duration-300 ${scrolled ? 'pt-3' : 'pt-5'}`}>
        <nav
          className={`glass-strong mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-2xl border border-hair px-4 backdrop-blur-xl transition-all duration-300 sm:px-5 ${
            scrolled ? 'py-2.5 shadow-xl shadow-black/40' : 'py-2 shadow-lg shadow-black/20'
          }`}
        >
          <a href="#top" className="flex items-center gap-2.5 font-mono text-sm font-semibold">
            <span className="rounded-full bg-gradient-to-br from-neonCyan to-neonPurple p-[1.5px] shadow-[0_0_16px_-4px_rgba(242,180,61,0.55)]">
              <img
                src={personalInfo.photo}
                alt={personalInfo.name}
                className="h-8 w-8 rounded-full object-cover object-top"
              />
            </span>
            <span className="text-ink">
              Hussain <span className="text-neonCyan">Ahmed</span>
            </span>
          </a>

          {/* Desktop nav */}
          <ul className="hidden items-center gap-0.5 lg:flex">
            {NAV_ITEMS.map((n) => (
              <li key={n.id}>
                <a
                  href={`#${n.id}`}
                  className={`relative rounded-lg px-3 py-2 text-sm transition-colors ${
                    active === n.id ? 'text-ink' : 'text-muted hover:text-ink'
                  }`}
                >
                  {active === n.id && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 -z-10 rounded-lg border border-hair bg-fill"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  {n.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="hidden items-center gap-2 lg:flex">
            <a href={personalInfo.github} target="_blank" rel="noreferrer" aria-label="GitHub" className={iconLink}>
              <GithubIcon className="h-4 w-4" />
            </a>
            <a href={personalInfo.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn" className={iconLink}>
              <LinkedinIcon className="h-4 w-4" />
            </a>
            <ThemeToggle />
            <a
              href="#contact"
              className="rounded-lg bg-neonCyan px-4 py-2 text-sm font-semibold text-void transition-opacity duration-200 hover:opacity-90"
            >
              Let&rsquo;s talk
            </a>
          </div>

          {/* Mobile controls */}
          <div className="flex items-center gap-2 lg:hidden">
            <ThemeToggle />
            <button
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              aria-expanded={open}
              className="grid h-10 w-10 place-items-center rounded-lg border border-hair bg-fill text-ink"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile slide-in drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm lg:hidden"
              aria-hidden="true"
            />
            <motion.aside
              key="drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 34 }}
              className="glass-strong fixed inset-y-0 right-0 z-[71] flex w-[82%] max-w-xs flex-col p-5 lg:hidden"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 font-mono text-sm font-semibold text-ink">
                  <span className="rounded-full bg-gradient-to-br from-neonCyan to-neonPurple p-[1.5px]">
                    <img
                      src={personalInfo.photo}
                      alt={personalInfo.name}
                      className="h-7 w-7 rounded-full object-cover object-top"
                    />
                  </span>
                  Hussain <span className="text-neonCyan">Ahmed</span>
                </span>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="grid h-10 w-10 place-items-center rounded-lg border border-hair bg-fill text-ink"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <ul className="mt-6 flex flex-col gap-1">
                {NAV_ITEMS.map((n, i) => (
                  <motion.li
                    key={n.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.08 + i * 0.05 }}
                  >
                    <a
                      href={`#${n.id}`}
                      onClick={() => setOpen(false)}
                      className={`block rounded-xl px-4 py-3 text-sm transition-colors ${
                        active === n.id ? 'bg-fill text-ink' : 'text-muted hover:bg-fill hover:text-ink'
                      }`}
                    >
                      {n.label}
                    </a>
                  </motion.li>
                ))}
              </ul>

              <a
                href="#contact"
                onClick={() => setOpen(false)}
                className="mt-4 block rounded-xl bg-neonCyan px-4 py-3 text-center text-sm font-semibold text-void transition-opacity duration-200 hover:opacity-90"
              >
                Let&rsquo;s talk
              </a>

              <div className="mt-auto flex items-center gap-2 pt-6">
                <a href={personalInfo.github} target="_blank" rel="noreferrer" aria-label="GitHub" className={iconLink}>
                  <GithubIcon className="h-4 w-4" />
                </a>
                <a href={personalInfo.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn" className={iconLink}>
                  <LinkedinIcon className="h-4 w-4" />
                </a>
                <span className="ml-1 font-mono text-xs text-muted">// let&rsquo;s connect</span>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
