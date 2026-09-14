// Faithful in-browser port of the World-Cup-2026 prediction engine (Python → JS).
//
// The real repo (github.com/humaidi09/World-Cup-2026) is an offline engine that
// simulates the REAL 48-team FIFA World Cup 2026 from real data: the 48 qualified
// nations and a dated snapshot of published World Football Elo ratings. It draws
// the 12 groups (pot-based, rule-correct), plays the group stage under the
// official FIFA tiebreakers, picks the 8 best third-placed teams, resolves the
// real published Round-of-32 bracket to a champion, and runs Monte Carlo to turn
// Elo into each nation's odds. This module ports that engine's data + rules
// verbatim; the Monte Carlo aggregation is this demo's analytical layer on top.
//
// The match model is Elo → scoreline (worldcup/elo.py): a win expectancy from the
// Elo gap is mapped to two Poisson goal rates, and each side's goals are sampled
// independently — giving wins, draws and the goal difference / goals-for that the
// group tiebreakers need. A drawn knockout tie is settled by an Elo-weighted coin
// flip (the model's stand-in for extra time and penalties). Every number this
// produces is a PREDICTION, never a claim of fact.
//
// All randomness flows through the shared seeded PRNG (lib/demos/prng.js) so a
// text seed reproduces the exact same tournament on every machine and reload.

import { mulberry32, hashSeed, shuffle } from './prng.js'

/* ------------------------------------------------------------------ data -- */

// Data provenance, carried inline in the real data/teams_2026.json.
export const PROVENANCE = {
  eloSource: 'eloratings.net (World Football Elo Ratings)',
  eloAsOf: '2026-07-19',
  note: 'A dated Elo snapshot for reproducible simulation, not live values.',
}

