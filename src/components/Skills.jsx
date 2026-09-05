import {
  Boxes,
  Braces,
  Clock,
  Code2,
  Cpu,
  Database,
  GitBranch,
  Handshake,
  Layers,
  Lightbulb,
  SquareCode,
  Users,
} from 'lucide-react'
import SectionHeading from './ui/SectionHeading'
import TiltCard from './ui/TiltCard'
import Reveal from './ui/Reveal'
import { api } from '../lib/api'
import { useCollection } from '../hooks/useCollection'
import { skillGroups as fallbackGroups } from '../data/portfolioData'

// Per-skill glyphs, matched by the exact label. Anything unmapped falls back to
// a generic code glyph.
const SKILL_ICONS = {
  'C/C++': Cpu,
  DSA: Boxes,
  OOP: Layers,
  Python: Braces,
  JavaScript: SquareCode,
  Database: Database,
  'HTML/CSS': Code2,
  'Problem Solving': Lightbulb,
  Teamwork: Users,
  'Time Management': Clock,
  Collaboration: Handshake,
  'Git/GitHub': GitBranch,
}

// Two boxes, two accents; a third+ group would cycle back through these.
const ACCENTS = ['cyan', 'violet']
const GROUP_ICONS = [Cpu, Users]
const ACCENT_TEXT = { cyan: 'text-neonCyan', violet: 'text-neonPurple' }

// Each skill chip lifts and warms on hover — amber, matching the theme signal.
const CHIP =
  'group/chip flex items-center gap-3 rounded-xl border border-hair bg-fill px-3.5 py-2.5 transition-all duration-200 hover:-translate-y-0.5 hover:bg-fill-2 hover:border-neonCyan/40 hover:shadow-[0_0_22px_-6px_rgba(242,180,61,0.45)]'

function SkillIcon({ name, className }) {
  const Cmp = SKILL_ICONS[name] ?? Code2
  return <Cmp className={className} />
}

/**
 * Skills — two named groups (Core CS + Soft skills), DB-backed and editable at
 * /admin → Skills. The hardcoded groups in portfolioData are the fallback shown
 * when the API is unreachable (local dev, Render cold starts).
 */
export default function Skills() {
  const { items: groups } = useCollection(api.listSkillGroups, fallbackGroups)

  return (
    <section id="skills" className="relative mx-auto max-w-6xl scroll-mt-24 px-4 py-12 sm:px-6 md:py-16">
      <SectionHeading index="02" eyebrow="// skills" title="Skills & strengths" />

      <div className="mt-10 grid auto-rows-fr gap-5 md:grid-cols-2">
        {groups.map((group, gi) => {
          const accent = ACCENTS[gi % ACCENTS.length]
          const GroupIcon = GROUP_ICONS[gi % GROUP_ICONS.length]
          const items = group.items || []
          return (
            <Reveal key={group.id || group.title} className="h-full" delay={gi * 0.1}>
              <TiltCard accent={accent} max={7} className="h-full p-6">
                <div className="relative [transform:translateZ(24px)]">
                  <div className="flex items-center gap-3">
                    <span
                      className={`grid h-11 w-11 place-items-center rounded-xl border border-hair bg-fill shadow-lg shadow-black/20 ${ACCENT_TEXT[accent]}`}
                    >
                      <GroupIcon className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="font-display text-lg font-semibold text-ink">{group.title}</h3>
                      <p className="font-mono text-xs text-muted">{items.length} skills</p>
                    </div>
                  </div>

                  <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
                    {items.map((item) => (
                      <li key={item} className={CHIP}>
                        <span className={`${ACCENT_TEXT[accent]} transition-colors group-hover/chip:text-neon-magenta`}>
                          <SkillIcon name={item} className="h-4 w-4" />
                        </span>
                        <span className="text-sm font-medium text-ink">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </TiltCard>
            </Reveal>
          )
        })}
      </div>
    </section>
  )
}
