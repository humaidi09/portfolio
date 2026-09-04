/**
 * Competitive-programming stats, fetched live in the browser.
 *
 * Codeforces and AtCoder both expose CORS-friendly JSON, so we can read a
 * handle's real rating, the problems they've solved, and the day-by-day
 * activity that drives the contribution heatmap — no backend needed. LeetCode
 * and CodeChef have no browser-readable API, so those are handled as plain
 * profile links in the UI (see portfolioData.js → competitiveProgramming).
 *
 * Everything here is pure fetch + reduce: each `fetch*` returns a normalized
 * shape the section renders directly:
 *   { handle, rating, maxRating, rank, maxRank, tierColor,
 *     solved: { total, year, month },
 *     streak: { all, year, month },   // longest run of consecutive days
 *     daily: { 'YYYY-MM-DD': count } } // distinct problems first solved that day
 */

const DAY_MS = 86400000
const DAY_SEC = 86400

/** Local calendar-day key (YYYY-MM-DD) for a unix-seconds timestamp. */
function dayKey(epochSec) {
  const d = new Date(epochSec * 1000)
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

/** Integer day number (UTC-anchored) so streak math is DST-proof. */
function dayIndex(key) {
  return Math.floor(Date.parse(`${key}T00:00:00Z`) / DAY_MS)
}

/** Longest run of consecutive active days, optionally only on/after `sinceIdx`. */
function longestStreak(dayKeys, sinceIdx = -Infinity) {
  const idxs = dayKeys
    .map(dayIndex)
    .filter((i) => i >= sinceIdx)
    .sort((a, b) => a - b)
  let best = 0
  let run = 0
  let prev = null
  for (const i of idxs) {
    run = prev !== null && i === prev + 1 ? run + 1 : 1
    if (run > best) best = run
    prev = i
  }
  return best
}

/**
 * Fold a map of `problemKey → earliest-solve-epoch` into the normalized shape.
 * Counts each problem once, on the day it was first solved.
 */
function summarize(base, firstSolve) {
  const nowSec = Math.floor(Date.now() / 1000)
  const yearAgo = nowSec - 365 * DAY_SEC
  const monthAgo = nowSec - 30 * DAY_SEC
  const nowIdx = Math.floor(nowSec / DAY_SEC)

  const daily = {}
  let total = 0
  let year = 0
  let month = 0
  for (const t of firstSolve.values()) {
    const key = dayKey(t)
    daily[key] = (daily[key] || 0) + 1
    total += 1
    if (t >= yearAgo) year += 1
    if (t >= monthAgo) month += 1
  }
  const days = Object.keys(daily)

  return {
    ...base,
    solved: { total, year, month },
    streak: {
      all: longestStreak(days),
      year: longestStreak(days, nowIdx - 365),
      month: longestStreak(days, nowIdx - 30),
    },
    daily,
  }
}

/* ---- Rating-tier colors (readable on the black surface) ---- */

export function cfTierColor(rating) {
  if (rating == null) return '#9aa0a6'
  if (rating < 1200) return '#9aa0a6' // newbie — gray
  if (rating < 1400) return '#3fae3f' // pupil — green
  if (rating < 1600) return '#29c0bd' // specialist — cyan
  if (rating < 1900) return '#5c7cff' // expert — blue
  if (rating < 2100) return '#c072d6' // candidate master — violet
  if (rating < 2400) return '#f0a92b' // master — orange
  return '#ff5d5d' // grandmaster+ — red
}

export function atcoderTierColor(rating) {
  if (rating == null) return '#9aa0a6'
  if (rating < 400) return '#9aa0a6' // gray
  if (rating < 800) return '#b07a4f' // brown
  if (rating < 1200) return '#3fae3f' // green
  if (rating < 1600) return '#29c0bd' // cyan
  if (rating < 2000) return '#5c7cff' // blue
  if (rating < 2400) return '#e0c14a' // yellow
  if (rating < 2800) return '#f0a92b' // orange
  return '#ff5d5d' // red
}

/* ---- Codeforces (official API — CORS-enabled) ---- */

export async function fetchCodeforces(handle) {
  const [infoRes, statusRes] = await Promise.all([
    fetch(`https://codeforces.com/api/user.info?handles=${encodeURIComponent(handle)}`),
    fetch(`https://codeforces.com/api/user.status?handle=${encodeURIComponent(handle)}`),
  ])
  const info = await infoRes.json()
  if (info.status !== 'OK' || !info.result?.length) {
    throw new Error(info.comment || 'Codeforces handle not found')
  }
  const status = await statusRes.json()
  const subs = status.status === 'OK' ? status.result : []

  const firstSolve = new Map()
  for (const s of subs) {
    if (s.verdict !== 'OK' || !s.problem) continue
    const key = `${s.problem.contestId ?? 'x'}-${s.problem.index}`
    const t = s.creationTimeSeconds
    const prev = firstSolve.get(key)
    if (prev === undefined || t < prev) firstSolve.set(key, t)
  }

  const u = info.result[0]
  return summarize(
    {
      handle: u.handle,
      rating: u.rating,
      maxRating: u.maxRating,
      rank: u.rank,
      maxRank: u.maxRank,
      tierColor: cfTierColor(u.rating),
    },
    firstSolve,
  )
}

/* ---- AtCoder (kenkoooo mirror for submissions; official history for rating) ---- */

// The v3 submissions endpoint returns at most 500 rows per call, so page
// through it with `from_second` until a short page comes back.
async function atcoderSubmissions(handle) {
  const all = []
  let from = 0
  for (let page = 0; page < 40; page += 1) {
    const res = await fetch(
      `https://kenkoooo.com/atcoder/atcoder-api/v3/user/submissions?user=${encodeURIComponent(
        handle,
      )}&from_second=${from}`,
    )
    const rows = await res.json()
    if (!Array.isArray(rows) || rows.length === 0) break
    all.push(...rows)
    if (rows.length < 500) break
    from = rows[rows.length - 1].epoch_second + 1
  }
  return all
}

export async function fetchAtCoder(handle) {
  const subs = await atcoderSubmissions(handle)
  if (!Array.isArray(subs)) throw new Error('AtCoder handle not found')

  const firstSolve = new Map()
  for (const s of subs) {
    if (s.result !== 'AC') continue
    const key = s.problem_id
    const t = s.epoch_second
    const prev = firstSolve.get(key)
    if (prev === undefined || t < prev) firstSolve.set(key, t)
  }
  if (firstSolve.size === 0 && subs.length === 0) {
    throw new Error('No AtCoder submissions found for this handle')
  }

  // AtCoder's rating history endpoint isn't CORS-open, and kenkoooo doesn't
  // serve a rating, so the AtCoder card leads with problems solved (its
  // heatmap and streaks are the real story anyway).
  return summarize({ handle, rating: undefined, maxRating: undefined, rank: undefined, tierColor: atcoderTierColor() }, firstSolve)
}

/* ---- Cached entry point ---- */

// Cache resolved promises per handle so re-renders (and React's dev-mode double
// effect) don't refetch. Rejections are evicted so a retry can succeed.
const cache = new Map()

export function getCpStats(source, handle) {
  const cacheKey = `${source}:${handle}`
  if (!cache.has(cacheKey)) {
    const run = source === 'codeforces' ? fetchCodeforces : fetchAtCoder
    const promise = run(handle).catch((err) => {
      cache.delete(cacheKey)
      throw err
    })
    cache.set(cacheKey, promise)
  }
  return cache.get(cacheKey)
}
