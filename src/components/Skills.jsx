import {
  Atom,
  Binary,
  Boxes,
  Braces,
  Clock,
  Code2,
  Cpu,
  Database,
  GitBranch,
  Handshake,
  Languages,
  Layers,
  MessagesSquare,
  Network,
  SquareCode,
  Trophy,
  Users,
  Wind,
  Wrench,
} from 'lucide-react'
import SectionHeading from './ui/SectionHeading'
import TiltCard from './ui/TiltCard'
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
  'Competitive Programming': Trophy,
  Teamwork: Users,
  Communication: MessagesSquare,
  'Time Management': Clock,
  Collaboration: Handshake,
}

const GROUPS = [
  { key: 'languages', label: 'Languages', accent: 'cyan', Icon: Braces, items: skills.languages },
  { key: 'coreCS', label: 'Core CS', accent: 'violet', Icon: Cpu, items: skills.coreCS },
  { key: 'toolsAndDB', label: 'Tools & Databases', accent: 'magenta', Icon: Wrench, items: skills.toolsAndDB },
  { key: 'softSkills', label: 'Soft Skills', accent: 'cyan', Icon: Users, items: skills.softSkills },
]

const ACCENT_TEXT = {
  cyan: 'text-neonCyan',
  violet: 'text-neonPurple',
  magenta: 'text-neon-magenta',
}

// Spoken-language proficiency → proficiency-bar width.
const LANG_LEVEL = { Native: '100%', Professional: '70%', Basic: '35%' }

// Each skill chip lifts and warms on hover — amber, matching the theme signal.
const CHIP =
  'group/chip flex items-center gap-3 rounded-xl border border-hair bg-fill px-3.5 py-2.5 transition-all duration-200 hover:-translate-y-0.5 hover:bg-fill-2 hover:border-neonCyan/40 hover:shadow-[0_0_22px_-6px_rgba(242,180,61,0.45)]'

function SkillIcon({ name, className }) {
  const Cmp = SKILL_ICONS[name] ?? Code2
  return <Cmp className={className} />
}

export default function Skills() {
  return (
    <section id="skills" className="relative mx-auto max-w-6xl scroll-mt-24 px-4 py-12 sm:px-6 md:py-16">
      <SectionHeading
        index="02"
        eyebrow="// skills"
        title="Tools I build with"
      />

      <div className="mt-10 grid auto-rows-fr gap-5 md:grid-cols-2 lg:grid-cols-3">
        {GROUPS.map((group, gi) => (
          <Reveal key={group.key} className="h-full" delay={gi * 0.1}>
            <TiltCard accent={group.accent} max={7} className="h-full p-6">
              <div className="relative [transform:translateZ(24px)]">
                <div className="flex items-center gap-3">
                  <span className={`grid h-11 w-11 place-items-center rounded-xl border border-hair bg-fill shadow-lg shadow-black/20 ${ACCENT_TEXT[group.accent]}`}>
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
              </div>
            </TiltCard>
          </Reveal>
        ))}

        {/* Spoken languages — fills the grid's open space beside Soft Skills */}
        <Reveal className="h-full md:col-span-2 lg:col-span-2" delay={0.4}>
          <div className="glass flex h-full flex-col rounded-3xl p-6">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl border border-hair bg-fill text-neonCyan shadow-lg shadow-black/20">
                <Languages className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-display text-lg font-semibold text-ink">Languages I speak</h3>
                <p className="font-mono text-xs text-muted">{skills.spokenLanguages.length} languages</p>
              </div>
            </div>
            <dl className="mt-6 flex flex-1 flex-col justify-center gap-4">
              {skills.spokenLanguages.map((lang) => (
                <div key={lang.name} className="rounded-xl border border-hair bg-fill px-4 py-3.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <dt className="text-sm font-semibold text-ink">{lang.name}</dt>
                    <dd className="font-mono text-[11px] text-muted">{lang.level}</dd>
                  </div>
                  <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-hair" aria-hidden="true">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-neonCyan to-neonPurple"
                      style={{ width: LANG_LEVEL[lang.level] }}
                    />
                  </div>
                </div>
              ))}
            </dl>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
