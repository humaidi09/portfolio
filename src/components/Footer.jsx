import { ArrowUp, Heart, Mail } from 'lucide-react'
import { GithubIcon, LinkedinIcon, WhatsappIcon } from './ui/BrandIcons'
import { personalInfo } from '../data/portfolioData'

// Only verified handles. To add Facebook / Instagram / X, add the URL to
// personalInfo and a matching entry here (icons: FacebookIcon, etc.).
const SOCIALS = [
  { key: 'github', label: 'GitHub', Icon: GithubIcon },
  { key: 'linkedin', label: 'LinkedIn', Icon: LinkedinIcon },
  { key: 'whatsapp', label: 'WhatsApp', Icon: WhatsappIcon },
]

const QUICK_NAV = [
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'experience', label: 'Experience' },
  { id: 'terminal', label: 'Terminal' },
  { id: 'contact', label: 'Contact' },
]

export default function Footer() {
  const year = new Date().getFullYear()

  const toTop = () =>
    window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })

  const socialBtn =
    'grid h-10 w-10 place-items-center rounded-lg border border-hair bg-fill text-muted transition-all duration-200 hover:-translate-y-0.5 hover:border-neonCyan/40 hover:text-neonCyan'

  return (
    <footer className="relative mt-10 border-t border-hair">
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-px rule-gradient" />

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          {/* Identity */}
          <div className="max-w-sm">
            <a href="#top" className="font-display text-xl font-bold text-gradient">
              {personalInfo.name}
            </a>
            <p className="mt-3 text-sm leading-relaxed text-muted">{personalInfo.role}</p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {SOCIALS.map(({ key, label, Icon }) => (
                <a
                  key={key}
                  href={personalInfo[key]}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className={socialBtn}
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
              <a href={`mailto:${personalInfo.email}`} aria-label="Email" className={socialBtn}>
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick nav */}
          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-10 gap-y-2.5 sm:grid-cols-3 md:grid-cols-2">
            {QUICK_NAV.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="text-sm text-muted transition-colors hover:text-neonCyan"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col-reverse items-center gap-4 border-t border-hair pt-6 sm:flex-row sm:justify-between">
          <p className="text-center font-mono text-xs text-muted sm:text-left">
            © {year} {personalInfo.name}. All rights reserved.
          </p>
          <p className="inline-flex items-center gap-1.5 font-mono text-xs text-muted">
            Built with <Heart className="h-3.5 w-3.5 text-neon-magenta" /> using React, Tailwind &amp; Framer Motion
          </p>
        </div>
      </div>

      {/* Scroll to top */}
      <button
        type="button"
        onClick={toTop}
        aria-label="Back to top"
        className="group absolute -top-5 right-4 grid h-11 w-11 place-items-center rounded-full border border-neonCyan/40 bg-neonCyan text-void shadow-lg shadow-black/40 transition-transform duration-200 hover:-translate-y-0.5 hover:scale-105 sm:right-6"
      >
        <ArrowUp className="h-5 w-5 transition-transform duration-200 group-hover:-translate-y-0.5" />
      </button>
    </footer>
  )
}
