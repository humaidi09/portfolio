import { drawGroups, emptyCounts, makeRng, playTournament, TEAMS } from '../lib/demos/worldcup'

// Keep the Monte Carlo work off the main thread so the interface stays smooth.
self.onmessage = ({ data }) => {
  const iterations = Math.max(200, Math.min(20000, Math.round(Number(data?.iterations) || 1000)))
  try {
    const rng = makeRng(data?.seed || '2026')
    const groups = drawGroups(TEAMS, rng, data?.realHosts !== false)
    const counts = emptyCounts()
    const step = Math.max(1, Math.floor(iterations / 40))

    for (let done = 1; done <= iterations; done += 1) {
      const { champion, finalists } = playTournament(groups, rng)
      counts[champion].champion += 1
      finalists.forEach((code) => { counts[code].final += 1 })
      if (done % step === 0 && done !== iterations) self.postMessage({ type: 'progress', done, total: iterations, counts })
    }
    self.postMessage({ type: 'done', done: iterations, total: iterations, counts })
  } catch (error) {
    self.postMessage({ type: 'error', message: error?.message || 'Simulation failed.' })
  }
}
