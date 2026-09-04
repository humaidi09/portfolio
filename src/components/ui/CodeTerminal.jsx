import { useState } from 'react'
import { Check, RotateCcw, X } from 'lucide-react'

/**
 * A tiny "guess the output" game living in the hero's terminal. Read a short,
 * well-defined C++ snippet and pick what it prints — the page invites visitors
 * to play instead of just decorating. Every snippet is unambiguous (no UB), so
 * there's exactly one right answer, with a one-line why after each guess.
 */

// Each puzzle: `code` (the snippet, may span lines), three `options`, the index
// of the right one, and a short `note` explaining it. Every output is verified
// and unambiguous (no UB), so there is exactly one correct answer.
const PUZZLES = [
  {
    code: 'cout << 7 / 2 << " " << 7 % 2;',
    options: ['3 1', '3.5 1', '3 0'],
    answer: 0,
    note: 'Integer division truncates: 7/2 = 3, 7%2 = 1.',
  },
  {
    code: "char c = 'A';\ncout << (int)c << char(c + 1);",
    options: ['AB', '65B', '66B'],
    answer: 1,
    note: "'A' is 65; c + 1 promotes then prints as 'B'.",
  },
  {
    code: 'vector<int> v = {3, 1, 2};\nsort(v.begin(), v.end());\ncout << v[0] << v[1] << v[2];',
    options: ['321', '132', '123'],
    answer: 2,
    note: 'sort() orders ascending → 1, 2, 3.',
  },
  {
    code: 'cout << (1 << 4);',
    options: ['8', '16', '14'],
    answer: 1,
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
    options: ['odd', 'even', '0'],
    answer: 1,
    note: '10 & 1 = 0 → the "even" branch.',
  },
  {
    code: 'cout << 5 / 2.0;',
    options: ['2', '2.50000', '2.5'],
    answer: 2,
    note: 'One double operand → floating division; default prints 2.5.',
  },
  {
    code: 'cout << 2 + 3 * 4;',
    options: ['20', '14', '24'],
    answer: 1,
    note: 'Multiplication binds before addition: 3*4 = 12, +2 = 14.',
  },
  {
    code: 'int a = 5;\ncout << a++;\ncout << a;',
    options: ['56', '66', '55'],
    answer: 0,
    note: 'a++ yields the old value 5; the next line sees a = 6.',
  },
  {
    code: "cout << 'A' + 1;",
    options: ['66', 'B', '65'],
    answer: 0,
    note: "'A' (65) + 1 stays an int, so it prints 66.",
  },
  {
    code: "cout << char('Z' - 1);",
    options: ['89', 'Z', 'Y'],
    answer: 2,
    note: "'Z' is 90; char(90 - 1) is 'Y'.",
  },
  {
    code: 'string s = "hello";\ncout << s.size();',
    options: ['4', '5', '6'],
    answer: 1,
    note: 'size() counts the 5 letters in "hello".',
  },
  {
    code: 'cout << (3 > 2);',
    options: ['1', 'true', '0'],
    answer: 0,
    note: 'Without boolalpha a true bool prints as 1.',
  },
  {
    code: 'cout << boolalpha << (2 > 3);',
    options: ['false', '0', 'true'],
    answer: 0,
    note: 'boolalpha prints bools as words; 2 > 3 is false.',
  },
  {
    code: 'cout << 17 / 5;',
    options: ['3.4', '2', '3'],
    answer: 2,
    note: 'Integer division drops the remainder: 17/5 = 3.',
  },
  {
    code: 'int x = 8;\ncout << (x >> 1);',
    options: ['16', '4', '7'],
    answer: 1,
    note: '>> 1 halves the value: 8 becomes 4.',
  },
  {
    code: 'cout << (5 & 3);',
    options: ['1', '7', '8'],
    answer: 0,
    note: '5 & 3 = 101 & 011 = 001 = 1.',
  },
  {
    code: 'cout << (5 | 2);',
    options: ['5', '10', '7'],
    answer: 2,
    note: '5 | 2 = 101 | 010 = 111 = 7.',
  },
  {
    code: 'cout << (6 ^ 3);',
    options: ['9', '5', '2'],
    answer: 1,
    note: '6 ^ 3 = 110 ^ 011 = 101 = 5.',
  },
  {
    code: 'set<int> s = {3, 1, 2, 1};\ncout << s.size();',
    options: ['3', '4', '2'],
    answer: 0,
    note: 'A set drops duplicates, so {3,1,2,1} has size 3.',
  },
  {
    code: 'set<int> s = {5, 3, 1, 4};\ncout << *s.begin();',
    options: ['5', '1', '3'],
    answer: 1,
    note: 'A set stays sorted; *begin() is the smallest, 1.',
  },
  {
    code: 'cout << max(3, 7);',
    options: ['3', '10', '7'],
    answer: 2,
    note: 'max() returns the larger value, 7.',
  },
  {
    code: 'cout << min(9, 4);',
    options: ['9', '4', '5'],
    answer: 1,
    note: 'min() returns the smaller value, 4.',
  },
  {
    code: 'cout << abs(-8);',
    options: ['8', '-8', '0'],
    answer: 0,
    note: 'abs() gives the magnitude: |-8| = 8.',
  },
  {
    code: 'string s = "ab";\ns += "cd";\ncout << s;',
    options: ['ab', 'cd', 'abcd'],
    answer: 2,
    note: '+= appends "cd" to "ab", giving "abcd".',
  },
  {
    code: 'cout << (7 % 2 == 0 ? "yes" : "no");',
    options: ['no', 'yes', '1'],
    answer: 0,
    note: '7 % 2 is 1 (not 0), so the ternary picks "no".',
  },
  {
    code: 'int arr[] = {10, 20, 30};\ncout << arr[1];',
    options: ['10', '20', '30'],
    answer: 1,
    note: 'Arrays are 0-indexed: arr[1] is the second value, 20.',
  },
  {
    code: 'cout << 3 + 4 << "!";',
    options: ['34!', '7', '7!'],
    answer: 2,
    note: '+ binds tighter than <<, so 3 + 4 prints as 7.',
  },
  {
    code: 'cout << 10 / 4 * 4;',
    options: ['10', '8', '9'],
    answer: 1,
    note: 'All integer, left to right: 10/4 = 2, then 2*4 = 8.',
  },
  {
    code: 'cout << (1 == 1) + (2 == 3);',
    options: ['1', '2', '0'],
    answer: 0,
    note: '1==1 is 1, 2==3 is 0; their sum is 1.',
  },
  {
    code: 'int x = 15;\nx %= 4;\ncout << x;',
    options: ['2', '4', '3'],
    answer: 2,
    note: '%= stores the remainder: 15 % 4 = 3.',
  },
  {
    code: "cout << string(3, 'x');",
    options: ['x3', 'xxx', 'xxxx'],
    answer: 1,
    note: 'string(n, ch) repeats the char n times → "xxx".',
  },
  {
    code: 'vector<int> v = {1, 2, 3};\nv.push_back(4);\ncout << v.size();',
    options: ['3', '5', '4'],
    answer: 2,
    note: 'push_back adds one element, so size becomes 4.',
  },
  {
    code: 'cout << (true && false);',
    options: ['0', '1', 'false'],
    answer: 0,
    note: 'true && false is false, which prints as 0.',
  },
  {
    code: 'cout << (true || false);',
    options: ['1', '0', 'true'],
    answer: 0,
    note: 'true || false is true, which prints as 1.',
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
  const codeLines = p.code.split('\n')
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