// The 48 real qualified teams, ported verbatim from data/teams_2026.json:
// the 42 direct qualifiers plus the six March 2026 play-off winners (Bosnia,
// Sweden, Turkey, Czech Republic, DR Congo, Iraq). Each carries its real
// confederation, seeding pot (1–4) and the dated Elo rating the model reads.
export const TEAMS = [
  // Pot 1 — the top seeds (three hosts + the highest-rated sides).
  { code: 'USA', name: 'United States', confederation: 'CONCACAF', pot: 1, host: true, elo: 1746 },
  { code: 'MEX', name: 'Mexico', confederation: 'CONCACAF', pot: 1, host: true, elo: 1913 },
  { code: 'CAN', name: 'Canada', confederation: 'CONCACAF', pot: 1, host: true, elo: 1729 },
  { code: 'ESP', name: 'Spain', confederation: 'UEFA', pot: 1, host: false, elo: 2259 },
  { code: 'ARG', name: 'Argentina', confederation: 'CONMEBOL', pot: 1, host: false, elo: 2173 },
  { code: 'FRA', name: 'France', confederation: 'UEFA', pot: 1, host: false, elo: 2070 },
  { code: 'ENG', name: 'England', confederation: 'UEFA', pot: 1, host: false, elo: 2125 },
  { code: 'BRA', name: 'Brazil', confederation: 'CONMEBOL', pot: 1, host: false, elo: 1993 },
  { code: 'POR', name: 'Portugal', confederation: 'UEFA', pot: 1, host: false, elo: 1995 },
  { code: 'NED', name: 'Netherlands', confederation: 'UEFA', pot: 1, host: false, elo: 1971 },
  { code: 'BEL', name: 'Belgium', confederation: 'UEFA', pot: 1, host: false, elo: 1947 },
  { code: 'GER', name: 'Germany', confederation: 'UEFA', pot: 1, host: false, elo: 1907 },
  // Pot 2
  { code: 'CRO', name: 'Croatia', confederation: 'UEFA', pot: 2, host: false, elo: 1881 },
  { code: 'MAR', name: 'Morocco', confederation: 'CAF', pot: 2, host: false, elo: 1901 },
  { code: 'COL', name: 'Colombia', confederation: 'CONMEBOL', pot: 2, host: false, elo: 2003 },
  { code: 'URU', name: 'Uruguay', confederation: 'CONMEBOL', pot: 2, host: false, elo: 1841 },
  { code: 'SUI', name: 'Switzerland', confederation: 'UEFA', pot: 2, host: false, elo: 1928 },
  { code: 'JPN', name: 'Japan', confederation: 'AFC', pot: 2, host: false, elo: 1888 },
  { code: 'SEN', name: 'Senegal', confederation: 'CAF', pot: 2, host: false, elo: 1816 },
  { code: 'IRN', name: 'Iran', confederation: 'AFC', pot: 2, host: false, elo: 1764 },
  { code: 'KOR', name: 'South Korea', confederation: 'AFC', pot: 2, host: false, elo: 1723 },
  { code: 'ECU', name: 'Ecuador', confederation: 'CONMEBOL', pot: 2, host: false, elo: 1871 },
  { code: 'AUT', name: 'Austria', confederation: 'UEFA', pot: 2, host: false, elo: 1821 },
  { code: 'AUS', name: 'Australia', confederation: 'AFC', pot: 2, host: false, elo: 1795 },
  // Pot 3
  { code: 'NOR', name: 'Norway', confederation: 'UEFA', pot: 3, host: false, elo: 1952 },
  { code: 'PAN', name: 'Panama', confederation: 'CONCACAF', pot: 3, host: false, elo: 1658 },
  { code: 'EGY', name: 'Egypt', confederation: 'CAF', pot: 3, host: false, elo: 1742 },
  { code: 'ALG', name: 'Algeria', confederation: 'CAF', pot: 3, host: false, elo: 1756 },
  { code: 'SCO', name: 'Scotland', confederation: 'UEFA', pot: 3, host: false, elo: 1746 },
  { code: 'PAR', name: 'Paraguay', confederation: 'CONMEBOL', pot: 3, host: false, elo: 1814 },
  { code: 'TUN', name: 'Tunisia', confederation: 'CAF', pot: 3, host: false, elo: 1562 },
  { code: 'CIV', name: 'Ivory Coast', confederation: 'CAF', pot: 3, host: false, elo: 1728 },
  { code: 'UZB', name: 'Uzbekistan', confederation: 'AFC', pot: 3, host: false, elo: 1630 },
  { code: 'QAT', name: 'Qatar', confederation: 'AFC', pot: 3, host: false, elo: 1411 },
  { code: 'KSA', name: 'Saudi Arabia', confederation: 'AFC', pot: 3, host: false, elo: 1596 },
  { code: 'RSA', name: 'South Africa', confederation: 'CAF', pot: 3, host: false, elo: 1560 },
  // Pot 4 — includes the six March 2026 play-off winners.
  { code: 'JOR', name: 'Jordan', confederation: 'AFC', pot: 4, host: false, elo: 1628 },
  { code: 'CPV', name: 'Cape Verde', confederation: 'CAF', pot: 4, host: false, elo: 1619 },
  { code: 'GHA', name: 'Ghana', confederation: 'CAF', pot: 4, host: false, elo: 1571 },
  { code: 'CUW', name: 'Curacao', confederation: 'CONCACAF', pot: 4, host: false, elo: 1438 },
  { code: 'HAI', name: 'Haiti', confederation: 'CONCACAF', pot: 4, host: false, elo: 1517 },
  { code: 'NZL', name: 'New Zealand', confederation: 'OFC', pot: 4, host: false, elo: 1534 },
  { code: 'BIH', name: 'Bosnia and Herzegovina', confederation: 'UEFA', pot: 4, host: false, elo: 1605 },
  { code: 'SWE', name: 'Sweden', confederation: 'UEFA', pot: 4, host: false, elo: 1731 },
  { code: 'TUR', name: 'Turkey', confederation: 'UEFA', pot: 4, host: false, elo: 1852 },
  { code: 'CZE', name: 'Czech Republic', confederation: 'UEFA', pot: 4, host: false, elo: 1680 },
  { code: 'COD', name: 'DR Congo', confederation: 'CAF', pot: 4, host: false, elo: 1704 },
  { code: 'IRQ', name: 'Iraq', confederation: 'AFC', pot: 4, host: false, elo: 1561 },
]

