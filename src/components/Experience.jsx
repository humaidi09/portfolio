import { Award, Briefcase, Hash } from 'lucide-react'
import SectionHeading from './ui/SectionHeading'
import Reveal from './ui/Reveal'
import TiltCard from './ui/TiltCard'
import { api } from '../lib/api'
import { useCollection } from '../hooks/useCollection'
import {
  experiences as staticExperiences,
  certifications as staticCertifications,
} from '../data/portfolioData'

const DOT = {
  role: 'border-neonCyan/40 bg-neonCyan/10 text-neonCyan',
  cert: 'border-neonPurple/40 bg-neonPurple/10 text-neonPurple',
}
const CHIP = {
  role: 'text-neonCyan',
  cert: 'text-neonPurple',
}

export default function Experience() {
  const { items: experiences } = useCollection(api.listExperiences, staticExperiences)
  const { items: certifications } = useCollection(api.listCertifications, staticCertifications)

  // One continuous timeline: involvement first, then certifications. The API
  // returns certs with `credentialId`; static data uses `id` — accept either.
  const nodes = [
    { heading: 'Experience & Involvement' },
    ...experiences.map((e) => ({
      type: 'role',
      title: e.role,
      org: e.organization,
      period: e.period,
      tags: e.skills,
    })),
    { heading: 'Certifications & Achievements' },
    ...certifications.map((c) => ({
      type: 'cert',
      title: c.title,
      org: c.issuer,
      period: c.date,
      id: c.credentialId || c.id,
    })),
  ]

  return (
    <section id="experience" className="relative mx-auto max-w-5xl scroll-mt-24 px-4 py-12 sm:px-6 md:py-16">
      <SectionHeading
        index="05"
        eyebrow="// journey"
        title="Experience & credentials"
      />

      <div className="relative mt-12">
        {/* Vertical rail */}
        <span
          aria-hidden="true"
          className="absolute bottom-2 left-4 top-2 w-px bg-gradient-to-b from-neonCyan/45 via-hair-strong to-transparent sm:left-5"
        />

        <ul className="space-y-6">
          {nodes.map((node, i) => {
            if (node.heading) {
              return (
                <li key={`h-${node.heading}`} className="relative pl-12 pt-2 sm:pl-16">
                  <Reveal>
                    <h3 className="flex items-center gap-2.5 font-mono text-xs text-muted">
                      <span aria-hidden="true" className="inline-block h-px w-6 bg-neonCyan/70" />
                      {node.heading}
                    </h3>
                  </Reveal>
                </li>
              )
            }

            const Icon = node.type === 'role' ? Briefcase : Award
            return (
              <li key={`${node.title}-${i}`} className="relative pl-12 sm:pl-16">
                <span
                  className={`absolute left-0 top-1 grid h-8 w-8 place-items-center rounded-full border sm:h-10 sm:w-10 ${DOT[node.type]}`}
                >
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                </span>

                <Reveal>
                  <TiltCard accent={node.type === 'role' ? 'cyan' : 'violet'} max={6} lift={3} className="p-5">
                    <div className="relative [transform:translateZ(22px)]">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className={`font-mono text-xs ${CHIP[node.type]}`}>{node.period}</span>
                        {node.id && (
                          <span className="inline-flex items-center gap-1 font-mono text-[11px] text-muted">
                            <Hash className="h-3 w-3" />
                            {node.id}
                          </span>
                        )}
                      </div>
                      <h4 className="mt-2 font-display text-lg font-semibold text-ink">{node.title}</h4>
                      <p className="mt-0.5 text-sm text-muted">{node.org}</p>

                      {node.tags && (
                        <ul className="mt-3 flex flex-wrap gap-2">
                          {node.tags.map((t) => (
                            <li
                              key={t}
                              className="rounded-md border border-hair bg-fill px-2.5 py-1 font-mono text-[11px] text-ink"
                            >
                              {t}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </TiltCard>
                </Reveal>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
