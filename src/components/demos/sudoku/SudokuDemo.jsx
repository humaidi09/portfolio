import { useMemo, useRef, useState } from 'react'
import { CheckCircle2, Delete, Eraser, Play, RotateCcw, Wand2 } from 'lucide-react'
import { Badge, Button, Callout, Field, IconButton, Mono, Panel, Select, Stat, TextInput, Toolbar } from '../ui/kit'
import {
  CELLS,
  DIFFICULTIES,
  EMPTY,
  SIZE,
  SolveStatus,
  boxOf,
  clueCount,
  emptyGrid,
  findConflicts,
  generate,
  parseGrid,
  solve,
  toCompactString,
} from '../../../lib/demos/sudoku'

/**
 * Sudoku Solver — live port. The whole engine runs client-side (see
 * lib/demos/sudoku.js): a backtracking search with a 9-bit candidate mask per
 * row/column/box and most-constrained-variable ordering, plus a carve-to-unique
 * generator whose seed reproduces a puzzle. Opens on the C++ project's own
 * benchmark puzzle (the 30-clue Wikipedia sample) so Solve lands a full grid on
 * the first click.
 */

// The 30-clue Wikipedia sample — the first row of the repo's --benchmark table.
const EXAMPLE = '53..7....6..195....98....6.8...6...34..8.3..17...2...6.6....28....419..5....8..79'

// Cell indices grouped by 3x3 box, in row-major order within each box. Rendering
// box-by-box lets CSS gaps draw the thin in-box lines and the heavier box
// dividers with no border-width math (and stays perfectly aligned).
const BOXES = Array.from({ length: SIZE }, (_, b) => {
  const baseRow = ((b / 3) | 0) * 3
  const baseCol = (b % 3) * 3
  const cells = []
  for (let dr = 0; dr < 3; dr++) for (let dc = 0; dc < 3; dc++) cells.push((baseRow + dr) * SIZE + (baseCol + dc))
  return cells
})

const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9]
const toGivens = (cells) => cells.map((v) => v !== EMPTY)
const firstEmpty = (cells) => {
  const i = cells.findIndex((v) => v === EMPTY)
  return i === -1 ? 0 : i
}