// Code → team, and code → Elo, for O(1) lookups during a simulation.
const TEAM_OF = new Map(TEAMS.map((t) => [t.code, t]))
const ELO_OF = new Map(TEAMS.map((t) => [t.code, t.elo]))

/** The Elo rating for a team code (all codes are real teams from TEAMS). */
export function teamElo(code) {
  return ELO_OF.get(code)
}

/** The full team record for a code. */
export function teamOf(code) {
  return TEAM_OF.get(code)
}

/* ------------------------------------------------- Elo → scoreline model -- */

// League-average goals per team per game; ~2.7 total is typical for men's
// international football, so ~1.35 per side is the neutral baseline (elo.py).
export const BASE_GOALS = 1.35
// How strongly the Elo gap tilts the goal split between the two sides.
export const GOAL_TILT = 0.6
const MIN_LAMBDA = 0.15
const MAX_LAMBDA = 5.0

/** Win expectancy in (0, 1) that A is the stronger side: the standard Elo curve. */
export function winExpectancy(eloA, eloB, advantage = 0) {
  return 1 / (1 + 10 ** ((eloB - eloA + advantage) / 400))
}

/** Map the Elo gap to (lambdaA, lambdaB) expected-goal rates, clamped to a sane band. */
export function expectedGoals(eloA, eloB, advantage = 0) {
  const eA = winExpectancy(eloA, eloB, advantage)
  // Centre the split on 0.5: equal ratings → equal BASE_GOALS each.
  let lamA = BASE_GOALS * Math.exp(GOAL_TILT * (eA - 0.5) * 2)
  let lamB = BASE_GOALS * Math.exp(GOAL_TILT * (1 - eA - 0.5) * 2)
  lamA = Math.min(MAX_LAMBDA, Math.max(MIN_LAMBDA, lamA))
  lamB = Math.min(MAX_LAMBDA, Math.max(MIN_LAMBDA, lamB))
  return [lamA, lamB]
}

/** Sample a Poisson count with Knuth's algorithm on the injected rng. */
function poisson(lam, rng) {
  const limit = Math.exp(-lam)
  let k = 0
  let product = 1
  for (;;) {
    product *= rng()
    if (product <= limit) return k
    k += 1
  }
}

/** Sample a full (goalsA, goalsB) scoreline for one match. */
export function simulateScoreline(eloA, eloB, rng, advantage = 0) {
  const [lamA, lamB] = expectedGoals(eloA, eloB, advantage)
  return [poisson(lamA, rng), poisson(lamB, rng)]
}

/**
 * Resolve a drawn knockout tie by an Elo-weighted coin flip. Draws aren't
 * allowed past the group stage, so a level regulation is decided in proportion
 * to the two sides' win expectancy — the model's stand-in for ET/penalties.
 */
export function knockoutWinnerIsA(eloA, eloB, rng, advantage = 0) {
  return rng() < winExpectancy(eloA, eloB, advantage)
}

/* -------------------------------------------------------------- the draw -- */

// Twelve groups A–L, one team per pot per group.
export const GROUP_LABELS = Array.from({ length: 12 }, (_, i) => String.fromCharCode(65 + i))

// Real host pre-placements (group index): Mexico → A(0), Canada → B(1), USA → D(3).
const HOST_SLOTS = { MEX: 0, CAN: 1, USA: 3 }
const MAX_UEFA_PER_GROUP = 2
const MAX_RESTARTS = 20000

// The real FIFA constraint: no group holds two teams from the same confederation
// — except UEFA, which (with 16 teams across 12 groups) may have up to two.
function confederationOk(group, team) {
  const same = group.filter((t) => t.confederation === team.confederation)
  if (same.length === 0) return true
  if (team.confederation === 'UEFA') return same.length < MAX_UEFA_PER_GROUP
  return false
}

