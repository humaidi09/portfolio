import { useEffect, useRef, useState } from 'react'
import { Check, ChevronLeft, ChevronRight, Eye, EyeOff, Flame, RotateCcw, X } from 'lucide-react'
import { api } from '../../lib/api'
import { useCollection } from '../../hooks/useCollection'
import { PUZZLES as STATIC_PUZZLES, LETTERS } from '../../data/puzzles'

/**
 * A "guess the output" game living in the hero's terminal. Read a short,
 * well-defined C++ snippet and pick what it prints — the page invites visitors
 * to play instead of just decorating. Every snippet is unambiguous (no UB), so
 * there's exactly one right answer.
 *
 * Flow: pick an option, see right or wrong, and the game AUTO-ADVANCES to the
 * next snippet. The printed output and the one-line why stay HIDDEN behind a
 * "show" toggle — tap it (or walk BACK to an earlier snippet) to study the
 * answer without being rushed. A streak counts consecutive correct answers; the
 * best-ever streak is kept in localStorage so it survives reloads. Played in
 * rounds of ROUND_SIZE shuffled snippets. Answers work by click or keyboard
 * (1–9 / a–f to pick, b to go back, e to reveal the output, enter to advance)
 * while the widget is on screen.
 *
 * Puzzles load from the API (managed at /admin → Puzzles) and fall back to the
 * bundled list in src/data/puzzles.js when the backend is unreachable. Wrong
 * guesses are logged back to the API (fire-and-forget) so the admin can see
 * which snippets trip people up.
 */

const ROUND_SIZE = 10 // snippets per round
const BEST_KEY = 'guess_best_streak'
const AUTO_RIGHT = 900 // ms to linger on a correct answer before auto-advancing
const AUTO_WRONG = 1700 // longer on a miss, so the result registers first

// A shuffled bag of `n` distinct puzzle indices drawn from `total`.
function makeOrder(total, n) {
  const a = Array.from({ length: total }, (_, k) => k)
  for (let k = total - 1; k > 0; k--) {
    const j = Math.floor(Math.random() * (k + 1))
    ;[a[k], a[j]] = [a[j], a[k]]
  }
  return a.slice(0, Math.max(1, Math.min(n, total)))
}