export default function SudokuDemo() {
  const [cells, setCells] = useState(() => parseGrid(EXAMPLE))
  const [givens, setGivens] = useState(() => toGivens(parseGrid(EXAMPLE)))
  const [selected, setSelected] = useState(() => firstEmpty(parseGrid(EXAMPLE)))

  const [difficulty, setDifficulty] = useState('medium')
  const [seed, setSeed] = useState('')
  const [genInfo, setGenInfo] = useState(null) // { clues, seed, difficulty, unique }

  const [solveResult, setSolveResult] = useState(null) // { status, ms, placements, backtracks }
  const [pasteText, setPasteText] = useState('')
  const [pasteError, setPasteError] = useState(null)

  const gridRef = useRef(null)

  // Derived, recomputed from the single source of truth on every edit.
  const conflicts = useMemo(() => findConflicts(cells), [cells])
  const filled = useMemo(() => clueCount(cells), [cells])
  const complete = filled === CELLS
  const sel = selected == null ? null : { r: (selected / SIZE) | 0, c: selected % SIZE, b: boxOf((selected / SIZE) | 0, selected % SIZE) }

  /* --- mutations ------------------------------------------------------ */
  // A loaded puzzle's non-empty cells become locked "givens"; a manual edit
  // invalidates any previous solve read-out.
  const applyPuzzle = (next, resetGen = true) => {
    setCells(next)
    setGivens(toGivens(next))
    setSelected(firstEmpty(next))
    setSolveResult(null)
    setPasteError(null)
    if (resetGen) setGenInfo(null)
  }

  const setCellValue = (index, value) => {
    if (index == null || givens[index]) return // givens are locked
    setCells((prev) => {
      const next = prev.slice()
      next[index] = value
      return next
    })
    setSolveResult(null)
  }

  const eraseSelected = () => setCellValue(selected, EMPTY)

  const handleSolve = () => {
    const clues = toGivens(cells) // whatever is on the board now = the clues
    const t0 = performance.now()
    const res = solve(cells)
    const ms = performance.now() - t0
    if (res.status === SolveStatus.Solved) {
      setCells(res.solution)
      setGivens(clues) // lock the clues so the filled-in answer reads as distinct entries
    }
    setSolveResult({ status: res.status, ms, ...res.stats })
  }

  const handleGenerate = () => {
    // A blank seed is filled with a random one and echoed back, so whatever
    // appears on the board is always reproducible from the seed field.
    const used = seed.trim() || Math.random().toString(36).slice(2, 8)
    if (!seed.trim()) setSeed(used)
    const g = generate(difficulty, used)
    setCells(g.puzzle)
    setGivens(toGivens(g.puzzle))
    setSelected(firstEmpty(g.puzzle))
    setSolveResult(null)
    setPasteError(null)
    setGenInfo({ clues: g.clues, seed: used, difficulty, unique: g.unique })
  }

  const handleClear = () => {
    setCells(emptyGrid())
    setGivens(new Array(CELLS).fill(false))
    setSelected(0)
    setSolveResult(null)
    setGenInfo(null)
    setPasteError(null)
  }

  const handleReset = () => {
    applyPuzzle(parseGrid(EXAMPLE))
    setSeed('')
  }

  const handlePaste = () => {
    const parsed = parseGrid(pasteText)
    if (!parsed) {
      setPasteError('Need exactly 81 cells — digits 1-9 for clues, and . 0 _ or * for blanks.')
      return
    }
    applyPuzzle(parsed)
  }

  /* --- keyboard ------------------------------------------------------- */
  const move = (dr, dc) =>
    setSelected((cur) => {
      const i = cur == null ? 0 : cur
      const r = Math.max(0, Math.min(SIZE - 1, ((i / SIZE) | 0) + dr))
      const c = Math.max(0, Math.min(SIZE - 1, (i % SIZE) + dc))
      return r * SIZE + c
    })

  const onGridKeyDown = (e) => {
    const k = e.key
    if (k === 'ArrowUp') move(-1, 0)
    else if (k === 'ArrowDown') move(1, 0)
    else if (k === 'ArrowLeft') move(0, -1)
    else if (k === 'ArrowRight') move(0, 1)
    else if (k === 'Backspace' || k === 'Delete' || k === '0') eraseSelected()
    else if (k >= '1' && k <= '9') setCellValue(selected ?? 0, Number(k))
    else return
    e.preventDefault()
  }

  const selectCell = (idx) => {
    setSelected(idx)
    gridRef.current?.focus() // focus the grid so keys work right after a click (robust across browsers)
  }

  const padLocked = selected == null || givens[selected]
  const statusBadge = conflicts.size
    ? { tone: 'bad', text: `${conflicts.size} conflict${conflicts.size === 1 ? '' : 's'}` }
    : complete
      ? { tone: 'good', text: 'solved' }
      : { tone: 'neutral', text: `${filled}/81 filled` }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      {/* --------------------------------------------------------- board */}
      <div className="space-y-4">
        <Panel
          eyebrow="// puzzle"
          title="Editable grid"
          actions={<Badge tone={statusBadge.tone}>{statusBadge.text}</Badge>}
        >
          {/* code-surface keeps the grid dark and legible in both themes */}
          <div className="code-surface rounded-xl border border-hair-strong bg-surface p-2.5 sm:p-3">
            <div
              ref={gridRef}
              role="group"
              aria-label="Sudoku grid"
              tabIndex={0}
              onKeyDown={onGridKeyDown}
              className="mx-auto grid aspect-square w-full max-w-[26rem] grid-cols-3 grid-rows-3 gap-[3px] rounded-md bg-white/30 outline-none ring-neonCyan/50 focus-visible:ring-2"
            >
              {BOXES.map((box, boxIdx) => (
                <div key={boxIdx} className="grid grid-cols-3 grid-rows-3 gap-px bg-white/10">
                  {box.map((idx) => {
                    const r = (idx / SIZE) | 0
                    const c = idx % SIZE
                    const value = cells[idx]
                    const given = givens[idx]
                    const bad = conflicts.has(idx)
                    const isSel = selected === idx
                    const isPeer = sel && !isSel && (r === sel.r || c === sel.c || boxOf(r, c) === sel.b)

                    const bg = bad ? 'bg-red-500/25' : isSel ? 'bg-neonCyan/20' : isPeer ? 'bg-white/[0.05]' : 'bg-surface'
                    const text = bad ? 'text-red-300 font-semibold' : given ? 'text-ink font-bold' : 'text-neonCyan font-semibold'
                    const ring = isSel ? 'relative z-10 ring-2 ring-inset ring-neonCyan' : ''

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => selectCell(idx)}
                        aria-label={`Row ${r + 1}, column ${c + 1}${given ? `, given ${value}` : value ? `, ${value}` : ', empty'}`}
                        className={`flex select-none items-center justify-center font-mono text-lg leading-none tabular-nums transition-colors focus:outline-none sm:text-xl ${bg} ${text} ${ring}`}
                      >
                        {value || ''}
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>

          <p className="mt-3 text-center text-xs text-muted">
            Tap a cell, then type <Mono>1</Mono>–<Mono>9</Mono>. Arrow keys move · <Mono>⌫</Mono> clears.
          </p>

          {/* On-screen keypad — makes the grid fully usable on touch, no keyboard */}
          <div className="mt-3 flex flex-wrap justify-center gap-1.5">
            {DIGITS.map((n) => (
              <IconButton
                key={n}
                label={`Enter ${n}`}
                onClick={() => setCellValue(selected, n)}
                disabled={padLocked}
                className="font-mono text-base font-semibold text-ink"
              >
                {n}
              </IconButton>
            ))}
            <IconButton label="Erase cell" onClick={eraseSelected} disabled={padLocked}>
              <Delete className="h-4 w-4" />
            </IconButton>
          </div>

          <Toolbar className="mt-4 justify-center">
            <Button variant="primary" onClick={handleSolve}>
              <Play className="h-4 w-4" />
              Solve
            </Button>
            <Button variant="ghost" onClick={handleClear}>
              <Eraser className="h-4 w-4" />
              Clear
            </Button>
            <Button variant="subtle" onClick={handleReset}>
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </Toolbar>
        </Panel>

        {/* Solve outcome for the two failure cases (mirrors the C++ status enum) */}
        {solveResult && solveResult.status !== SolveStatus.Solved && (
          <Callout
            tone="bad"
            title={solveResult.status === SolveStatus.Invalid ? 'These clues break a rule' : 'No solution'}
          >
            {solveResult.status === SolveStatus.Invalid
              ? 'A digit already repeats in a row, column or box — fix the highlighted cells and solve again.'
              : 'No completion of this grid satisfies every row, column and box. Recheck the clues and try again.'}
          </Callout>
        )}
      </div>

      {/* ------------------------------------------------------- sidebar */}
      <div className="space-y-4">
        <Panel eyebrow="// generate" title="New puzzle" bodyClass="space-y-3">
          <Field label="Difficulty" hint="clues left">
            <Select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
              {DIFFICULTIES.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label} · {d.clues} clues
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Seed" hint="optional">
            <TextInput value={seed} placeholder="random — same seed repeats" onChange={(e) => setSeed(e.target.value)} />
          </Field>
          <Button variant="primary" className="w-full" onClick={handleGenerate}>
            <Wand2 className="h-4 w-4" />
            Generate
          </Button>

          {genInfo && (
            <div className="space-y-2 pt-1">
              <Badge tone="good">
                <CheckCircle2 className="h-3.5 w-3.5" />
                unique solution
              </Badge>
              <p className="font-mono text-xs text-muted">
                {genInfo.clues} clues · {genInfo.difficulty} · seed <span className="text-ink">{genInfo.seed}</span>
              </p>
            </div>
          )}
        </Panel>

        {solveResult && solveResult.status === SolveStatus.Solved && (
          <Panel eyebrow="// solved" bodyClass="space-y-3">
            <Stat
              label="Solve time"
              value={`${solveResult.ms.toFixed(2)} ms`}
              accent
              sub={`${solveResult.placements.toLocaleString()} placements · ${solveResult.backtracks.toLocaleString()} backtracks`}
            />
            <div className="code-surface break-all rounded-lg border border-hair bg-surface p-3 font-mono text-[11px] leading-relaxed text-muted">
              {toCompactString(cells)}
            </div>
          </Panel>
        )}

        <Panel eyebrow="// paste" title="Load a grid" bodyClass="space-y-2">
          <TextInput
            aria-label="Paste 81-character grid"
            value={pasteText}
            placeholder="81 chars, e.g. 53..7....6..195…"
            onChange={(e) => {
              setPasteText(e.target.value)
              setPasteError(null)
            }}
          />
          <Button variant="ghost" className="w-full" onClick={handlePaste}>
            Load grid
          </Button>
          {pasteError ? (
            <p className="text-xs text-red-300">{pasteError}</p>
          ) : (
            <p className="text-xs text-muted">
              Digits <Mono>1</Mono>–<Mono>9</Mono> are clues; <Mono>.</Mono> <Mono>0</Mono> <Mono>_</Mono> <Mono>*</Mono> are
              blanks. Borders and spaces are ignored, so a pretty-printed grid pastes straight in.
            </p>
          )}
        </Panel>

        <Callout tone="info" title="How it solves">
          Each row, column and box keeps a 9-bit mask of used digits, so a cell's candidates are one expression:{' '}
          <Mono>~(row | col | box) &amp; 0x1FF</Mono>. The search always fills the cell with the fewest candidates first
          (MRV), which cracks even 17-clue puzzles in milliseconds. Generation fills a random grid, then removes clues only
          while a solution counter proves the puzzle still unique.
        </Callout>
      </div>
    </div>
  )
}