// Backtracking placement of one pot's teams into the 12 groups: each group gets
// exactly one team from this pot; pre-placed hosts take their fixed group.
function placePot(groups, potTeams, fixedGroupOf) {
  const usedGroups = new Set()
  const remaining = []
  for (const team of potTeams) {
    if (team.code in fixedGroupOf) {
      const gi = fixedGroupOf[team.code]
      groups[gi].push(team)
      usedGroups.add(gi)
    } else {
      remaining.push(team)
    }
  }

  const openGroups = []
  for (let i = 0; i < 12; i++) if (!usedGroups.has(i)) openGroups.push(i)
  const filled = new Set()

  const backtrack = (idx) => {
    if (idx === remaining.length) return true
    const team = remaining[idx]
    for (const gi of openGroups) {
      if (filled.has(gi)) continue
      if (confederationOk(groups[gi], team)) {
        groups[gi].push(team)
        filled.add(gi)
        if (backtrack(idx + 1)) return true
        filled.delete(gi)
        groups[gi].pop()
      }
    }
    return false
  }

  if (backtrack(0)) return true
  // Failed: undo this pot's pre-placed teams so the caller can restart clean.
  for (const gi of usedGroups) groups[gi].pop()
  return false
}

/**
 * Draw the twelve groups. Fills pot by pot: within a pot the teams are shuffled
 * with the injected rng, then placed by backtracking so every group ends valid.
 * A bounded number of reshuffled restarts keeps it fast and reproducible.
 * With `realHosts`, Mexico/Canada/USA are fixed to A/B/D as the real draw did.
 * Returns an ordered `{ A: [pot1,pot2,pot3,pot4], ... }`.
 */
export function drawGroups(teams, rng, realHosts = true) {
  const byPot = { 1: [], 2: [], 3: [], 4: [] }
  for (const t of teams) byPot[t.pot].push(t)

  const fixedGroupOf = {}
  if (realHosts) for (const [code, gi] of Object.entries(HOST_SLOTS)) fixedGroupOf[code] = gi

  for (let attempt = 0; attempt < MAX_RESTARTS; attempt++) {
    const groups = Array.from({ length: 12 }, () => [])
    let ok = true
    for (const pot of [1, 2, 3, 4]) {
      const potTeams = byPot[pot].slice()
      shuffle(potTeams, rng)
      if (!placePot(groups, potTeams, fixedGroupOf)) {
        ok = false
        break
      }
    }
    if (ok && groups.every((g) => g.length === 4)) {
      const out = {}
      for (let i = 0; i < 12; i++) out[GROUP_LABELS[i]] = groups[i]
      return out
    }
  }
  throw new Error('could not complete a valid draw after many attempts')
}

/* ------------------------------------------------- group-stage standings -- */

export const WIN_POINTS = 3
export const DRAW_POINTS = 1

function newRecord(code) {
  return { code, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0 }
}
function points(r) {
  return r.won * WIN_POINTS + r.drawn * DRAW_POINTS
}
function goalDiff(r) {
  return r.goalsFor - r.goalsAgainst
}
function tally(r, scored, conceded) {
  r.played += 1
  r.goalsFor += scored
  r.goalsAgainst += conceded
  if (scored > conceded) r.won += 1
  else if (scored < conceded) r.lost += 1
  else r.drawn += 1
}

// The official FIFA overall key: points, then goal difference, then goals for.
function overallKey(r) {
  return [points(r), goalDiff(r), r.goalsFor]
}
// Comparator for that key, descending (for Array.sort).
function keyCmp(a, b) {
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return b[i] - a[i]
  return 0
}
function keyEq(a, b) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2]
}

// Tally `codes` over the matches that involve only those codes.
function buildTable(codes, matches) {
  const table = new Map(codes.map((c) => [c, newRecord(c)]))
  const wanted = new Set(codes)
  for (const m of matches) {
    if (wanted.has(m.a) && wanted.has(m.b)) {
      tally(table.get(m.a), m.goalsA, m.goalsB)
      tally(table.get(m.b), m.goalsB, m.goalsA)
    }
  }
  return table
}

// Split a sorted code list into runs of equal overall key, calling `onBlock`.
function forEachTieBlock(sortedCodes, keyOf, onBlock) {
  let i = 0
  while (i < sortedCodes.length) {
    let j = i + 1
    const ki = keyOf(sortedCodes[i])
    while (j < sortedCodes.length && keyEq(keyOf(sortedCodes[j]), ki)) j += 1
    onBlock(sortedCodes.slice(i, j))
    i = j
  }
}

