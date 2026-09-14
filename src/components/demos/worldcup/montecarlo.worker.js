// Monte Carlo worker for the World Cup 2026 demo.
//
// Runs the heavy simulation off the main thread so the UI never freezes. It
// receives { iterations, seed, realHosts }, then:
//
//   1. Builds one seeded PRNG from the text seed (text → hash → mulberry32).
//   2. Draws the 12 groups ONCE from that stream — the same draw the UI shows,
//      because it derives from the same seed. The draw is then held FIXED across
//      every trial (faithful to the engine's `predict`: only the matches are
//      re-sampled, so "reach the final" is meaningful for this bracket).
//   3. Plays `iterations` full tournaments over that fixed draw, tallying how
//      often each nation wins the title and reaches the final.
//
// It posts periodic { type:'progress', done, total, counts } so the table and
// bar animate live, and a final { type:'done', ... }. Cancel is handled by the
// component terminating the worker.

import { drawGroups, playTournament, emptyCounts, makeRng, TEAMS } from '../../../lib/demos/worldcup'

self.onmessage = (event) => {
  const { iterations, seed, realHosts = true } = event.data || {}
  const total = Math.max(1, Math.floor(iterations) || 0)

  try {
    const rng = makeRng(seed)
    // Consume the stream to draw the groups, then keep drawing from it per trial.
    const groups = drawGroups(TEAMS, rng, realHosts)
    const counts = emptyCounts()

    // Post ~60 progress updates over the run, so the UI is smooth but not flooded.
    const step = Math.max(1, Math.floor(total / 60))

    for (let done = 1; done <= total; done++) {
      const { champion, finalists } = playTournament(groups, rng)
      counts[champion].champion += 1
      for (const code of finalists) counts[code].final += 1

      if (done % step === 0 && done !== total) {
        self.postMessage({ type: 'progress', done, total, counts })
      }
    }

    self.postMessage({ type: 'done', done: total, total, counts })
  } catch (error) {
    self.postMessage({ type: 'error', message: error?.message || String(error) })
  }
}
