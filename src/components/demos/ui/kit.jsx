import { forwardRef } from 'react'

/**
 * Shared UI kit for the live demos. Thin wrappers over the site's design tokens
 * (amber = neonCyan, warm ink/muted text, hair borders, black glass surfaces)
 * so every demo reads as one coherent "lab console" rather than six separate
 * toys. Everything here is theme-aware — it re-themes with the light/dark
 * toggle for free. Wrap anything that must stay dark in both themes (a code
 * dump, a puzzle grid) in a `code-surface` container.
 */

/* ---------------------------------------------------------------- Panel -- */

/** A framed glass panel with an optional mono eyebrow + title header. */
export function Panel({ eyebrow, title, actions, className = '', bodyClass = '', children }) {
  const hasHeader = eyebrow || title || actions
  return (
    <div className={`glass rounded-2xl border border-hair ${className}`}>
      {hasHeader && (
        <div className="flex items-center justify-between gap-3 border-b border-hair px-4 py-3 sm:px-5">
          <div className="min-w-0">
            {eyebrow && (
              <div className="font-mono text-[11px] uppercase tracking-wider text-neonCyan/80">{eyebrow}</div>
            )}
            {title && <h3 className="truncate text-sm font-semibold text-ink">{title}</h3>}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={`p-4 sm:p-5 ${bodyClass}`}>{children}</div>
    </div>
  )
}

/* ---------------------------------------------------------------- Inputs -- */

/** Labelled control wrapper — the label sits above, an optional mono hint right. */
export function Field({ label, hint, htmlFor, className = '', children }) {
  return (
    <label htmlFor={htmlFor} className={`block ${className}`}>
      {(label || hint) && (
        <div className="mb-1.5 flex items-baseline justify-between gap-2">
          {label && <span className="text-xs font-medium text-ink">{label}</span>}
          {hint && <span className="font-mono text-[10px] text-muted">{hint}</span>}
        </div>
      )}
      {children}
    </label>
  )
}

const inputCls =
  'w-full rounded-lg border border-hair bg-void/50 px-3 py-2 text-sm text-ink outline-none transition-colors placeholder:text-muted/60 focus:border-neonCyan/50 focus:ring-1 focus:ring-neonCyan/25 disabled:opacity-50'

export const TextInput = forwardRef(function TextInput({ className = '', ...p }, ref) {
  return <input ref={ref} className={`${inputCls} ${className}`} {...p} />
})

export const NumberInput = forwardRef(function NumberInput({ className = '', ...p }, ref) {
  return <input ref={ref} type="number" inputMode="decimal" className={`${inputCls} tabular-nums ${className}`} {...p} />
})

export const Select = forwardRef(function Select({ className = '', children, ...p }, ref) {
  return (
    <select ref={ref} className={`${inputCls} cursor-pointer appearance-none ${className}`} {...p}>
      {children}
    </select>
  )
})

/* --------------------------------------------------------------- Buttons -- */

const btnBase =
  'inline-flex select-none items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-40'

const btnVariants = {
  primary: 'bg-neonCyan text-void hover:opacity-90 active:opacity-80',
  ghost: 'border border-hair bg-fill text-ink hover:border-neonCyan/45 hover:text-neonCyan',
  danger: 'border border-red-500/40 bg-red-500/10 text-red-300 hover:bg-red-500/20',
  subtle: 'text-muted hover:text-ink',
}

export function Button({ variant = 'primary', size = 'md', className = '', ...p }) {
  const pad = size === 'sm' ? 'px-3 py-1.5 text-xs' : size === 'lg' ? 'px-5 py-2.5' : 'px-4 py-2'
  return <button className={`${btnBase} ${pad} ${btnVariants[variant]} ${className}`} {...p} />
}

/** Square icon button — for compact toolbars (step, reset, copy). */
export function IconButton({ label, className = '', children, ...p }) {
  return (
    <button
      aria-label={label}
      title={label}
      className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-hair bg-fill text-muted transition-colors hover:border-neonCyan/45 hover:text-neonCyan disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
      {...p}
    >
      {children}
    </button>
  )
}

/* -------------------------------------------------------------- Readouts -- */

/** Big-number readout tile — the headline figure a demo computes. */
export function Stat({ label, value, sub, accent = false, className = '' }) {
  return (
    <div className={`rounded-xl border border-hair bg-void/30 px-4 py-3 ${className}`}>
      <div className="font-mono text-[10px] uppercase tracking-wider text-muted">{label}</div>
      <div className={`mt-1 font-display text-2xl font-semibold tabular-nums ${accent ? 'text-neonCyan' : 'text-ink'}`}>
        {value}
      </div>
      {sub && <div className="mt-0.5 text-xs text-muted">{sub}</div>}
    </div>
  )
}

const badgeTones = {
  neutral: 'border-hair bg-fill text-muted',
  accent: 'border-neonCyan/30 bg-neonCyan/10 text-neonCyan',
  good: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  bad: 'border-red-500/30 bg-red-500/10 text-red-300',
  warn: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
}

/** Small status pill — order states, pass/fail, "unique", etc. */
export function Badge({ tone = 'neutral', className = '', children }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-mono text-[11px] font-medium ${badgeTones[tone]} ${className}`}
    >
      {children}
    </span>
  )
}

const calloutTones = {
  info: 'border-neonCyan/25 bg-neonCyan/[0.06]',
  good: 'border-emerald-500/25 bg-emerald-500/[0.06]',
  bad: 'border-red-500/25 bg-red-500/[0.06]',
  warn: 'border-amber-500/25 bg-amber-500/[0.06]',
}

/** Boxed note — explanations, errors, "why this number" callouts. */
export function Callout({ tone = 'info', title, className = '', children }) {
  return (
    <div className={`rounded-xl border px-4 py-3 text-sm ${calloutTones[tone]} ${className}`}>
      {title && <div className="mb-1 font-semibold text-ink">{title}</div>}
      <div className="leading-relaxed text-muted">{children}</div>
    </div>
  )
}

/* ----------------------------------------------------------------- Misc -- */

/** Inline monospace token. */
export function Mono({ className = '', children }) {
  return <code className={`rounded bg-fill px-1.5 py-0.5 font-mono text-[0.85em] text-ink ${className}`}>{children}</code>
}

/** A flex toolbar row that wraps on small screens. */
export function Toolbar({ className = '', children }) {
  return <div className={`flex flex-wrap items-center gap-2 ${className}`}>{children}</div>}

/** Amber hairline divider matching the site's `.rule-gradient`. */
export function Divider({ className = '' }) {
  return <div className={`rule-gradient my-4 ${className}`} />
}
