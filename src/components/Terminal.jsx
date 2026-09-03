import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, TerminalSquare } from 'lucide-react'
import SectionHeading from './ui/SectionHeading'
import Reveal from './ui/Reveal'
import { personalInfo, skills, projects } from '../data/portfolioData'

const PROMPT = 'visitor@humaidi:~$'

const COMMANDS = [
  { name: 'help', desc: 'show this list of commands' },
  { name: 'whoami', desc: 'who is Hussain Ahmed Humaidi?' },
  { name: 'skills', desc: 'languages, core CS & tooling' },
  { name: 'projects', desc: 'featured work + links' },
  { name: 'contact', desc: 'how to reach me' },
  { name: 'socials', desc: 'GitHub & LinkedIn' },
  { name: 'cv', desc: 'how to grab my CV' },
  { name: 'clear', desc: 'clear the screen' },
]

const WELCOME = [
  <span key="w1" className="text-muted">
    Welcome to <span className="text-neonCyan">humaidi.dev</span> — an interactive shell.
  </span>,
  <span key="w2" className="text-muted">
    Type <span className="text-neonPurple">help</span> and hit Enter to explore.
  </span>,
]

/** Two-column, aligned command listing. */
function CmdList({ rows }) {
  return (
    <div className="mt-1 space-y-0.5">
      {rows.map((r) => (
        <div key={r.name} className="flex gap-3">
          <span className="w-20 shrink-0 text-neonCyan">{r.name}</span>
          <span className="text-muted">{r.desc}</span>
        </div>
      ))}
    </div>
  )
}

/** Runs a command → returns { lines } (array of nodes) or { clear: true }. */
function runCommand(raw) {
  const input = raw.trim()
  const [cmd, ...args] = input.split(/\s+/)

  switch (cmd.toLowerCase()) {
    case '':
      return { lines: [] }
    case 'help':
      return { lines: [<span key="h" className="text-ink">Available commands:</span>, <CmdList key="l" rows={COMMANDS} />] }
    case 'whoami':
      return {
        lines: [
          <span key="n" className="font-semibold text-gradient">{personalInfo.name}</span>,
          <span key="r" className="text-ink">{personalInfo.role}</span>,
          <span key="t" className="text-neonPurple">{personalInfo.tagline}</span>,
          <span key="b" className="mt-1 block text-muted">{personalInfo.bio}</span>,
        ],
      }
    case 'skills':
      return {
        lines: [
          <span key="s1"><span className="text-neonCyan">languages </span><span className="text-muted">→ {skills.languages.join(', ')}</span></span>,
          <span key="s2"><span className="text-neonCyan">core cs   </span><span className="text-muted">→ {skills.coreCS.join(', ')}</span></span>,
          <span key="s3"><span className="text-neonCyan">tools &amp; db</span><span className="text-muted"> → {skills.toolsAndDB.join(', ')}</span></span>,
        ],
      }
    case 'projects':
      return {
        lines: projects.flatMap((p, i) => [
          <span key={`p${i}`} className="text-ink">• {p.title} <span className="text-muted">[{p.category}]</span></span>,
          <span key={`pl${i}`} className="ml-3 block text-neonCyan">{p.github}</span>,
        ]),
      }
    case 'contact':
      return {
        lines: [
          <span key="c1"><span className="text-neonCyan">email   </span><span className="text-muted">{personalInfo.email}</span></span>,
          <span key="c2"><span className="text-neonCyan">phone   </span><span className="text-muted">{personalInfo.phone}</span></span>,
          <span key="c3"><span className="text-neonCyan">github  </span><span className="text-muted">{personalInfo.github}</span></span>,
          <span key="c4"><span className="text-neonCyan">linkedin</span><span className="text-muted"> {personalInfo.linkedin}</span></span>,
        ],
      }
    case 'socials':
      return {
        lines: [
          <span key="so1" className="text-muted">GitHub   → <span className="text-neonCyan">{personalInfo.github}</span></span>,
          <span key="so2" className="text-muted">LinkedIn → <span className="text-neonCyan">{personalInfo.linkedin}</span></span>,
        ],
      }
    case 'cv':
    case 'resume':
      return { lines: [<span key="cv" className="text-muted">Scroll to the top and hit <span className="text-neonPurple">“Download CV”</span> to grab it. 📄</span>] }
    case 'ls':
      return { lines: [<span key="ls" className="text-ink">about  skills  projects  experience  contact</span>] }
    case 'echo':
      return { lines: [<span key="e" className="text-ink">{args.join(' ')}</span>] }
    case 'sudo':
      return { lines: [<span key="su" className="text-red-400">Nice try — you don&rsquo;t have sudo privileges here. 😏</span>] }
    case 'clear':
      return { clear: true }
    default:
      return {
        lines: [
          <span key="err" className="text-red-400">
            command not found: {cmd}. Type <span className="text-neonPurple">help</span>.
          </span>,
        ],
      }
  }
}

