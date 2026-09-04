import { ArrowUp, Mail, MapPin, Phone } from 'lucide-react'
import { GithubIcon, LinkedinIcon, WhatsappIcon } from './ui/BrandIcons'
import { personalInfo } from '../data/portfolioData'

// Only verified handles. To add Facebook / Instagram / X, add the URL to
// personalInfo and a matching entry here (icons: FacebookIcon, etc.).
const SOCIALS = [
  { key: 'github', label: 'GitHub', Icon: GithubIcon },
  { key: 'linkedin', label: 'LinkedIn', Icon: LinkedinIcon },
  { key: 'whatsapp', label: 'WhatsApp', Icon: WhatsappIcon },
]

const NAV = [
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'experience', label: 'Experience' },
  { id: 'events', label: 'Events' },
  { id: 'contact', label: 'Contact' },
]

export default function Footer() {
  const year = new Date().getFullYear()

  const toTop = () =>
    window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })

  const socialBtn =
    'grid h-10 w-10 place-items-center rounded-xl border border-hair bg-fill text-muted transition-all duration-200 hover:-translate-y-0.5 hover:border-neonCyan/40 hover:text-neonCyan'

  return (
    <footer className="relative mt-10 border-t border-hair">
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-px rule-gradient" />

      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          {/* Identity */}
          <div className="max-w-sm">
            <a href="#top" className="font-display text-2xl font-bold text-gradient">
              {personalInfo.name}
            </a>
            <p className="mt-3 text-sm leading-relaxed text-muted">{personalInfo.role}</p>
            <div className="mt-5 flex flex-wrap items-center gap-2.5">
              {SOCIALS.map(({ key, label, Icon }) => (
                <a
                  key={key}
                  href={personalInfo[key]}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className={socialBtn}
                >
                  <Icon className="h-[18px] w-[18px]" />
                </a>
              ))}
              <a href={`mailto:${personalInfo.email}`} aria-label="Email" className={socialBtn}>
                <Mail className="h-[18px] w-[18px]" />
              </a>
            </div>
          </div>

          {/* Explore */}
          <nav aria-label="Footer navigation">
            <h3 className="font-mono text-xs uppercase tracking-widest text-muted/70">Explore</h3>
            <ul className="mt-4 space-y-2.5">
              {NAV.map((item) => (
                <li key={item.id}>
                  <a href={`#${item.id}`} className="text-sm text-muted transition-colors hover:text-neonCyan">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Get in touch */}
          <div>
            <h3 className="font-mono text-xs uppercase tracking-widest text-muted/70">Get in touch</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <a href={`mailto:${personalInfo.email}`} className="group flex items-start gap-2.5 text-sm text-muted transition-colors hover:text-neonCyan">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-neonCyan" />
                  <span className="break-all">{personalInfo.email}</span>
                </a>
              </li>
              <li>
                <a href={`tel:${personalInfo.phone}`} className="flex items-start gap-2.5 text-sm text-muted transition-colors hover:text-neonCyan">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-neonCyan" />
                  <span>{personalInfo.phone}</span>
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-muted">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-neonCyan" />
                <span>{personalInfo.university}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col-reverse items-center gap-3 border-t border-hair pt-6 sm:flex-row sm:justify-between">
          <p className="font-mono text-xs text-muted">© {year} {personalInfo.name}. All rights reserved.</p>
          <a href="/admin" className="font-mono text-xs text-muted/50 transition-colors hover:text-neonCyan">
            Admin
          </a>
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
