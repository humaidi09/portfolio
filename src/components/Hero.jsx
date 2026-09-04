import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowUpRight, Award, Download, GraduationCap, Mail, Zap } from 'lucide-react'
import { useToast } from '../context/ToastContext'
import { api, cvUrl } from '../lib/api'
import { useCollection } from '../hooks/useCollection'
import GridSignal from './ui/GridSignal'
import CodeTerminal from './ui/CodeTerminal'
import {
  personalInfo,
  stats as staticStats,
  skills,
  projects,
  experiences,
  certifications,
} from '../data/portfolioData'

/** Types each phrase out, holds, deletes, moves to the next — forever. */
function useTypewriter(words, { typeSpeed = 55, deleteSpeed = 28, hold = 1600 } = {}) {
  const [text, setText] = useState('')
  const [index, setIndex] = useState(0)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const word = words[index % words.length]
    let timer
    if (!deleting && text === word) {
      timer = setTimeout(() => setDeleting(true), hold)
    } else if (deleting && text === '') {
      setDeleting(false)
      setIndex((i) => i + 1)
    } else {
      timer = setTimeout(
        () => setText(word.slice(0, deleting ? text.length - 1 : text.length + 1)),
        deleting ? deleteSpeed : typeSpeed,
      )
    }
    return () => clearTimeout(timer)
  }, [text, deleting, index, words, typeSpeed, deleteSpeed, hold])

  return text
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
}

/** Builds a plain-text CV from the portfolio data and triggers a download. */
function buildResume() {
  const line = '='.repeat(60)
  const parts = [
    personalInfo.name.toUpperCase(),
    personalInfo.role,
    personalInfo.tagline,
    line,
    `Phone   : ${personalInfo.phone}`,
    `Email   : ${personalInfo.email}`,
    `GitHub  : ${personalInfo.github}`,
    `LinkedIn: ${personalInfo.linkedin}`,
    '',
    'PROFILE',
    personalInfo.bio,
    '',
    'EDUCATION',
    `- ${personalInfo.degree}`,
    `  ${personalInfo.university}`,
    `  CGPA: ${personalInfo.gpa}`,
    '',
    'SKILLS',
    `- Languages : ${skills.languages.join(', ')}`,
    `- Core CS   : ${skills.coreCS.join(', ')}`,
    `- Tools & DB: ${skills.toolsAndDB.join(', ')}`,
    '',
    'PROJECTS',
    ...projects.flatMap((p) => [`- ${p.title} (${p.category})`, `  ${p.summary}`, `  ${p.github}`]),
    '',
    'EXPERIENCE & INVOLVEMENT',
    ...experiences.map((e) => `- ${e.role} — ${e.organization} (${e.period})`),
    '',
    'CERTIFICATIONS',
    ...certifications.map((c) => `- ${c.title} — ${c.issuer} (${c.date})`),
    '',
    line,
    `Generated from ${personalInfo.github}`,
  ]
  return parts.join('\n')
}

// Short, self-contained phrases for the typed focus line — each reads cleanly
// even mid-animation (unlike splitting the long marketing tagline).
const FOCUS_PHRASES = [
  'C++ & DSA',
  'competitive programming',
  'Python & OOP',
  'clean, correct code',
  'modern web apps',
]

