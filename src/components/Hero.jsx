import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowUpRight, Download, Mail } from 'lucide-react'
import { useToast } from '../context/ToastContext'
import GridSignal from './ui/GridSignal'
import {
  personalInfo,
  stats,
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

// Right-column "specimen": a typeset index of facts, like a journal's author card.
const spec = [
  { k: 'focus', v: 'Algorithms, DSA, OOP' },
  { k: 'stack', v: 'C++, Python, JavaScript' },
  { k: 'cgpa', v: '3.85 / 4.00' },
]

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

  const downloadCV = () => {
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
    <section id="top" className="relative mx-auto max-w-6xl px-4 pt-32 pb-20 sm:px-6 md:pt-40 md:pb-28">
      {/* Quiet backdrop: a competitive-programmer's ruled plane + one warm wash */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-grid-lines opacity-50 mask-radial-fade" />
        {/* Signature motion: an amber signal routing across the plane */}
        <div className="absolute inset-0 opacity-70 mask-radial-fade">
          <GridSignal className="h-full w-full" />
        </div>
        <div className="absolute -top-24 left-1/2 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--color-neon-cyan)_12%,transparent),transparent_62%)]" />
      </div>

      <div className="grid items-start gap-12 lg:grid-cols-[1.12fr_0.88fr] lg:gap-16">
        {/* ---- Left: the pitch, set like a page ---- */}
        <motion.div initial="hidden" animate="show" className="max-w-2xl">
          {/* Availability — mono, quiet, led by a short amber rule */}
          <motion.p
            variants={fadeUp}
            custom={0}
            className="flex items-center gap-3 font-mono text-sm text-muted"
          >
            <span className="inline-block h-px w-8 bg-neonCyan/70" />
            Open to internships
          </motion.p>

          {/* The signature: the name at display scale, serif carries the identity */}
          <motion.h1
            variants={fadeUp}
            custom={1}
            className="mt-6 font-display text-[3.1rem] font-bold leading-[0.95] tracking-[-0.03em] text-ink sm:text-[4.25rem] md:text-[5.5rem]"
          >
            Hussain Ahmed
            <br />
            <span className="text-gradient">Humaidi</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            custom={2}
            className="mt-6 max-w-xl text-lg leading-relaxed text-muted sm:text-xl"
          >
            {personalInfo.role}. I write clean, correct software — from
            competitive-programming solutions in C++ to modern web applications.
          </motion.p>

          {/* Typed focus line — a single running caret, mono */}
          <motion.p
            variants={fadeUp}
            custom={3}
            className="mt-6 flex items-center font-mono text-sm text-ink/85"
          >
            <span className="text-neonCyan">focus:&nbsp;</span>
            <span>{focusLine}</span>
            <span className="ml-0.5 inline-block h-4 w-px animate-blink bg-neonCyan align-middle" />
          </motion.p>

          <motion.div
            variants={fadeUp}
            custom={4}
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
            <button type="button" onClick={downloadCV} className={ghostBtn}>
              <Download className="h-4 w-4" />
              Download CV
            </button>
          </motion.div>

          {/* Stats, typeset as a hairline record — not floating chips */}
          <motion.dl
            variants={fadeUp}
            custom={5}
            className="mt-12 grid max-w-lg grid-cols-3 gap-px overflow-hidden rounded-xl border border-hair bg-hair"
          >
            {[stats[0], stats[3], stats[2]].map((s) => (
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

        {/* ---- Right: the specimen — framed portrait + typeset index ---- */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="lg:pt-2"
        >
          <Portrait />

          <dl className="mx-auto mt-8 max-w-[260px] divide-y divide-hair border-y border-hair font-mono text-sm lg:mx-0 lg:max-w-none">
            {spec.map((row) => (
              <div key={row.k} className="flex items-baseline justify-between gap-4 py-2.5">
                <dt className="text-muted">{row.k}</dt>
                <dd className="text-right text-ink">{row.v}</dd>
              </div>
            ))}
            <div className="flex items-baseline justify-between gap-4 py-2.5">
              <dt className="text-muted">status</dt>
              <dd className="text-right text-neonCyan">Open to internships</dd>
            </div>
          </dl>
        </motion.div>
      </div>
    </section>
  )
}

/** Framed headshot set as a figure. Smaller on phones, with a graceful monogram
    fallback if /profile.jpg is unavailable. */
function Portrait() {
  const [ok, setOk] = useState(true)
  return (
    <figure className="mx-auto w-full max-w-[150px] sm:max-w-[190px] lg:mx-0 lg:max-w-[250px]">
      <div className="overflow-hidden rounded-xl border border-hair-strong bg-fill">
        {ok ? (
          <img
            src={personalInfo.photo}
            alt={`Portrait of ${personalInfo.name}`}
            onError={() => setOk(false)}
            className="aspect-[4/5] w-full object-cover object-top"
          />
        ) : (
          <div className="grid aspect-[4/5] w-full place-items-center font-display text-5xl font-semibold text-neonCyan">
            HAH
          </div>
        )}
      </div>
      <figcaption className="mt-3 font-mono text-xs text-muted">
        Hussain Ahmed Humaidi, Leading University
      </figcaption>
    </figure>
  )
}
