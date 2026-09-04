import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { GraduationCap, Rocket, Target, Trophy } from 'lucide-react'
import SectionHeading from './ui/SectionHeading'
import Reveal from './ui/Reveal'
import TiltCard from './ui/TiltCard'
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
// Icons keyed to the stat order: CGPA, Problems Solved, Contests, Projects.
const ICONS = [GraduationCap, Target, Trophy, Rocket]
const ICON_COLOR = {
  cyan: 'text-neonCyan',
  violet: 'text-neonPurple',
  magenta: 'text-neon-magenta',
}

/** A 3D glass stat card built on the shared TiltCard: the number and icon are
    lifted onto their own plane so they float above the frosted body. */
function StatCard({ stat, accent, Icon }) {
  const isFloat = !Number.isInteger(stat.value)
  const [countRef, val] = useCountUp(stat.value)
  const display = isFloat ? val.toFixed(2) : Math.round(val).toString()

  return (
    <TiltCard accent={accent} className="h-full p-6">
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
    </TiltCard>
  )
}

export default function About() {
  return (
    <section id="about" className="relative mx-auto max-w-6xl scroll-mt-24 px-4 py-12 sm:px-6 md:py-16">
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
              className="pointer-events-none absolute inset-0 rounded-3xl [background:linear-gradient(150deg,color-mix(in_oklab,var(--color-neon-cyan)_12%,transparent),transparent_34%)]"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-px rounded-3xl bg-[radial-gradient(420px_circle_at_20%_0%,color-mix(in_oklab,var(--color-neon-cyan)_14%,transparent),transparent_60%)] opacity-70"
            />

            <div className="relative flex h-full flex-col justify-center gap-6 p-6 sm:p-8">
              <p className="hyphens-auto text-justify text-lg leading-relaxed text-ink/90">
                I&rsquo;m a Computer Science undergraduate at{' '}
                <span className="font-semibold text-ink">{personalInfo.university}</span>, drawn to
                the parts of software where clean thinking pays off: data structures, algorithms,
                and object-oriented design.
              </p>
              <p className="hyphens-auto text-justify leading-relaxed text-muted">
                I sharpen those skills through competitive programming and turn them into real,
                modular projects. Outside the editor I stay active in the tech community leading
                events with my university computer club, volunteering, and teaching mathematics
                part-time.
              </p>

            </div>
          </div>
        </Reveal>

        {/* Animated stats — all four cards share one size. self-start keeps the
            grid from stretching to the tall narrative panel beside it, so the
            cards stay compact; auto-rows-fr equalizes their heights. */}
        <div className="grid auto-rows-fr gap-5 self-start sm:grid-cols-2">
          {stats.map((stat, i) => (
            <Reveal key={stat.label} className="h-full" delay={(i % 2) * 0.08 + Math.floor(i / 2) * 0.08}>
              <StatCard stat={stat} accent={ACCENTS[i]} Icon={ICONS[i]} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