export default function CodeTerminal({ className = '' }) {
  // Puzzles come from the API; fall back to the bundled list until it loads.
  const { items: puzzles } = useCollection(api.listPuzzles, STATIC_PUZZLES)
  const list = puzzles.length ? puzzles : STATIC_PUZZLES

  // Skip the "run" animation when the visitor prefers less motion.
  const [reduce] = useState(
    () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
  )
  const RUN_MS = reduce ? 0 : 420

  const [order, setOrder] = useState(() => makeOrder(STATIC_PUZZLES.length, ROUND_SIZE))
  const [step, setStep] = useState(0) // position within the current round
  const [picks, setPicks] = useState(() => Array(order.length).fill(null)) // answer per step
  const [running, setRunning] = useState(false) // brief "$ ./guess" phase before reveal
  const [autoPending, setAutoPending] = useState(false) // auto-advance is scheduled
  const [finished, setFinished] = useState(false) // round summary showing
  const [showNote, setShowNote] = useState(false) // reveal output + why for this step
  const [solved, setSolved] = useState(0) // correct this round
  const [streak, setStreak] = useState(0) // consecutive correct
  const [roundBest, setRoundBest] = useState(0) // longest streak this round
  const [best, setBest] = useState(() => {
    try {
      const v = parseInt(localStorage.getItem(BEST_KEY) || '0', 10)
      return Number.isFinite(v) && v > 0 ? v : 0
    } catch {
      return 0
    }
  })

  const N = order.length
  const idx = order.length ? order[step % order.length] : 0
  const p = list[idx % list.length]
  const picked = picks[step] ?? null
  const revealed = picked !== null && !running
  const correct = revealed && picked === p.answer
  const answeredCount = picks.filter((x) => x !== null).length
  const progress = finished ? N : answeredCount

  // Pending timers (the "run" animation and the auto-advance), cleared together.
  const runRef = useRef(null)
  const autoRef = useRef(null)
  const clearTimers = () => {
    clearTimeout(runRef.current)
    clearTimeout(autoRef.current)
    setAutoPending(false)
  }

  // Rebuild the round when the puzzle set changes size (API load, admin edits)
  // so the shuffled indices stay valid.
  useEffect(() => {
    clearTimers()
    const nextOrder = makeOrder(list.length, ROUND_SIZE)
    setOrder(nextOrder)
    setPicks(Array(nextOrder.length).fill(null))
    setStep(0)
    setRunning(false)
    setFinished(false)
    setShowNote(false)
    setSolved(0)
    setStreak(0)
    setRoundBest(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list.length])

  // Persist the best-ever streak whenever it climbs.
  useEffect(() => {
    try {
      localStorage.setItem(BEST_KEY, String(best))
    } catch {
      /* private mode / storage disabled — the game still works in memory */
    }
  }, [best])

  // A fresh snippet always starts with its answer hidden.
  useEffect(() => {
    setShowNote(false)
  }, [step])

  // Clean up pending timers if the widget unmounts mid-animation.
  useEffect(() => () => clearTimers(), [])

  const commitResult = (choice) => {
    const isRight = choice === p.answer
    if (isRight) {
      const ns = streak + 1
      setSolved((n) => n + 1)
      setStreak(ns)
      setRoundBest((rb) => Math.max(rb, ns))
      setBest((b) => Math.max(b, ns))
    } else {
      setStreak(0)
      // Log the wrong guess so the admin can see what trips people up. Best
      // effort — never let a failed log affect the game.
      api
        .logWrongAnswer({ code: p.code, chosen: p.options[choice], correct: p.options[p.answer] })
        .catch(() => {})
    }
  }

  const advance = () => {
    clearTimers()
    if (step >= N - 1) {
      setFinished(true)
    } else {
      setShowNote(false)
      setStep(step + 1)
    }
  }

  const scheduleAuto = (choice) => {
    setAutoPending(true)
    autoRef.current = setTimeout(advance, choice === p.answer ? AUTO_RIGHT : AUTO_WRONG)
  }

  const handlePick = (choice) => {
    if (finished || running || picks[step] !== null) return
    setPicks((arr) => {
      const next = arr.slice()
      next[step] = choice
      return next
    })
    if (RUN_MS === 0) {
      commitResult(choice)
      scheduleAuto(choice)
      return
    }
    setRunning(true)
    runRef.current = setTimeout(() => {
      setRunning(false)
      commitResult(choice)
      scheduleAuto(choice)
    }, RUN_MS)
  }

  const goBack = () => {
    if (running || step === 0) return
    clearTimers()
    setShowNote(false)
    setStep(step - 1)
  }

  const goNext = () => {
    if (running) return
    advance()
  }

  // Reveal the output + why. Stops the auto-advance so there's time to read it.
  const reveal = () => {
    clearTimers()
    setShowNote(true)
  }

  const playAgain = () => {
    clearTimers()
    const nextOrder = makeOrder(list.length, ROUND_SIZE)
    setOrder(nextOrder)
    setPicks(Array(nextOrder.length).fill(null))
    setStep(0)
    setRunning(false)
    setFinished(false)
    setShowNote(false)
    setSolved(0)
    setStreak(0)
    setRoundBest(0)
  }

  // Keyboard play — only while the widget is actually on screen, so the keys
  // don't hijack the rest of the page. A ref holds the latest handler so the
  // window listener is attached once.
  const sectionRef = useRef(null)
  const inViewRef = useRef(false)
  const keyRef = useRef(null)
  keyRef.current = (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey || !inViewRef.current) return
    const el = document.activeElement
    if (el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) return
    const k = e.key.toLowerCase()
    if (finished) {
      if (k === 'enter' || k === 'n' || k === 'r') {
        e.preventDefault()
        playAgain()
      }
      return
    }
    if (running) return // wait for the reveal before accepting more keys
    if (picks[step] !== null) {
      // An answered snippet: navigate and reveal, don't re-answer.
      if (k === 'arrowleft' || k === 'b') {
        e.preventDefault()
        goBack()
      } else if (k === 'enter' || k === 'n' || k === 'arrowright') {
        e.preventDefault()
        goNext()
      } else if (k === 'e' || k === '?') {
        e.preventDefault()
        showNote ? setShowNote(false) : reveal()
      }
      return
    }
    // An unanswered snippet: pick an option (or step back to review).
    if (k === 'arrowleft' || k === 'b') {
      if (step > 0) {
        e.preventDefault()
        goBack()
      }
      return
    }
    let choice = LETTERS.indexOf(k)
    if (choice < 0 && /^[1-9]$/.test(k)) choice = Number(k) - 1
    if (choice >= 0 && choice < p.options.length) {
      e.preventDefault()
      handlePick(choice)
    }
  }

  useEffect(() => {
    const h = (e) => keyRef.current?.(e)
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [])

  useEffect(() => {
    const el = sectionRef.current
    if (!el || typeof IntersectionObserver === 'undefined') {
      inViewRef.current = true
      return
    }
    const io = new IntersectionObserver(([entry]) => (inViewRef.current = entry.isIntersecting), {
      threshold: 0.25,
    })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      aria-label="C++ output guessing game"
      className={`flex flex-col overflow-hidden rounded-2xl border border-hair-strong bg-void/80 font-mono text-[13px] leading-relaxed shadow-lg shadow-black/30 ${className}`}
    >
      {/* Title bar — three dots + the filename, with the streak on the right */}
      <div className="flex items-center gap-2 border-b border-hair bg-fill/60 px-3.5 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-neon-magenta/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-neonCyan/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-neonPurple/70" />
        <span className="ml-2 text-[11px] text-muted">guess.cpp</span>
        <span className="ml-auto flex items-center gap-1.5 text-[11px]" title="Current streak">
          <Flame className={`h-3.5 w-3.5 ${streak > 0 ? 'text-neonCyan' : 'text-muted/50'}`} />
          <span className={streak > 0 ? 'text-ink' : 'text-muted/60'}>{streak}</span>
          {best > 0 && <span className="text-muted/50">· best {best}</span>}
        </span>
      </div>

      {/* Round progress */}
      <div className="h-0.5 w-full bg-hair/50">
        <div
          className="h-full bg-neonCyan/70 transition-all duration-300"
          style={{ width: `${(progress / N) * 100}%` }}
        />
      </div>

      {finished ? (
        /* Round summary */
        <div className="grid place-items-center gap-4 px-6 py-10 text-center sm:py-12">
          <p className="text-[11px] text-muted">
            <span className="text-neonCyan">// </span>round complete
          </p>
          <p className="text-4xl font-semibold tabular-nums text-neonCyan">
            {solved}
            <span className="text-2xl text-muted/50"> / {N}</span>
          </p>
          <p className="text-[12px] text-muted">
            longest streak <span className="text-ink">{roundBest}</span> · best ever{' '}
            <span className="text-ink">{best}</span>
          </p>
          <button
            type="button"
            onClick={playAgain}
            className="mt-1 inline-flex items-center gap-2 rounded-lg border border-neonCyan/50 bg-neonCyan/10 px-4 py-2 text-[12px] text-neonCyan transition-colors hover:bg-neonCyan/15"
          >
            <RotateCcw className="h-4 w-4" />
            play again
          </button>
        </div>
      ) : (
        /* Body — snippet on the left, the answers on the right (desktop) */
        <div className="grid gap-4 p-4 lg:grid-cols-2 lg:items-stretch lg:gap-6 lg:p-5">
          {/* Left: the snippet as a real editor pane (line-number gutter), with
              the result + controls seated directly below it */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-1 overflow-hidden rounded-xl border border-hair bg-fill/40">
              {/* line-number gutter */}
              <div
                aria-hidden="true"
                className="flex flex-col items-end gap-0 border-r border-hair bg-fill/50 px-2.5 py-3 text-[12px] text-muted/50 select-none"
              >
                {p.code.split('\n').map((_, n) => (
                  <span key={n} className="leading-relaxed tabular-nums">
                    {n + 1}
                  </span>
                ))}
              </div>
              {/* code — top-aligned so each line sits on its gutter number */}
              <pre className="flex-1 overflow-x-auto px-3.5 py-3 text-ink/90">{p.code}</pre>
            </div>

            {/* "Run", then the result row (with back / show-output / next) */}
            {(running || revealed) && (
              <div className="border-t border-hair pt-3">
                {running ? (
                  <p className="text-[12px] text-muted">
                    <span className="text-neonCyan">$ </span>./guess
                    <span className="ml-1 inline-block animate-pulse">▮</span>
                  </p>
                ) : (
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[12px]">
                        <span className={correct ? 'text-neonCyan' : 'text-red-300'}>
                          {correct ? '// correct' : '// not quite'}
                        </span>
                        {autoPending && <span className="ml-2 text-[11px] text-muted/40">· next…</span>}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={goBack}
                          disabled={step === 0}
                          title="Previous snippet"
                          className="inline-flex items-center gap-1 rounded-lg border border-hair bg-fill px-2.5 py-1.5 text-[11px] text-ink transition-colors hover:border-neonCyan/50 hover:text-neonCyan disabled:cursor-default disabled:opacity-40"
                        >
                          <ChevronLeft className="h-3.5 w-3.5" />
                          back
                        </button>
                        <button
                          type="button"
                          onClick={() => (showNote ? setShowNote(false) : reveal())}
                          aria-pressed={showNote}
                          title={showNote ? 'Hide the output' : 'Show the output and why'}
                          className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[11px] transition-colors ${
                            showNote
                              ? 'border-neonCyan/50 bg-neonCyan/10 text-neonCyan'
                              : 'border-hair bg-fill text-ink hover:border-neonCyan/50 hover:text-neonCyan'
                          }`}
                        >
                          {showNote ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          {showNote ? 'hide' : 'output'}
                        </button>
                        <button
                          type="button"
                          onClick={goNext}
                          title="Next snippet"
                          className="inline-flex items-center gap-1 rounded-lg border border-hair bg-fill px-2.5 py-1.5 text-[11px] text-ink transition-colors hover:border-neonCyan/50 hover:text-neonCyan"
                        >
                          {step >= N - 1 ? 'results' : 'next'}
                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Output + why — hidden until the visitor asks to see it */}
                    {showNote && (
                      <p className="text-[12px] leading-relaxed text-muted">
                        <span className="text-neonCyan">// output: </span>
                        <span className="text-ink/90">{p.options[p.answer]}</span>
                        {p.note ? <span> — {p.note}</span> : null}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: the answer choices, under a small prompt so it isn't floating */}
          <div className="flex flex-col justify-center gap-2">
            <p className="text-[11px] text-muted">
              <span className="text-neonCyan">// </span>
              what does it print?
            </p>

            {p.options.map((opt, oi) => {
              const isAnswer = oi === p.answer
              const isPicked = oi === picked
              let tone = 'border-hair text-ink/85 hover:border-neonCyan/50 hover:bg-fill/40 hover:text-ink'
              let badge = 'border-hair bg-fill text-muted'
              if (running && isPicked) {
                tone = 'border-neonCyan/40 bg-fill/40 text-ink'
                badge = 'border-neonCyan/40 bg-fill text-neonCyan'
              } else if (revealed && isPicked && correct) {
                tone = 'border-neonCyan/60 bg-neonCyan/10 text-neonCyan'
                badge = 'border-neonCyan/50 bg-neonCyan/15 text-neonCyan'
              } else if (revealed && isPicked && !correct) {
                tone = 'border-red-500/50 bg-red-500/10 text-red-300'
                badge = 'border-red-500/50 bg-red-500/15 text-red-300'
              } else if (revealed && isAnswer && showNote) {
                // The correct choice only lights up once the visitor reveals it.
                tone = 'border-neonCyan/60 bg-neonCyan/10 text-neonCyan'
                badge = 'border-neonCyan/50 bg-neonCyan/15 text-neonCyan'
              } else if (revealed) {
                tone = 'border-hair text-muted/60'
                badge = 'border-hair bg-fill text-muted/50'
              }

              return (
                <button
                  key={oi}
                  type="button"
                  onClick={() => handlePick(oi)}
                  disabled={picked !== null}
                  className={`flex items-center gap-3 rounded-xl border px-3 py-3 text-left transition-colors disabled:cursor-default ${tone}`}
                >
                  <span
                    className={`grid h-6 w-6 shrink-0 place-items-center rounded-md border text-[11px] font-semibold transition-colors ${badge}`}
                  >
                    {LETTERS[oi]}
                  </span>
                  <span className="flex-1">{opt}</span>
                  {revealed && isPicked && correct && <Check className="h-4 w-4 shrink-0" />}
                  {revealed && isPicked && !correct && <X className="h-4 w-4 shrink-0" />}
                  {revealed && !isPicked && isAnswer && showNote && <Check className="h-4 w-4 shrink-0" />}
                </button>
              )
            })}

            <p className="hidden select-none pt-1 text-center text-[10px] text-muted/40 sm:block">
              keys: 1–{p.options.length} or a–{LETTERS[p.options.length - 1]} · b back · e output · enter next
            </p>
          </div>
        </div>
      )}
    </section>
  )
}
