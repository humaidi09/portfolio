import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'

/**
 * A small faux-terminal that types out a short session, line by line, then
 * holds and restarts — the moving companion to the hero's `whoami` handle.
 * Pure state + timers, GPU-cheap. Under prefers-reduced-motion it renders the
 * whole session statically (no typing, no caret).
 */

// Each line: `p` is the shell prompt (rendered dim), `t` the typed command or
// output, `c` an optional accent color for output lines.
const LINES = [
  { p: '$', t: 'whoami' },
  { t: 'Hussain Ahmed Humaidi', c: 'text-ink' },
  { p: '$', t: 'cat focus.txt' },
  { t: 'algorithms · dsa · oop', c: 'text-neonCyan' },
  { p: '$', t: 'ls projects/ | wc -l' },
  { t: '6', c: 'text-neonCyan' },
  { p: '$', t: 'status --now' },
  { t: 'learning daily · building for real ▹', c: 'text-neonCyan' },
]

const TYPE = 42 // ms per typed char
const OUTPUT_HOLD = 420 // pause after an output line
const CMD_HOLD = 260 // pause after a command finishes typing
const LOOP_HOLD = 2600 // pause before wiping and restarting

export default function CodeTerminal({ className = '' }) {
  const reduce = useReducedMotion()
  const [done, setDone] = useState([]) // completed lines
  const [row, setRow] = useState(0) // index of the line being typed
  const [typed, setTyped] = useState('') // chars typed so far on current line
  const timer = useRef()

  useEffect(() => {
    if (reduce) return
    const line = LINES[row]

    // Finished the whole session → hold, then wipe and loop.
    if (!line) {
      timer.current = setTimeout(() => {
        setDone([])
        setRow(0)
        setTyped('')
      }, LOOP_HOLD)
      return () => clearTimeout(timer.current)
    }

    // Output lines (no prompt) appear at once, then advance.
    if (!line.p) {
      timer.current = setTimeout(() => {
        setDone((d) => [...d, line])
        setRow((r) => r + 1)
      }, OUTPUT_HOLD)
      return () => clearTimeout(timer.current)
    }

    // Command lines type character by character.
    if (typed.length < line.t.length) {
      timer.current = setTimeout(() => setTyped(line.t.slice(0, typed.length + 1)), TYPE)
    } else {
      timer.current = setTimeout(() => {
        setDone((d) => [...d, line])
        setRow((r) => r + 1)
        setTyped('')
      }, CMD_HOLD)
    }
    return () => clearTimeout(timer.current)
  }, [reduce, row, typed])

  const current = !reduce && LINES[row]
  const visible = reduce ? LINES : done

  return (
    <div
      aria-hidden="true"
      className={`flex flex-col overflow-hidden rounded-2xl border border-hair-strong bg-void/80 font-mono text-[13px] leading-relaxed shadow-lg shadow-black/30 ${className}`}
    >
      {/* Title bar — three dots + a path, like an editor tab */}
      <div className="flex items-center gap-2 border-b border-hair bg-fill/60 px-3.5 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-neon-magenta/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-neonCyan/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-neonPurple/70" />
        <span className="ml-2 text-[11px] text-muted">humaidi@dev</span>
      </div>

      {/* Body */}
      <div className="flex-1 space-y-1 px-4 py-3.5">
        {visible.map((l, i) => (
          <Row key={i} line={l} />
        ))}
        {current && (
          <div className="flex gap-2">
            {current.p && <span className="shrink-0 text-neonCyan">{current.p}</span>}
            <span className={current.p ? 'text-ink/90' : current.c}>{typed}</span>
            <span className="inline-block h-4 w-[7px] animate-blink self-center bg-neonCyan" />
          </div>
        )}
      </div>
    </div>
  )
}

function Row({ line }) {
  return (
    <div className="flex gap-2">
      {line.p && <span className="shrink-0 text-neonCyan">{line.p}</span>}
      <span className={line.p ? 'text-ink/90' : line.c}>{line.t}</span>
    </div>
  )
}
