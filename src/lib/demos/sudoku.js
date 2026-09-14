// Faithful in-browser port of the Sudoku-Solver core (C++ -> JS).
//
// Mirrors src/{board,solver,generator}.cpp from the repo:
//   * the board is a flat array of 81 cells, 0 = empty (Board);
//   * the solver is recursive backtracking with a 9-bit candidate mask per row,
//     column and box, plus most-constrained-variable (MRV) cell ordering, so a
//     legality test is one bitwise op and dead branches are found early
//     (solver.cpp);
//   * generation fills a random complete grid, then carves clues away while a
//     solution counter that stops at 2 still proves the puzzle unique
//     (generator.cpp).
//
// The one deliberate divergence from the C++ is the random source: std::mt19937
// cannot be reproduced byte-for-byte in JS, so the generator draws from the
// site's shared seeded PRNG (prng.js) instead. A given seed therefore
// reproduces a puzzle within this demo — the property the UI advertises — even
// though the exact grid differs from the native binary's.

import { mulberry32, hashSeed, shuffle } from './prng'

export const SIZE = 9 // 9x9 grid
export const BOX = 3 // 3x3 subgrid
export const CELLS = 81
export const EMPTY = 0 // sentinel for an unfilled cell

const ALL = 0x1ff // bits 0-8 set: digits 1-9 all available

/** Index of the box containing (row, col): (r/3)*3 + (c/3), 0-8 left to right. */
export function boxOf(row, col) {
  return ((row / BOX) | 0) * BOX + ((col / BOX) | 0)
}

/** Flat cell index for (row, col). */
export const cellIndex = (row, col) => row * SIZE + col

/** Population count of a 9-bit mask (Kernighan's clear-the-lowest-bit loop). */
function popcount9(mask) {
  let count = 0
  while (mask) {
    mask &= mask - 1
    count++
  }
  return count
}

/** The digit (1-9) a single-bit mask stands for: bit 0 -> 1 ... bit 8 -> 9. */
function digitFromBit(bit) {
  let digit = 1
  while (bit > 1) {
    bit >>= 1
    digit++
  }
  return digit
}

/** A fresh empty grid: 81 zeros. */
export function emptyGrid() {
  return new Array(CELLS).fill(EMPTY)
}

/** Number of filled (non-empty) cells — the clue count (Board::clueCount). */
export function clueCount(cells) {
  let n = 0
  for (let i = 0; i < CELLS; i++) if (cells[i] !== EMPTY) n++
  return n
}

/** True when no cell is empty (says nothing about validity — Board::isComplete). */
export function isComplete(cells) {
  for (let i = 0; i < CELLS; i++) if (cells[i] === EMPTY) return false
  return true
}

/** Render a grid as 81 characters, '.' for empty (Board::toCompactString). */
export function toCompactString(cells) {
  let out = ''
  for (let i = 0; i < CELLS; i++) out += cells[i] === EMPTY ? '.' : String(cells[i])
  return out
}

/**
 * Tolerant parser, faithful to Board::parse: digits 1-9 are clues; '.', '0',
 * '_' and '*' mark empty cells; every other character (spaces, '|', '+', '-',
 * newlines) is decoration and is skipped — so a pretty-printed grid with
 * borders pastes straight back in. Returns an 81-cell array, or null when the
 * text does not hold exactly 81 cell characters.
 */
export function parseGrid(text) {
  const values = []
  for (const ch of text) {
    if (ch >= '1' && ch <= '9') values.push(ch.charCodeAt(0) - 48)
    else if (ch === '.' || ch === '0' || ch === '_' || ch === '*') values.push(EMPTY)
    // anything else is layout, not a cell
    if (values.length > CELLS) return null
  }
  return values.length === CELLS ? values : null
}

/* ------------------------------------------------------------- conflicts -- */

// Mark every cell in `unit` (nine cell indices) whose digit repeats within it.
function markUnit(cells, unit, bad) {
  const byDigit = new Map() // digit -> [indices]
  for (const i of unit) {
    const v = cells[i]
    if (v === EMPTY) continue
    const list = byDigit.get(v)
    if (list) list.push(i)
    else byDigit.set(v, [i])
  }
  for (const list of byDigit.values()) {
    if (list.length > 1) for (const i of list) bad.add(i)
  }
}

/**
 * The set of cell indices that break a Sudoku rule — a digit repeated in its
 * row, column or box. Powers the grid's live conflict highlighting. (The C++
 * asks the yes/no question with Board::isValid; the UI wants to know *which*
 * cells clash, so this reports the offending set.)
 */
