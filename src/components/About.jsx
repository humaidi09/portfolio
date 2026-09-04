import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { GraduationCap, Layers, Rocket, Trophy } from 'lucide-react'
import SectionHeading from './ui/SectionHeading'
import Reveal from './ui/Reveal'
import { personalInfo, stats } from '../data/portfolioData'

/** Animates 0 → target once the element scrolls into view (rAF, eased). */
function useCountUp(target, { duration = 1600 } = {}) {
  const reduce = useReducedMotion()
  const [val, setVal] = useState(reduce ? target : 0)
  const ref = useRef(null)
  const done = useRef(false)

  useEffect(() => {
    if (reduce) {
      setVal(target)
      return
    }
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !done.current) {
          done.current = true
          const start = performance.now()
          const tick = (now) => {
            const t = Math.min(1, (now - start) / duration)
            const eased = 1 - Math.pow(1 - t, 3)
            setVal(target * eased)
            if (t < 1) requestAnimationFrame(tick)
            else setVal(target)
          }
          requestAnimationFrame(tick)
        }
      },
      { threshold: 0.4 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [target, duration, reduce])

  return [ref, val]
}

const ACCENTS = ['cyan', 'violet', 'magenta', 'cyan']
// Icons keyed to the stat order: CGPA, Total Credit, Contests, Projects.
const ICONS = [GraduationCap, Layers, Trophy, Rocket]
const ICON_COLOR = {
  cyan: 'text-neonCyan',
  violet: 'text-neonPurple',
  magenta: 'text-neon-magenta',
}

/** A 3D glass stat card: frosted body that tilts toward the cursor, with a
    moving specular sheen and the number/icon lifted on their own plane.
    Sits perfectly still under prefers-reduced-motion. */
function StatCard({ stat, accent, Icon }) {
  const reduce = useReducedMotion()
  const isFloat = !Number.isInteger(stat.value)
  const [countRef, val] = useCountUp(stat.value)
  const display = isFloat ? val.toFixed(2) : Math.round(val).toString()

  const tiltRef = useRef(null)
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, gx: 50, gy: 50, active: false })

  const onMove = (e) => {
    if (reduce || !tiltRef.current) return
    const r = tiltRef.current.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width
    const py = (e.clientY - r.top) / r.height
    setTilt({ rx: (0.5 - py) * 10, ry: (px - 0.5) * 12, gx: px * 100, gy: py * 100, active: true })
  }
  const onLeave = () => setTilt({ rx: 0, ry: 0, gx: 50, gy: 50, active: false })

  return (
    <div className="[perspective:1000px]">
      <div
        ref={tiltRef}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={{
          transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
          transition: tilt.active ? 'transform 120ms ease-out' : 'transform 500ms ease-out',
        }}
        className="group/stat glass-strong relative flex h-full flex-col justify-between overflow-hidden rounded-2xl p-6 shadow-[0_24px_50px_-24px_rgba(0,0,0,0.7)] [transform-style:preserve-3d] will-change-transform"
      >
        {/* Cursor-tracking specular sheen */}
        <div
          aria-hidden="true"
          style={{ background: `radial-gradient(340px circle at ${tilt.gx}% ${tilt.gy}%, ${GLOW[accent] ?? GLOW.cyan}, transparent 60%)` }}
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/stat:opacity-100"
        />
        {/* Frosted top edge for the glass body */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10 [background:linear-gradient(150deg,rgba(255,255,255,0.10),transparent_32%)]"
        />

        <div ref={countRef} className="relative flex items-start justify-between [transform:translateZ(28px)]">
          <div>
            <div className="flex items-baseline font-display text-4xl font-bold text-ink sm:text-5xl">
              <span className="tabular-nums">{display}</span>
              <span className={`text-xl font-semibold sm:text-2xl ${ICON_COLOR[accent]}`}>{stat.suffix}</span>
            </div>
            <p className="mt-2 font-mono text-xs text-muted">{stat.label}</p>
          </div>
          <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-hair bg-fill shadow-lg shadow-black/20 ${ICON_COLOR[accent]}`}>
            <Icon className="h-5 w-5" />
          </span>
        </div>
      </div>
    </div>
  )
}

// Accent glows for the stat cards' cursor sheen (matches SpotlightCard).
const GLOW = {
  cyan: 'rgba(242, 180, 61, 0.20)',
  violet: 'rgba(207, 144, 56, 0.20)',
  magenta: 'rgba(246, 209, 140, 0.20)',
}

export default function About() {
  return (
    <section id="about" className="relative mx-auto max-w-6xl scroll-mt-24 px-4 py-16 sm:px-6 md:py-20">
      <SectionHeading
        index="01"
        eyebrow="// about"
        title="A bit about me"
      />

      <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1.1fr] lg:gap-8">
        {/* Narrative + education — a raised glass panel */}
        <Reveal>
          <div className="tilt-card group relative flex h-full flex-col overflow-hidden rounded-3xl">
            {/* layered glass body */}
            <div className="glass-strong absolute inset-0 rounded-3xl" aria-hidden="true" />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/10 [background:linear-gradient(150deg,rgba(255,255,255,0.10),transparent_34%)]"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-px rounded-3xl bg-[radial-gradient(420px_circle_at_20%_0%,color-mix(in_oklab,var(--color-neon-cyan)_14%,transparent),transparent_60%)] opacity-70"
            />

            <div className="relative flex h-full flex-col gap-6 p-6 sm:p-7">
              <p className="text-lg leading-relaxed text-ink/90">
                I&rsquo;m a Computer Science undergraduate at{' '}
                <span className="font-semibold text-ink">{personalInfo.university}</span>, drawn to
                the parts of software where clean thinking pays off — data structures, algorithms,
                and object-oriented design.
              </p>
              <p className="leading-relaxed text-muted">
                I sharpen those skills through competitive programming and turn them into real,
                modular projects. Outside the editor I stay active in the tech community — leading
                events with my university computer club, volunteering, and teaching mathematics
                part-time.
              </p>

              {/* Education plate */}
              <div className="mt-auto rounded-2xl border border-hair bg-fill/60 p-5 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-neonCyan/30 bg-neonCyan/10 text-neonCyan">
                    <GraduationCap className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-ink">{personalInfo.degree}</p>
                    <p className="truncate text-sm text-muted">{personalInfo.university}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 rounded-xl border border-hair bg-void/40 px-4 py-2.5 font-mono text-sm">
                  <span className="text-muted">Semester</span>
                  <span className="ml-auto font-semibold text-gradient">{personalInfo.semester}</span>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Animated stats */}
        <div className="grid gap-5 sm:grid-cols-2">
          {stats.map((stat, i) => (
            <Reveal key={stat.label} delay={(i % 2) * 0.08 + Math.floor(i / 2) * 0.08}>
              <StatCard stat={stat} accent={ACCENTS[i]} Icon={ICONS[i]} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