export default function Terminal() {
  const [history, setHistory] = useState([{ type: 'output', lines: WELCOME }])
  const [value, setValue] = useState('')
  const [collapsed, setCollapsed] = useState(false)
  const [past, setPast] = useState([]) // raw commands for ↑/↓ recall
  const [recall, setRecall] = useState(-1)

  const bodyRef = useRef(null)
  const inputRef = useRef(null)

  // Keep the newest output in view.
  useEffect(() => {
    if (!collapsed && bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight
    }
  }, [history, collapsed])

  const submit = (raw) => {
    const result = runCommand(raw)
    if (result.clear) {
      setHistory([])
    } else {
      setHistory((h) => [...h, { type: 'input', cmd: raw }, { type: 'output', lines: result.lines }])
    }
    if (raw.trim()) setPast((p) => [...p, raw])
    setRecall(-1)
    setValue('')
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      submit(value)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (!past.length) return
      const next = recall < 0 ? past.length - 1 : Math.max(0, recall - 1)
      setRecall(next)
      setValue(past[next])
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (recall < 0) return
      const next = recall + 1
      if (next >= past.length) {
        setRecall(-1)
        setValue('')
      } else {
        setRecall(next)
        setValue(past[next])
      }
    }
  }

  return (
    <section id="terminal" className="relative mx-auto max-w-5xl scroll-mt-24 px-4 py-24 sm:px-6 md:py-28">
      <SectionHeading
        index="05"
        eyebrow="// terminal"
        title="Or just ask the shell"
        kicker="Prefer a keyboard? This little terminal knows me well. Try help, whoami, or projects."
      />

      <Reveal>
        <div className="code-surface mt-10 overflow-hidden rounded-2xl border border-hair shadow-2xl shadow-black/50">
          {/* Title bar (click to collapse/expand) */}
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            aria-expanded={!collapsed}
            className="flex w-full items-center gap-2 border-b border-hair bg-fill px-4 py-3 text-left"
          >
            <span className="h-3 w-3 rounded-full bg-red-400/80" />
            <span className="h-3 w-3 rounded-full bg-yellow-400/80" />
            <span className="h-3 w-3 rounded-full bg-green-400/80" />
            <span className="ml-3 flex items-center gap-1.5 font-mono text-xs text-muted">
              <TerminalSquare className="h-3.5 w-3.5 text-neonCyan" />
              humaidi@portfolio: ~
            </span>
            <ChevronDown
              className={`ml-auto h-4 w-4 text-muted transition-transform duration-300 ${collapsed ? '-rotate-90' : ''}`}
            />
          </button>

          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.div
                key="body"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <div
                  ref={bodyRef}
                  onClick={() => inputRef.current?.focus()}
                  className="no-scrollbar h-72 overflow-y-auto p-4 font-mono text-[13px] leading-relaxed sm:text-sm"
                >
                  {history.map((item, i) =>
                    item.type === 'input' ? (
                      <div key={i} className="flex gap-2">
                        <span className="shrink-0 text-neonCyan">{PROMPT}</span>
                        <span className="text-ink">{item.cmd}</span>
                      </div>
                    ) : (
                      <div key={i} className="mb-2 space-y-0.5">
                        {item.lines.map((line, j) => (
                          <div key={j}>{line}</div>
                        ))}
                      </div>
                    ),
                  )}

                  {/* Live prompt */}
                  <div className="flex items-center gap-2">
                    <span className="shrink-0 text-neonCyan">{PROMPT}</span>
                    <input
                      ref={inputRef}
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      onKeyDown={onKeyDown}
                      spellCheck={false}
                      autoCapitalize="off"
                      autoComplete="off"
                      aria-label="Terminal input"
                      className="flex-1 border-none bg-transparent text-ink caret-neonCyan outline-none"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Reveal>
    </section>
  )
}