export function findConflicts(cells) {
  const bad = new Set()
  for (let r = 0; r < SIZE; r++) {
    const row = []
    const col = []
    for (let c = 0; c < SIZE; c++) {
      row.push(cellIndex(r, c))
      col.push(cellIndex(c, r))
    }
    markUnit(cells, row, bad)
    markUnit(cells, col, bad)
  }
  for (let b = 0; b < SIZE; b++) {
    const box = []
    const baseRow = ((b / BOX) | 0) * BOX
    const baseCol = (b % BOX) * BOX
    for (let dr = 0; dr < BOX; dr++) {
      for (let dc = 0; dc < BOX; dc++) box.push(cellIndex(baseRow + dr, baseCol + dc))
    }
    markUnit(cells, box, bad)
  }
  return bad
}

/* ---------------------------------------------------------------- solver -- */

// The mutable search state: the grid plus one 9-bit mask per row, column and
// box recording which digits are already used there (SearchState in solver.cpp).
// makeState returns null when the given clues already conflict, which lets an
// invalid puzzle be rejected before any search — the C++ initialise() guard.
function makeState(cells) {
  const state = {
    cells: cells.slice(),
    rowMask: new Array(SIZE).fill(0),
    colMask: new Array(SIZE).fill(0),
    boxMask: new Array(SIZE).fill(0),
    placements: 0,
    backtracks: 0,
  }
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const v = state.cells[cellIndex(r, c)]
      if (v === EMPTY) continue
      if (v < 1 || v > 9) return null
      const bit = 1 << (v - 1)
      const b = boxOf(r, c)
      if ((state.rowMask[r] | state.colMask[c] | state.boxMask[b]) & bit) return null
      state.rowMask[r] |= bit
      state.colMask[c] |= bit
      state.boxMask[b] |= bit
    }
  }
  return state
}

// candidatesAt(r,c) = ~(rowMask | colMask | boxMask) & 0x1FF — the digits still
// legal here, computed without touching the grid.
function candidatesAt(state, row, col) {
  const used = state.rowMask[row] | state.colMask[col] | state.boxMask[boxOf(row, col)]
  return ~used & ALL
}

function place(state, row, col, value) {
  const bit = 1 << (value - 1)
  state.cells[cellIndex(row, col)] = value
  state.rowMask[row] |= bit
  state.colMask[col] |= bit
  state.boxMask[boxOf(row, col)] |= bit
  state.placements++
}

function unplace(state, row, col, value) {
  const bit = 1 << (value - 1)
  state.cells[cellIndex(row, col)] = EMPTY
  state.rowMask[row] &= ~bit
  state.colMask[col] &= ~bit
  state.boxMask[boxOf(row, col)] &= ~bit
  state.backtracks++
}

// Most-constrained-variable ordering: the empty cell with the FEWEST candidates
// is filled next. Returns { row, col, candidates } or null when the grid is
// full. A cell with zero candidates is a dead end — nothing beats it, so the
// scan stops early (selectCell in solver.cpp).
function selectCell(state) {
  let fewest = 10
  let best = null
  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {
      if (state.cells[cellIndex(row, col)] !== EMPTY) continue
      const candidates = candidatesAt(state, row, col)
      const count = popcount9(candidates)
      if (count < fewest) {
        fewest = count
        best = { row, col, candidates }
        if (count === 0) return best
      }
    }
  }
  return best
}

// Depth-first search over the most-constrained cell. Digits are tried
// lowest-set-bit first: `for (m = cand; m; m &= m - 1) { bit = m & -m; ... }`.
function search(state) {
  const sel = selectCell(state)
  if (!sel) return true // no empty cells left: solved
  if (sel.candidates === 0) return false // this cell cannot be filled: backtrack
  for (let m = sel.candidates; m !== 0; m &= m - 1) {
    const value = digitFromBit(m & -m)
    place(state, sel.row, sel.col, value)
    if (search(state)) return true
    unplace(state, sel.row, sel.col, value)
  }
  return false
}

// Counting variant: explores branches until `limit` complete grids are seen,
// then unwinds. limit = 2 answers "is this unique?" cheaply (searchCounting).
function searchCounting(state, limit, counter) {
  if (counter.found >= limit) return
  const sel = selectCell(state)
  if (!sel) {
    counter.found++
    return
  }
  if (sel.candidates === 0) return
  for (let m = sel.candidates; m !== 0; m &= m - 1) {
    const value = digitFromBit(m & -m)
    place(state, sel.row, sel.col, value)
    searchCounting(state, limit, counter)
    unplace(state, sel.row, sel.col, value)
    if (counter.found >= limit) return
  }
}

/** Solve status, mirroring the C++ SolveStatus enum. */
export const SolveStatus = {
  Solved: 'solved', // exactly one solution was found and written back
  NoSolution: 'no-solution', // contradictory or over-constrained
  Invalid: 'invalid', // the given clues already break a Sudoku rule
}

/**
 * Solve a grid in place-equivalent fashion: returns the completed solution plus
 * the work done (placements written, dead-end backtracks, empties at start).
 * Faithful to solver.cpp's solve(): an initial clue clash is reported as
 * `invalid` before any search runs; a legal-but-unsolvable grid is `no-solution`.
 */
