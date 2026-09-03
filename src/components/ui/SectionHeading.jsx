import Reveal from './Reveal'

/**
 * Consistent section header: a short amber rule + mono eyebrow, a Fraunces
 * display title, and an optional kicker. Typeset like a journal section head.
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

  return (
    <div className={wrap}>
      <Reveal>
        <div
          className={`flex items-center gap-3 ${centered ? 'justify-center' : ''}`}
        >
          {index && (
            <span className="font-mono text-sm font-medium text-neonCyan/90">{index}</span>
          )}
          <span aria-hidden="true" className="inline-block h-px w-8 bg-neonCyan/70" />
          <p className="eyebrow">{eyebrow}</p>
        </div>
      </Reveal>
      <Reveal delay={0.05}>
        <h2 className="mt-4 text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-4xl md:text-[3.25rem] md:leading-[1.05]">
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
