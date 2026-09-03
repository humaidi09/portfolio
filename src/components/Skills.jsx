import {
  Atom,
  Binary,
  Boxes,
  Braces,
  Code2,
  Cpu,
  Database,
  GitBranch,
  Layers,
  Network,
  SquareCode,
  Trophy,
  Wind,
  Wrench,
} from 'lucide-react'
import SectionHeading from './ui/SectionHeading'
import SpotlightCard from './ui/SpotlightCard'
import Reveal from './ui/Reveal'
import { GithubIcon } from './ui/BrandIcons'
import { skills } from '../data/portfolioData'

// Per-skill glyphs. GitHub uses our custom brand mark (Lucide dropped brands).
const SKILL_ICONS = {
  C: Binary,
  'C++': Cpu,
  Python: Braces,
  JavaScript: SquareCode,
  HTML5: Code2,
  CSS3: Wind,
  'Data Structures': Boxes,
  Algorithms: Network,
  'Object-Oriented Programming (OOP)': Layers,
  'Intermediate SQL': Database,
  'Problem Solving': Trophy,
  Git: GitBranch,
  GitHub: GithubIcon,
  'VS Code': Code2,
  MySQL: Database,
  'React.js': Atom,
  'Tailwind CSS': Wind,
}

const GROUPS = [
  { key: 'languages', label: 'Languages', accent: 'cyan', Icon: Braces, items: skills.languages },
  { key: 'coreCS', label: 'Core CS', accent: 'violet', Icon: Cpu, items: skills.coreCS },
  { key: 'toolsAndDB', label: 'Tools & Databases', accent: 'magenta', Icon: Wrench, items: skills.toolsAndDB },
]

const ACCENT_TEXT = {
  cyan: 'text-neonCyan',
  violet: 'text-neonPurple',
  magenta: 'text-neon-magenta',
}

// Each skill chip lifts and warms on hover — amber, matching the theme signal.
const CHIP =
  'group/chip flex items-center gap-3 rounded-xl border border-hair bg-fill px-3.5 py-2.5 transition-all duration-200 hover:-translate-y-0.5 hover:bg-fill-2 hover:border-neonCyan/40 hover:shadow-[0_0_22px_-6px_rgba(242,180,61,0.45)]'

function SkillIcon({ name, className }) {
  const Cmp = SKILL_ICONS[name] ?? Code2
  return <Cmp className={className} />
}

export default function Skills() {
  return (
    <section id="skills" className="relative mx-auto max-w-6xl scroll-mt-24 px-4 py-16 sm:px-6 md:py-20">
      <SectionHeading
        index="02"
        eyebrow="// skills"
        title="Tools I build with"
        kicker="The languages I reach for, the computer-science foundations under everything, and the everyday tooling and databases I use to ship."
      />

      <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {GROUPS.map((group, gi) => (
          <Reveal key={group.key} delay={gi * 0.1}>
            <SpotlightCard accent={group.accent} className="h-full p-6">
              <div className="flex items-center gap-3">
                <span className={`grid h-11 w-11 place-items-center rounded-xl border border-hair bg-fill ${ACCENT_TEXT[group.accent]}`}>
                  <group.Icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-display text-lg font-semibold text-ink">{group.label}</h3>
                  <p className="font-mono text-xs text-muted">{group.items.length} skills</p>
                </div>
              </div>

              <ul className="mt-6 space-y-2.5">
                {group.items.map((item) => (
                  <li key={item} className={CHIP}>
                    <span className={`${ACCENT_TEXT[group.accent]} transition-colors group-hover/chip:text-neon-magenta`}>
                      <SkillIcon name={item} className="h-4 w-4" />
                    </span>
                    <span className="text-sm font-medium text-ink">{item}</span>
                  </li>
                ))}
              </ul>
            </SpotlightCard>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