export default function Hero() {
  const reduce = useReducedMotion()
  const { toast } = useToast()
  const phrases = FOCUS_PHRASES
  const typed = useTypewriter(phrases)
  const focusLine = reduce ? phrases[0] : typed

  // Stats come from the API (admin-editable), falling back to the static list.
  const { items: stats } = useCollection(api.listStats, staticStats)

  // Prefer a real uploaded PDF (managed from /admin); fall back to the
  // generated text CV if none has been uploaded yet.
  const [hasPdf, setHasPdf] = useState(false)
  useEffect(() => {
    let alive = true
    api
      .cvMeta()
      .then((meta) => alive && setHasPdf(Boolean(meta?.exists)))
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])

  const downloadTextCV = () => {
    const blob = new Blob([buildResume()], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'Hussain_Ahmed_Humaidi_CV.txt'
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    toast({ type: 'success', title: 'CV downloaded', message: 'Saved Hussain_Ahmed_Humaidi_CV.txt' })
  }

  const ghostBtn =
    'inline-flex items-center gap-2 whitespace-nowrap rounded-lg border border-hair-strong px-4 py-2.5 text-sm font-medium text-ink transition-colors duration-200 hover:border-neonCyan hover:text-neonCyan'

  return (
    <section id="top" className="relative mx-auto max-w-6xl px-4 pt-28 pb-10 sm:px-6 md:pt-32 md:pb-12">
      {/* Quiet backdrop: a competitive-programmer's ruled plane + one warm wash */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-grid-lines opacity-50 mask-radial-fade" />
        {/* Signature motion: an amber signal routing across the plane */}
        <div className="absolute inset-0 opacity-70 mask-radial-fade">
          <GridSignal className="h-full w-full" />
        </div>
        <div className="absolute -top-24 left-1/2 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--color-neon-cyan)_12%,transparent),transparent_62%)]" />
      </div>

      <div className="grid items-center gap-12 lg:grid-cols-[1.12fr_0.88fr] lg:gap-16">
        {/* ---- Left: the pitch, set like a page. On mobile it drops below the
             portrait + terminal (order-2) so the visual lands first. ---- */}
        <motion.div initial="hidden" animate="show" className="order-2 max-w-2xl lg:order-none">
          {/* The signature: the name at display scale, serif carries the identity */}
          <motion.h1
            variants={fadeUp}
            custom={0}
            className="font-display text-[2.25rem] font-bold leading-[1.02] tracking-[-0.03em] text-ink sm:text-[3.25rem] md:text-[4rem]"
          >
            Hussain <span className="text-gradient">Ahmed</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            custom={1}
            className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:mt-6 sm:text-xl"
          >
            CSE Student &amp; Aspiring Software Engineer.
          </motion.p>

          {/* Typed focus line — a single running caret, mono */}
          <motion.p
            variants={fadeUp}
            custom={2}
            className="mt-6 flex items-center font-mono text-sm text-ink/85"
          >
            <span className="text-neonCyan">focus:&nbsp;</span>
            <span>{focusLine}</span>
            <span className="ml-0.5 inline-block h-4 w-px animate-blink bg-neonCyan align-middle" />
          </motion.p>

          <motion.div
            variants={fadeUp}
            custom={3}
            className="mt-9 flex flex-wrap items-center gap-3 sm:flex-nowrap"
          >
            <a
              href="#projects"
              className="group inline-flex items-center gap-2 whitespace-nowrap rounded-lg bg-neonCyan px-5 py-2.5 text-sm font-semibold text-void transition-opacity duration-200 hover:opacity-90"
            >
              View projects
              <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
            <a href="#contact" className={ghostBtn}>
              <Mail className="h-4 w-4" />
              Get in touch
            </a>
            {hasPdf ? (
              <a href={cvUrl} target="_blank" rel="noreferrer" className={ghostBtn}>
                <Download className="h-4 w-4" />
                Download CV
              </a>
            ) : (
              <button type="button" onClick={downloadTextCV} className={ghostBtn}>
                <Download className="h-4 w-4" />
                Download CV
              </button>
            )}
          </motion.div>

          {/* Stats, typeset as a hairline record — not floating chips */}
          <motion.dl
            variants={fadeUp}
            custom={4}
            className="mt-12 grid max-w-lg grid-cols-3 gap-px overflow-hidden rounded-xl border border-hair bg-hair"
          >
            {[stats[3], stats[2], stats[1]].filter(Boolean).map((s) => (
              <div key={s.label} className="bg-void px-4 py-4">
                <dt className="font-display text-2xl font-semibold text-gradient sm:text-3xl">
                  {s.value}
                  {s.suffix?.trim() === '/ 4.00' ? '' : s.suffix}
                </dt>
                <dd className="mt-1 font-mono text-[11px] leading-tight text-muted">{s.label}</dd>
              </div>
            ))}
          </motion.dl>
        </motion.div>

        {/* ---- Right: portrait + "currently" card, then the terminal. On mobile
             this comes first (order-1) so the photo greets the visitor. ---- */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="order-1 flex flex-col gap-5 lg:order-none"
        >
          <div className="flex items-stretch gap-5">
            <Portrait reduce={reduce} />
            <NowCard />
          </div>
          <CodeTerminal className="w-full" />
        </motion.div>
      </div>
    </section>
  )
}

/** Framed headshot as a glassy 3D card that tilts toward the cursor, with a
    moving specular sheen. Falls back to a monogram if /profile.jpg is missing,
    and stays perfectly still under prefers-reduced-motion. */
function Portrait({ reduce }) {
  const [ok, setOk] = useState(true)
  const ref = useRef(null)
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, gx: 50, gy: 50, active: false })

  const onMove = (e) => {
    if (reduce || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width // 0..1
    const py = (e.clientY - r.top) / r.height
    setTilt({
      rx: (0.5 - py) * 12, // rotateX: up when cursor high
      ry: (px - 0.5) * 14, // rotateY: right when cursor right
      gx: px * 100,
      gy: py * 100,
      active: true,
    })
  }
  const onLeave = () => setTilt({ rx: 0, ry: 0, gx: 50, gy: 50, active: false })

  return (
    <figure className="w-[150px] shrink-0 [perspective:1200px] sm:w-[175px] lg:w-[190px]">
      <div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={{
          transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
          transition: tilt.active ? 'transform 120ms ease-out' : 'transform 500ms ease-out',
        }}
        className="group relative aspect-[4/5] overflow-hidden rounded-3xl border border-white/10 bg-fill shadow-[0_30px_60px_-20px_rgba(0,0,0,0.7)] [transform-style:preserve-3d] will-change-transform"
      >
        {ok ? (
          <img
            src={personalInfo.photo}
            alt={`Portrait of ${personalInfo.name}`}
            onError={() => setOk(false)}
            className="h-full w-full object-cover object-top"
          />
        ) : (
          <div className="grid h-full w-full place-items-center font-display text-7xl font-semibold text-neonCyan">
            HAH
          </div>
        )}

        {/* Glass sheen — a specular highlight that follows the cursor */}
        <div
          aria-hidden="true"
          style={{
            background: `radial-gradient(circle at ${tilt.gx}% ${tilt.gy}%, rgba(255,255,255,0.28), transparent 45%)`,
          }}
          className="pointer-events-none absolute inset-0 z-10 mix-blend-soft-light transition-opacity duration-300"
        />
        {/* Frosted top edge + inner ring for the "glass" body */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10 rounded-3xl ring-1 ring-inset ring-white/15 [background:linear-gradient(150deg,rgba(255,255,255,0.14),transparent_30%)]"
        />
        {/* Warm amber wash at the base, keyed to the signal color */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(to_top,color-mix(in_oklab,var(--color-neon-cyan)_20%,transparent),transparent_42%)]"
        />
      </div>
    </figure>
  )
}

/** A compact "currently" card that sits beside the portrait — quick facts that
    tie the hero to the rest of the portfolio (education, location, focus). */
function NowCard() {
  const rows = [
    { Icon: GraduationCap, label: 'Studying', value: 'B.Sc. CSE' },
    { Icon: Award, label: 'CGPA', value: '3.85 / 4.00' },
    { Icon: Zap, label: 'Focus', value: 'DSA · OOP' },
  ]
  return (
    <div className="glass flex min-w-0 flex-1 flex-col justify-between rounded-2xl p-4">
      <div className="flex items-center gap-2 font-mono text-[11px] text-muted">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neonCyan/70" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-neonCyan" />
        </span>
        currently
      </div>
      <dl className="mt-3 space-y-3">
        {rows.map(({ Icon, label, value }) => (
          <div key={label} className="flex items-center gap-2.5">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-hair bg-fill text-neonCyan">
              <Icon className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0">
              <dt className="font-mono text-[10px] uppercase tracking-wide text-muted">{label}</dt>
              <dd className="truncate text-sm font-medium text-ink">{value}</dd>
            </div>
          </div>
        ))}
      </dl>
    </div>
  )
}
