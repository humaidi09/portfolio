import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { GraduationCap, Layers, Rocket, Trophy } from 'lucide-react'
import SectionHeading from './ui/SectionHeading'
import SpotlightCard from './ui/SpotlightCard'
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
const ICONS = [Trophy, Layers, Rocket, GraduationCap]
const ICON_COLOR = {
  cyan: 'text-neonCyan',
  violet: 'text-neonPurple',
  magenta: 'text-neon-magenta',
}

function StatCard({ stat, accent, Icon }) {
  const isFloat = !Number.isInteger(stat.value)
  const [ref, val] = useCountUp(stat.value)
  const display = isFloat ? val.toFixed(2) : Math.round(val).toString()

  return (
    <SpotlightCard accent={accent} className="p-6">
      <div ref={ref} className="flex items-start justify-between">
        <div>
          <div className="flex items-baseline font-display text-4xl font-bold text-ink sm:text-5xl">
            <span className="tabular-nums">{display}</span>
            <span className={`text-xl font-semibold sm:text-2xl ${ICON_COLOR[accent]}`}>{stat.suffix}</span>
          </div>
          <p className="mt-2 font-mono text-xs text-muted">{stat.label}</p>
        </div>
        <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-hair bg-fill ${ICON_COLOR[accent]}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </SpotlightCard>
  )
}

export default function About() {
  return (
    <section id="about" className="relative mx-auto max-w-6xl scroll-mt-24 px-4 py-24 sm:px-6 md:py-28">
      <SectionHeading
        index="01"
        eyebrow="// about"
        title="A bit about me"
        kicker={personalInfo.bio}
      />

      <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_1.1fr] lg:gap-8">
        {/* Narrative + education */}
        <Reveal>
          <div className="flex h-full flex-col gap-5">
            <p className="text-lg leading-relaxed text-muted">
              I&rsquo;m a Computer Science undergraduate at{' '}
              <span className="font-medium text-ink">{personalInfo.university}</span>, drawn to the
              parts of software where clean thinking pays off — data structures, algorithms and
              object-oriented design. I sharpen those skills through competitive programming and
              turn them into real, modular projects.
            </p>
            <p className="leading-relaxed text-muted">
              Outside the editor I stay active in the tech community — leading events with my
              university computer club, volunteering, and teaching mathematics part-time.
            </p>

            <div className="mt-auto rounded-2xl glass p-5">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-hair bg-fill text-neonCyan">
                  <GraduationCap className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold text-ink">{personalInfo.degree}</p>
                  <p className="text-sm text-muted">{personalInfo.university}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-hair bg-fill px-4 py-2.5 font-mono text-sm">
                <span className="text-muted">CGPA</span>
                <span className="ml-auto font-semibold text-neonCyan">{personalInfo.gpa}</span>
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