// Break a block of teams level on the overall key: head-to-head, then lots.
function breakTie(block, matches, rng) {
  const h2h = buildTable(block, matches) // only matches among the tied teams count
  const keyOf = (c) => overallKey(h2h.get(c))
  const byH2h = block.slice().sort((x, y) => keyCmp(keyOf(x), keyOf(y)))
  const ordered = []
  forEachTieBlock(byH2h, keyOf, (level) => {
    if (level.length === 1) {
      ordered.push(level[0])
    } else {
      // Head-to-head could not separate these teams: drawing of lots.
      shuffle(level, rng)
      ordered.push(...level)
    }
  })
  return ordered
}

/**
 * Order a group's teams 1st→last by the official FIFA tiebreakers: points → goal
 * difference → goals for → head-to-head among only the level teams → lots.
 * (FIFA's fair-play criterion is omitted — the engine models no bookings.)
 */
export function orderGroup(codes, matches, rng) {
  const table = buildTable(codes, matches)
  const keyOf = (c) => overallKey(table.get(c))
  const byOverall = codes.slice().sort((x, y) => keyCmp(keyOf(x), keyOf(y)))
  const orderedCodes = []
  forEachTieBlock(byOverall, keyOf, (block) => {
    if (block.length === 1) orderedCodes.push(block[0])
    else orderedCodes.push(...breakTie(block, matches, rng))
  })
  return orderedCodes.map((c) => table.get(c))
}

/**
 * Rank the third-placed teams best→worst. They never met, so head-to-head does
 * not apply: they are ranked on the overall key, ties going to lots. The caller
 * takes the top eight as the best-third qualifiers.
 */
export function rankThirdPlaced(thirds, rng) {
  const keyOf = (p) => overallKey(p.record)
  const byOverall = thirds.slice().sort((p, q) => keyCmp(keyOf(p), keyOf(q)))
  const ordered = []
  forEachTieBlock(byOverall, keyOf, (block) => {
    if (block.length > 1) shuffle(block, rng)
    ordered.push(...block)
  })
  return ordered
}

/* ------------------------------------------------------ knockout bracket -- */

// The real, published Round-of-32 schedule (Matches 73–88). Each side is
// ['W', group] winner, ['R', group] runner-up, or ['T', slot] a third-placed
// team assigned to that slot.
export const ROUND_OF_32 = [
  [['R', 'A'], ['R', 'B']], // 73
  [['W', 'E'], ['T', '1E']], // 74
  [['W', 'F'], ['R', 'C']], // 75
  [['W', 'C'], ['R', 'F']], // 76
  [['W', 'I'], ['T', '1I']], // 77
  [['R', 'E'], ['R', 'I']], // 78
  [['W', 'A'], ['T', '1A']], // 79
  [['W', 'L'], ['T', '1L']], // 80
  [['W', 'D'], ['T', '1D']], // 81
  [['W', 'G'], ['T', '1G']], // 82
  [['R', 'K'], ['R', 'L']], // 83
  [['W', 'H'], ['R', 'J']], // 84
  [['W', 'B'], ['T', '1B']], // 85
  [['W', 'J'], ['R', 'H']], // 86
  [['W', 'K'], ['T', '1K']], // 87
  [['R', 'D'], ['R', 'G']], // 88
]

// Real per-slot eligibility: which groups' third-placed teams may fill each of
// the eight "winner vs third" slots.
export const THIRD_SLOT_ELIGIBILITY = {
  '1A': new Set('CEFHI'),
  '1B': new Set('EFGIJ'),
  '1D': new Set('BEFIJ'),
  '1E': new Set('ABCDF'),
  '1G': new Set('AEHIJ'),
  '1I': new Set('CDFGH'),
  '1K': new Set('DEIJL'),
  '1L': new Set('EHIJK'),
}
const THIRD_SLOTS = ['1A', '1B', '1D', '1E', '1G', '1I', '1K', '1L']

