import { ArrowUp, Mail } from 'lucide-react'
import { GithubIcon, LinkedinIcon, WhatsappIcon } from './ui/BrandIcons'
import { personalInfo } from '../data/portfolioData'

// Only verified handles. To add Facebook / Instagram / X, add the URL to
// personalInfo and a matching entry here (icons: FacebookIcon, etc.).
const SOCIALS = [
  { key: 'github', label: 'GitHub', Icon: GithubIcon },
  { key: 'linkedin', label: 'LinkedIn', Icon: LinkedinIcon },
  { key: 'whatsapp', label: 'WhatsApp', Icon: WhatsappIcon },
]

export default function Footer() {
  const year = new Date().getFullYear()

  const toTop = () =>
    window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })

  const socialBtn =
    'grid h-11 w-11 place-items-center rounded-xl border border-hair bg-fill text-muted transition-all duration-200 hover:-translate-y-0.5 hover:border-neonCyan/40 hover:text-neonCyan'

  return (
    <footer className="relative mt-10 border-t border-hair">
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-px rule-gradient" />

      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-14 text-center sm:px-6">
        {/* Wordmark */}
        <a href="#top" className="font-display text-2xl font-bold text-gradient">
          {personalInfo.name}
        </a>

        {/* Socials */}
        <div className="flex flex-wrap items-center justify-center gap-3">
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

        {/* Bottom line */}
        <div className="mt-2 flex items-center gap-3 font-mono text-xs text-muted">
          <span>© {year} {personalInfo.name}</span>
          <span aria-hidden="true" className="text-hair-strong">·</span>
          <a href="/admin" className="text-muted/60 transition-colors hover:text-neonCyan">
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
