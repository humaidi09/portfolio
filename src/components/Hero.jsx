import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowUpRight, Award, Download, GraduationCap, Zap } from 'lucide-react'
import { useToast } from '../context/ToastContext'
import { api, cvUrl } from '../lib/api'
import { useCollection } from '../hooks/useCollection'
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
    a.download = 'Hussain_Ahmed_CV.txt'
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    toast({ type: 'success', title: 'CV downloaded', message: 'Saved Hussain_Ahmed_CV.txt' })
  }

  const primaryBtn =
    'group inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-neonCyan px-6 py-3 text-sm font-semibold text-void transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5 hover:glow-cyan'

  return (
    <section id="top" className="relative mx-auto max-w-6xl px-4 pt-24 pb-10 sm:px-6 md:pt-28 md:pb-12">
      {/* Quiet backdrop: the faintest ruled plane. The page-wide
          AmbientBackground network (faint gold) shows through, so the hero
          reads as pure black with a slight golden shimmer — no gray, no wash. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-grid-lines opacity-[0.05] mask-radial-fade" />
      </div>

      <div className="grid items-start gap-12 lg:grid-cols-[1.12fr_0.88fr] lg:gap-16">
        {/* ---- Left: the pitch, set like a page ---- */}
        <motion.div initial="hidden" animate="show" className="max-w-2xl">
          {/* Warm greeting — sets the human tone before the display name */}
          <motion.p
            variants={fadeUp}
            custom={0}
            className="font-mono text-sm text-neonCyan"
          >
            Hi, I'm
          </motion.p>

          {/* The signature: the name at display scale, serif carries the identity */}
          <motion.h1
            variants={fadeUp}
            custom={1}
            className="mt-2 font-display text-[2.25rem] font-bold leading-[1.02] tracking-[-0.03em] text-ink sm:text-[3.25rem] md:text-[4rem]"
          >
            Hussain <span className="text-gradient-animate">Ahmed</span>
          </motion.h1>

          {/* Role line — the three hats, stated plainly */}
          <motion.p
            variants={fadeUp}
            custom={2}
            className="mt-4 text-base font-medium text-ink/85 sm:text-lg"
          >
            CSE Student <span className="text-neonCyan">•</span> Competitive Programmer{' '}
            <span className="text-neonCyan">•</span> Python Developer
          </motion.p>

          {/* Typed focus line — a single running caret, mono */}
          <motion.p
            variants={fadeUp}
            custom={3}
            className="mt-5 flex items-center font-mono text-sm text-ink/85"
          >
            <span className="text-neonCyan">focus:&nbsp;</span>
            <span>{focusLine}</span>
            <span className="ml-0.5 inline-block h-4 w-px animate-blink bg-neonCyan align-middle" />
          </motion.p>

          <motion.div
            variants={fadeUp}
            custom={4}
            className="mt-8 grid max-w-md grid-cols-2 gap-3"
          >
            <a href="#projects" className={primaryBtn}>
              View projects
              <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
            {hasPdf ? (
              <a href={cvUrl} target="_blank" rel="noreferrer" className={primaryBtn}>
                <Download className="h-4 w-4" />
                Download CV
              </a>
            ) : (
              <button type="button" onClick={downloadTextCV} className={primaryBtn}>
                <Download className="h-4 w-4" />
                Download CV
              </button>
            )}
          </motion.div>

          {/* Stats, typeset as a hairline record — not floating chips */}
          <motion.dl
            variants={fadeUp}
            custom={5}
            className="mt-10 grid max-w-lg grid-cols-3 gap-px overflow-hidden rounded-xl border border-hair bg-hair"
          >
            {[
              // The number row opens with a CP identity cell, then contests, then
              // the real problems-solved total (a literal so the live DB's older
              // "Total Credit" record can't override it).
              { label: 'Competitive Programming', value: 'CP', suffix: '' },
              stats[2],
              { label: 'Problems Solved', value: '500', suffix: '+' },
            ]
              .filter(Boolean)
              .map((s) => (
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

        {/* ---- Right: portrait + "currently" card ---- */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center gap-5 sm:flex-row sm:items-stretch"
        >
          <Portrait reduce={reduce} />
          <NowCard />
        </motion.div>
      </div>

      {/* ---- The guess game, seated full-width below both columns ---- */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.42, ease: [0.22, 1, 0.36, 1] }}
        className="mt-8 md:mt-10"
      >
        <CodeTerminal className="w-full" />
      </motion.div>
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
    <figure className="w-[150px] shrink-0 [perspective:1200px] sm:w-[175px] lg:w-[224px]">
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
            HA
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
    { Icon: GraduationCap, label: 'Studying', value: 'B.Sc. in CSE' },
    { Icon: Award, label: 'CGPA', value: '3.85 / 4.00' },
    { Icon: Zap, label: 'Focus', value: 'DSA · OOP · CP' },
  ]
  return (
    <div className="glass flex w-full min-w-0 flex-1 flex-col justify-between rounded-2xl p-4 sm:w-auto">
      <div className="flex items-center gap-2 font-mono text-[11px] text-muted">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neonCyan/70" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-neonCyan" />
        </span>
        current status
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
