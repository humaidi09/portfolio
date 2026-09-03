import Reveal from './Reveal'

/**
 * Consistent section header. A single amber "index · label" pill sets the
 * section apart (an ordered read: about → skills → …), then a Fraunces
 * display title and an optional kicker. The pill replaces the old hairline +
 * "// " eyebrow, which read as generic.
 */
export default function SectionHeading({
  eyebrow,
  title,
  kicker,
  index,
  align = 'left',
}) {
  const centered = align === 'center'
  const wrap = centered ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'
  // Accept legacy "// about" eyebrows — strip the slashes for the new pill.
  const label = eyebrow?.replace(/^\s*\/\/\s*/, '')

  return (
    <div className={wrap}>
      <Reveal>
        <span
          className={`inline-flex items-center gap-2 rounded-full border border-neonCyan/25 bg-neonCyan/[0.06] py-1 pl-2 pr-3 ${
            centered ? 'mx-auto' : ''
          }`}
        >
          {index && (
            <span className="grid h-5 min-w-5 place-items-center rounded-full bg-neonCyan/15 px-1 font-mono text-[11px] font-semibold tabular-nums text-neonCyan">
              {index}
            </span>
          )}
          <span className="font-mono text-xs font-medium tracking-wide text-ink/80">{label}</span>
        </span>
      </Reveal>
      <Reveal delay={0.05}>
        <h2 className="mt-4 text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-4xl md:text-[3rem] md:leading-[1.05]">
          {title}
        </h2>
      </Reveal>
      {kicker && (
        <Reveal delay={0.1}>
          <p className="mt-4 leading-relaxed text-muted">{kicker}</p>
        </Reveal>
      )}
    </div>
  )
}