// How later rounds pair the winners of earlier matches (indices into the
// previous round's match list, in the real bracket's order).
const ROUND_OF_16_PAIRS = [[1, 4], [0, 2], [3, 5], [6, 7], [10, 11], [8, 9], [13, 15], [12, 14]]
const QUARTER_FINAL_PAIRS = [[0, 1], [4, 5], [2, 3], [6, 7]]
const SEMI_FINAL_PAIRS = [[0, 1], [2, 3]]

/**
 * Assign the eight qualifying third-place groups to the eight bracket slots,
 * honouring the real per-slot eligibility. FIFA's full 495-row table is
 * impractical to bundle, so a deterministic constraint solver (fixed slot/group
 * order) picks a valid assignment — a documented simplification, correct
 * constraints. Returns `{ slot: group }`.
 */
export function allocateThirds(qualifyingGroups) {
  if (qualifyingGroups.length !== THIRD_SLOTS.length) {
    throw new Error(`expected ${THIRD_SLOTS.length} qualifying third-place groups`)
  }
  const groups = qualifyingGroups.slice().sort()
  const assignment = {}
  const used = new Set()

  const solve = (slotIndex) => {
    if (slotIndex === THIRD_SLOTS.length) return true
    const slot = THIRD_SLOTS[slotIndex]
    for (const group of groups) {
      if (used.has(group) || !THIRD_SLOT_ELIGIBILITY[slot].has(group)) continue
      assignment[slot] = group
      used.add(group)
      if (solve(slotIndex + 1)) return true
      used.delete(group)
      delete assignment[slot]
    }
    return false
  }

  if (!solve(0)) throw new Error('no valid third-place allocation')
  return assignment
}

/** Resolve the Round-of-32 slot schedule into 16 concrete `[a, b]` code pairs. */
export function buildRoundOf32(winners, runnersUp, thirdsByGroup) {
  const slotToGroup = allocateThirds(Object.keys(thirdsByGroup))
  const slotToCode = {}
  for (const [slot, group] of Object.entries(slotToGroup)) slotToCode[slot] = thirdsByGroup[group]

  const resolve = ([kind, key]) => {
    if (kind === 'W') return winners[key]
    if (kind === 'R') return runnersUp[key]
    return slotToCode[key] // 'T'
  }
  return ROUND_OF_32.map(([a, b]) => [resolve(a), resolve(b)])
}

// Play one knockout tie: a seeded scoreline, decided on penalties if drawn.
function playKnockoutMatch(a, b, roundName, rng) {
  const [goalsA, goalsB] = simulateScoreline(teamElo(a), teamElo(b), rng)
  let winner
  let decidedOn
  if (goalsA !== goalsB) {
    winner = goalsA > goalsB ? a : b
    decidedOn = 'regulation'
  } else {
    winner = knockoutWinnerIsA(teamElo(a), teamElo(b), rng) ? a : b
    decidedOn = 'penalties'
  }
  return { round: roundName, a, b, goalsA, goalsB, winner, loser: winner === a ? b : a, decidedOn }
}

function playRound(pairs, roundName, rng) {
  return pairs.map(([a, b]) => playKnockoutMatch(a, b, roundName, rng))
}

/** Play the whole bracket from the Round of 32 down to the champion. */
export function simulateKnockout(roundOf32, rng) {
  const r32 = playRound(roundOf32, 'Round of 32', rng)
  const r16 = playRound(ROUND_OF_16_PAIRS.map(([i, j]) => [r32[i].winner, r32[j].winner]), 'Round of 16', rng)
  const qf = playRound(QUARTER_FINAL_PAIRS.map(([i, j]) => [r16[i].winner, r16[j].winner]), 'Quarter-final', rng)
  const sf = playRound(SEMI_FINAL_PAIRS.map(([i, j]) => [qf[i].winner, qf[j].winner]), 'Semi-final', rng)
  // Third-place play-off is played before the final, matching the engine's order.
  const thirdPlace = playKnockoutMatch(sf[0].loser, sf[1].loser, 'Third-place play-off', rng)
  const final = playKnockoutMatch(sf[0].winner, sf[1].winner, 'Final', rng)
  return {
    champion: final.winner,
    runnerUp: final.loser,
    finalists: [final.a, final.b], // both reached the final
    third: thirdPlace.winner,
    fourth: thirdPlace.loser,
  }
}

