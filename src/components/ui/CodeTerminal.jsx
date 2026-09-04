import { useState } from 'react'
import { Check, RotateCcw, X } from 'lucide-react'
import { api } from '../../lib/api'
import { useCollection } from '../../hooks/useCollection'
import { PUZZLES as STATIC_PUZZLES, LETTERS } from '../../data/puzzles'

/**
 * A tiny "guess the output" game living in the hero's terminal. Read a short,
 * well-defined C++ snippet and pick what it prints — the page invites visitors
 * to play instead of just decorating. Every snippet is unambiguous (no UB), so
 * there's exactly one right answer, with a one-line why after each guess.
 *
 * Puzzles load from the API (managed at /admin → Puzzles) and fall back to the
 * bundled list in src/data/puzzles.js when the backend is unreachable. Wrong
 * guesses are logged back to the API (fire-and-forget) so the admin can see
 * which snippets trip people up.
 */

export default function CodeTerminal({ className = '' }) {
  // Puzzles come from the API; fall back to the bundled list until it loads.
  const { items: puzzles } = useCollection(api.listPuzzles, STATIC_PUZZLES)
  const list = puzzles.length ? puzzles : STATIC_PUZZLES

  // Start on a random puzzle so it feels fresh on every load.
  const [i, setI] = useState(() => Math.floor(Math.random() * STATIC_PUZZLES.length))
  const [picked, setPicked] = useState(null) // index of chosen option, or null
  const [solved, setSolved] = useState(0)
  const [attempts, setAttempts] = useState(0)

  const p = list[i % list.length]
  const codeLines = p.code.split('\n')
  const revealed = picked !== null
  const correct = revealed && picked === p.answer

  const choose = (idx) => {
    if (revealed) return
    setPicked(idx)
    setAttempts((n) => n + 1)
    if (idx === p.answer) {
      setSolved((n) => n + 1)
    } else {
      // Log the wrong guess so the admin can see what trips people up. Best
      // effort — never let a failed log affect the game.
      api
        .logWrongAnswer({ code: p.code, chosen: p.options[idx], correct: p.options[p.answer] })
        .catch(() => {})
    }
  }

  const next = () => {
    setI((n) => (n + 1) % list.length)
    setPicked(null)
  }

  return (
    <section
      aria-label="C++ output guessing game"
      className={`flex flex-col overflow-hidden rounded-2xl border border-hair-strong bg-void/80 font-mono text-[13px] leading-relaxed shadow-lg shadow-black/30 ${className}`}
    >
      {/* Title bar — three dots + the filename */}
      <div className="flex items-center gap-2 border-b border-hair bg-fill/60 px-3.5 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-neon-magenta/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-neonCyan/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-neonPurple/70" />
        <span className="ml-2 text-[11px] text-muted">guess.cpp</span>
        <span className="ml-auto text-[11px] text-muted">
          solved <span className="text-neonCyan">{solved}</span>
          <span className="text-muted/60">/{attempts}</span>
        </span>
      </div>

      {/* Body — snippet on the left, the answers on the right (desktop) */}
      <div className="grid gap-4 p-4 lg:grid-cols-2 lg:items-stretch lg:gap-6 lg:p-5">
        {/* Left: the snippet as a real editor pane (line-number gutter),
            with the output + explanation seated directly below it */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-1 overflow-hidden rounded-xl border border-hair bg-fill/40">
            {/* line-number gutter */}
            <div aria-hidden="true" className="flex flex-col items-end gap-0 border-r border-hair bg-fill/50 px-2.5 py-3 text-[12px] text-muted/50 select-none">
              {codeLines.map((_, n) => (
                <span key={n} className="leading-relaxed tabular-nums">{n + 1}</span>
              ))}
            </div>
            {/* code — top-aligned so each line sits on its gutter number */}
            <pre className="flex-1 overflow-x-auto px-3.5 py-3 text-ink/90">
              {p.code}
            </pre>
          </div>

          {/* Output + explanation, seated directly below the question */}
          {revealed && (
            <div className="flex items-start justify-between gap-3 border-t border-hair pt-3">
              <p className="text-[12px] leading-relaxed text-muted">
                <span className={correct ? 'text-neonCyan' : 'text-red-300'}>
                  {correct ? '// correct — ' : '// output: '}
                </span>
                {correct ? p.note : `${p.options[p.answer]}. ${p.note}`}
              </p>
              <button
                type="button"
                onClick={next}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-hair bg-fill px-3 py-1.5 text-[12px] text-ink transition-colors hover:border-neonCyan/50 hover:text-neonCyan"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                next
              </button>
            </div>
          )}
        </div>

        {/* Right: the answer choices, under a small prompt so it isn't floating */}
        <div className="flex flex-col justify-center gap-2">
          <p className="text-[11px] text-muted">
            <span className="text-neonCyan">// </span>
            what does it print?
          </p>
          {p.options.map((opt, idx) => {
            const isAnswer = idx === p.answer
            const isPicked = idx === picked
            let tone = 'border-hair text-ink/85 hover:border-neonCyan/50 hover:bg-fill/40 hover:text-ink'
            let badge = 'border-hair bg-fill text-muted'
            if (revealed && isAnswer) {
              tone = 'border-neonCyan/60 bg-neonCyan/10 text-neonCyan'
              badge = 'border-neonCyan/50 bg-neonCyan/15 text-neonCyan'
            } else if (revealed && isPicked) {
              tone = 'border-red-500/50 bg-red-500/10 text-red-300'
              badge = 'border-red-500/50 bg-red-500/15 text-red-300'
            } else if (revealed) {
              tone = 'border-hair text-muted/60'
              badge = 'border-hair bg-fill text-muted/50'
            }

            return (
              <button
                key={idx}
                type="button"
                onClick={() => choose(idx)}
                disabled={revealed}
                className={`flex items-center gap-3 rounded-xl border px-3 py-3 text-left transition-colors disabled:cursor-default ${tone}`}
              >
                <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-md border text-[11px] font-semibold transition-colors ${badge}`}>
                  {LETTERS[idx]}
                </span>
                <span className="flex-1">{opt}</span>
                {revealed && isAnswer && <Check className="h-4 w-4 shrink-0" />}
                {revealed && isPicked && !isAnswer && <X className="h-4 w-4 shrink-0" />}
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