export function solve(cells) {
  const emptyAtStart = CELLS - clueCount(cells)
  const state = makeState(cells)
  if (!state) {
    return { status: SolveStatus.Invalid, solution: null, stats: { placements: 0, backtracks: 0, emptyAtStart } }
  }
  const solved = search(state)
  const stats = { placements: state.placements, backtracks: state.backtracks, emptyAtStart }
  if (solved) return { status: SolveStatus.Solved, solution: state.cells.slice(), stats }
  return { status: SolveStatus.NoSolution, solution: null, stats }
}

/**
 * Count solutions, stopping as soon as `limit` are found (countSolutions).
 * Passing limit = 2 is the cheap way to ask "is this unique?" without
 * enumerating an astronomical number of grids.
 */
export function countSolutions(cells, limit = 2) {
  if (limit <= 0) return 0
  const state = makeState(cells)
  if (!state) return 0 // contradictory clues
  const counter = { found: 0 }
  searchCounting(state, limit, counter)
  return counter.found
}

/** True when the puzzle has exactly one solution (hasUniqueSolution). */
export function hasUniqueSolution(cells) {
  return countSolutions(cells, 2) === 1
}

/* ------------------------------------------------------------- generator -- */

// Difficulty is expressed as how many clues are left on the board — fewer clues
// means a larger search space and, in general, a harder puzzle (generator.cpp).
// 17 is the proven minimum for a uniquely solvable Sudoku; generation never
// drops below it.
export const DIFFICULTIES = [
  { id: 'easy', label: 'Easy', clues: 45 },
  { id: 'medium', label: 'Medium', clues: 36 },
  { id: 'hard', label: 'Hard', clues: 30 },
  { id: 'expert', label: 'Expert', clues: 25 },
]

const CLUE_TARGET = { easy: 45, medium: 36, hard: 30, expert: 25 }

/** Target clue count for a difficulty level (targetClues). */
export function targetClues(difficulty) {
  return CLUE_TARGET[difficulty] ?? 36
}

// Phase 1: fill an empty grid left to right, trying each cell's legal digits in
// a SHUFFLED order so a run produces a random complete grid (fillRandom). Note
// this is plain reading-order backtracking, not MRV — MRV is only for solving.
function fillComplete(rng) {
  const cells = emptyGrid()
  const rowMask = new Array(SIZE).fill(0)
  const colMask = new Array(SIZE).fill(0)
  const boxMask = new Array(SIZE).fill(0)

  const recurse = (index) => {
    if (index === CELLS) return true
    const row = (index / SIZE) | 0
    const col = index % SIZE
    const b = boxOf(row, col)
    // Legal digits here, collected lowest-first (ascending 1..9), then shuffled.
    const candidates = ~(rowMask[row] | colMask[col] | boxMask[b]) & ALL
    const digits = []
    for (let m = candidates; m !== 0; m &= m - 1) digits.push(digitFromBit(m & -m))
    shuffle(digits, rng)
    for (const value of digits) {
      const bit = 1 << (value - 1)
      cells[index] = value
      rowMask[row] |= bit
      colMask[col] |= bit
      boxMask[b] |= bit
      if (recurse(index + 1)) return true
      cells[index] = EMPTY
      rowMask[row] &= ~bit
      colMask[col] &= ~bit
      boxMask[b] &= ~bit
    }
    return false
  }

  recurse(0)
  return cells
}

/** A random complete, valid grid from a text seed (fillRandomComplete). */
export function fillSolution(seedText) {
  return fillComplete(mulberry32(hashSeed(seedText)))
}

/**
 * Build a puzzle guaranteed to have exactly one solution (generate). Two phases:
 *   1. a randomised solve fills a complete valid grid — the answer;
 *   2. clues are removed in random order, but a removal is kept only while the
 *      puzzle still has a unique solution (checked by the stop-at-2 counter);
 *      anything that would make it ambiguous is put straight back.
 * One seeded PRNG drives both the fill and the removal order, so `seedText`
 * reproduces the whole puzzle.
 */
export function generate(difficulty, seedText) {
  const rng = mulberry32(hashSeed(seedText))

  // Phase 1: the complete answer grid.
  const solution = fillComplete(rng)

  // Phase 2: carve clues away while the solution stays unique.
  const puzzle = solution.slice()
  const order = Array.from({ length: CELLS }, (_, i) => i)
  shuffle(order, rng)

  const target = targetClues(difficulty)
  let clues = CELLS
  for (const idx of order) {
    if (clues <= target) break
    const removed = puzzle[idx]
    puzzle[idx] = EMPTY
    if (hasUniqueSolution(puzzle)) clues--
    else puzzle[idx] = removed // removing this clue would make the puzzle ambiguous
  }

  return {
    puzzle,
    solution,
    clues: clueCount(puzzle),
    difficulty,
    seed: seedText,
    unique: hasUniqueSolution(puzzle), // proven, not assumed (the CLI re-verifies too)
  }
}