/* -------------------------------------------------- a full tournament run -- */

/** Every pairing in a group, fixed order (4 teams → 6 matches). */
function roundRobin(codes) {
  const out = []
  for (let i = 0; i < codes.length; i++) for (let j = i + 1; j < codes.length; j++) out.push([codes[i], codes[j]])
  return out
}

// Number of best third-placed teams that also advance to the Round of 32.
export const BEST_THIRDS = 8

/**
 * Play one whole tournament over a FIXED drawn set of groups: the group stage
 * (every match sampled from Elo), rank the groups and the eight best thirds,
 * resolve the real Round-of-32 bracket, then play it to a champion. Returns the
 * champion, runner-up and the two finalists. Reproducible under the injected rng.
 */
export function playTournament(groups, rng) {
  const labels = Object.keys(groups)
  const groupOrder = {}
  const thirds = []

  for (const label of labels) {
    const codes = groups[label].map((t) => t.code)
    const matches = []
    for (const [a, b] of roundRobin(codes)) {
      const [goalsA, goalsB] = simulateScoreline(teamElo(a), teamElo(b), rng)
      matches.push({ a, b, goalsA, goalsB })
    }
    const ordered = orderGroup(codes, matches, rng)
    groupOrder[label] = ordered.map((r) => r.code)
    thirds.push({ label, record: ordered[2] })
  }

  const ranked = rankThirdPlaced(thirds, rng)
  const bestThirds = new Set(ranked.slice(0, BEST_THIRDS).map((p) => p.record.code))

  const winners = {}
  const runnersUp = {}
  const thirdsByGroup = {}
  for (const label of labels) {
    winners[label] = groupOrder[label][0]
    runnersUp[label] = groupOrder[label][1]
    const thirdCode = groupOrder[label][2]
    if (bestThirds.has(thirdCode)) thirdsByGroup[label] = thirdCode
  }

  const roundOf32 = buildRoundOf32(winners, runnersUp, thirdsByGroup)
  const ko = simulateKnockout(roundOf32, rng)
  return { groupOrder, champion: ko.champion, runnerUp: ko.runnerUp, finalists: ko.finalists }
}

/* ------------------------------------------------------------ RNG + Monte -- */

/** Build a seeded PRNG from a human-friendly text seed (text → hash → mulberry32). */
export function makeRng(seed) {
  return mulberry32(hashSeed(String(seed)))
}

/**
 * Draw the groups AND play one tournament from a fresh seeded rng. Convenience
 * for a single run / testing — the Monte Carlo instead draws once then replays
 * `playTournament` many times over the fixed groups (see the worker).
 */
export function simulateTournament(rng, { realHosts = true } = {}) {
  const groups = drawGroups(TEAMS, rng, realHosts)
  return { groups, ...playTournament(groups, rng) }
}

/** A fresh tally object: per team, how many runs it won / reached the final. */
export function emptyCounts() {
  const counts = {}
  for (const t of TEAMS) counts[t.code] = { champion: 0, final: 0 }
  return counts
}

/**
 * Turn raw Monte Carlo counts into a table row per team, sorted by title
 * probability (then Elo) — the shape the results table renders. `done` is how
 * many tournaments have been played so far (the denominator for the %).
 */
export function buildResults(counts, done) {
  const rows = TEAMS.map((t) => {
    const c = counts[t.code] || { champion: 0, final: 0 }
    return {
      code: t.code,
      name: t.name,
      confederation: t.confederation,
      pot: t.pot,
      elo: t.elo,
      titles: c.champion,
      finals: c.final,
      titlePct: done > 0 ? (c.champion / done) * 100 : 0,
      finalPct: done > 0 ? (c.final / done) * 100 : 0,
    }
  })
  rows.sort((a, b) => b.titlePct - a.titlePct || b.finalPct - a.finalPct || b.elo - a.elo)
  return rows
}

/** Teams sorted by Elo (the pre-run ranking shown before any simulation). */
export function teamsByRating() {
  return TEAMS.slice().sort((a, b) => b.elo - a.elo)
}
