import { useState } from 'react'
import { Check, RotateCcw, X } from 'lucide-react'

/**
 * A tiny "guess the output" game living in the hero's terminal. Read a short,
 * well-defined C++ snippet and pick what it prints — the page invites visitors
 * to play instead of just decorating. Every snippet is unambiguous (no UB), so
 * there's exactly one right answer, with a one-line why after each guess.
 */

// Each puzzle: `code` (the snippet, may span lines), three `options`, the index
// of the right one, and a short `note` explaining it.
const PUZZLES = [
  {
    code: 'cout << 7 / 2 << " " << 7 % 2;',
    options: ['3 1', '3.5 1', '3 0'],
    answer: 0,
    note: 'Integer division truncates: 7/2 = 3, 7%2 = 1.',
  },
  {
    code: "char c = 'A';\ncout << (int)c << char(c + 1);",
    options: ['65B', 'AB', '66B'],
    answer: 0,
    note: "'A' is 65; c + 1 promotes then prints as 'B'.",
  },
  {
    code: 'vector<int> v = {3, 1, 2};\nsort(v.begin(), v.end());\ncout << v[0] << v[1] << v[2];',
    options: ['123', '321', '132'],
    answer: 0,
    note: 'sort() orders ascending → 1, 2, 3.',
  },
  {
    code: 'cout << (1 << 4);',
    options: ['16', '8', '14'],
    answer: 0,
    note: '1 shifted left 4 bits = 2⁴ = 16.',
  },
  {
    code: "map<char,int> m;\nm['a']++;\ncout << m['a'] << m['b'];",
    options: ['10', '11', '1'],
    answer: 0,
    note: "operator[] default-inserts 0, so m['b'] is 0.",
  },
  {
    code: 'int n = 10;\ncout << (n & 1 ? "odd" : "even");',
    options: ['even', 'odd', '0'],
    answer: 0,
    note: '10 & 1 = 0 → the "even" branch.',
  },
  {
    code: 'cout << 5 / 2.0;',
    options: ['2.5', '2', '2.50000'],
    answer: 0,
    note: 'One double operand → floating division; default prints 2.5.',
  },
]

const LETTERS = ['a', 'b', 'c']

export default function CodeTerminal({ className = '' }) {
  // Start on a random puzzle so it feels fresh on every load.
  const [i, setI] = useState(() => Math.floor(Math.random() * PUZZLES.length))
  const [picked, setPicked] = useState(null) // index of chosen option, or null
  const [solved, setSolved] = useState(0)
  const [attempts, setAttempts] = useState(0)

  const p = PUZZLES[i]
  const revealed = picked !== null
  const correct = revealed && picked === p.answer

  const choose = (idx) => {
    if (revealed) return
    setPicked(idx)
    setAttempts((n) => n + 1)
    if (idx === p.answer) setSolved((n) => n + 1)
  }

  const next = () => {
    setI((n) => (n + 1) % PUZZLES.length)
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

      {/* Body */}
      <div className="flex flex-col gap-3 px-4 py-3.5">
        <p className="text-muted">
          <span className="text-neonCyan">$</span> ./guess — what does it print?
        </p>

        {/* The snippet */}
        <pre className="overflow-x-auto rounded-lg border border-hair bg-fill/50 px-3.5 py-3 text-ink/90">
          {p.code}
        </pre>

        {/* Options */}
        <div className="flex flex-col gap-1.5">
          {p.options.map((opt, idx) => {
            const isAnswer = idx === p.answer
            const isPicked = idx === picked
            let tone = 'border-hair text-ink/85 hover:border-neonCyan/50 hover:text-ink'
            if (revealed && isAnswer) tone = 'border-neonCyan/60 bg-neonCyan/10 text-neonCyan'
            else if (revealed && isPicked) tone = 'border-red-500/50 bg-red-500/10 text-red-300'
            else if (revealed) tone = 'border-hair text-muted/70'

            return (
              <button
                key={idx}
                type="button"
                onClick={() => choose(idx)}
                disabled={revealed}
                className={`flex items-center gap-2.5 rounded-lg border px-3 py-2 text-left transition-colors disabled:cursor-default ${tone}`}
              >
                <span className="text-muted">{LETTERS[idx]})</span>
                <span className="flex-1">{opt}</span>
                {revealed && isAnswer && <Check className="h-3.5 w-3.5 shrink-0" />}
                {revealed && isPicked && !isAnswer && <X className="h-3.5 w-3.5 shrink-0" />}
              </button>
            )
          })}
        </div>

        {/* Feedback + next */}
        {revealed ? (
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
        ) : (
          <p className="border-t border-hair pt-3 text-[12px] text-muted/70">pick an answer to check ▸</p>
        )}
      </div>
    </section>
  )
}
