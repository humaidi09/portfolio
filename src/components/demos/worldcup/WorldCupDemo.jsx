import { useEffect, useMemo, useRef, useState } from 'react'
import { Play, Square, Loader2, Trophy, Shuffle } from 'lucide-react'
import { Badge, Button, Callout, Field, NumberInput, Panel, Select, Stat, TextInput, Toolbar } from '../ui/kit'
import {
  GROUP_LABELS,
  PROVENANCE,
  TEAMS,
  buildResults,
  drawGroups,
  makeRng,
  teamsByRating,
} from '../../../lib/demos/worldcup'

/**
 * World Cup 2026 Simulator — live port. The real repo draws the 48-team field
 * into 12 groups and turns published Elo ratings into title odds by Monte Carlo
 * (see lib/demos/worldcup.js). Here the heavy part — thousands of full
 * tournaments — runs in a Web Worker so the UI never freezes; the component
 * only draws the seeded groups, kicks off the run, and renders the odds table.
 * Opens on a seeded draw + the Elo ranking so the page is never empty, but the
 * simulation itself waits for the user to press Run.
 */

const MIN_ITERS = 200
const MAX_ITERS = 20000
const DEFAULT_ITERS = 5000
const PRESETS = [1000, 5000, 10000, 20000]

const clampIters = (v) => {
  const n = Math.round(Number(v))
  if (!Number.isFinite(n)) return DEFAULT_ITERS
  return Math.min(MAX_ITERS, Math.max(MIN_ITERS, n))
}

const fmtInt = (n) => n.toLocaleString('en-US')
const fmtPct = (n) => `${n.toFixed(1)}%`

export default function WorldCupDemo() {
  const [seed, setSeed] = useState('2026')
  const [iterations, setIterations] = useState(String(DEFAULT_ITERS))
  const [drawMode, setDrawMode] = useState('real') // 'real' = fix MEX/CAN/USA, 'random' = free draw

  // Run state, driven by the worker's messages.
  const [phase, setPhase] = useState('idle') // 'idle' | 'running' | 'done' | 'error'
  const [cancelled, setCancelled] = useState(false)
  const [counts, setCounts] = useState(null) // raw {code:{champion,final}} from the worker
  const [done, setDone] = useState(0)
  const [total, setTotal] = useState(0)
  const [error, setError] = useState(null)

  const workerRef = useRef(null)

  /* --- the seeded draw shown on open ---------------------------------- */
  // Derived from the same seed the worker uses, so what's shown IS what's
  // simulated. Recomputed (and the run reset) whenever the seed or mode changes.
  const { draw, drawError } = useMemo(() => {
    try {
      return { draw: drawGroups(TEAMS, makeRng(seed), drawMode === 'real'), drawError: null }
    } catch (e) {
      return { draw: null, drawError: e.message }
    }
  }, [seed, drawMode])

  // The pre-run ranking: every team by Elo, shown until a Monte Carlo run fills
  // in real title odds.
  const preRunRows = useMemo(() => teamsByRating(), [])

  const resultRows = useMemo(() => (counts ? buildResults(counts, done) : null), [counts, done])
  const rows = resultRows ?? preRunRows
  const hasOdds = resultRows != null && done > 0
  const maxTitle = hasOdds ? Math.max(...resultRows.map((r) => r.titlePct), 0.0001) : 1
  const favourite = rows[0]

  const progressPct = total > 0 ? (done / total) * 100 : 0

  /* --- worker lifecycle ----------------------------------------------- */
  const stopWorker = () => {
    if (workerRef.current) {
      workerRef.current.terminate()
      workerRef.current = null
    }
  }

  // Clear a finished/running run — used when the seed or draw changes, since a
  // new draw invalidates the old odds.
  const resetRun = () => {
    stopWorker()
    setPhase('idle')
    setCancelled(false)
    setCounts(null)
    setDone(0)
    setTotal(0)
    setError(null)
  }

  // Terminate the worker if the component unmounts mid-run.
  useEffect(() => stopWorker, [])

  const run = () => {
    const n = clampIters(iterations)
    setIterations(String(n))
    stopWorker()
    setPhase('running')
    setCancelled(false)
    setError(null)
    setCounts(null)
    setDone(0)
    setTotal(n)

    const worker = new Worker(new URL('./montecarlo.worker.js', import.meta.url), { type: 'module' })
    worker.onmessage = (event) => {
      const msg = event.data
      if (msg.type === 'progress') {
        setDone(msg.done)
        setCounts(msg.counts)
      } else if (msg.type === 'done') {
        setDone(msg.done)
        setCounts(msg.counts)
        setPhase('done')
        stopWorker()
      } else if (msg.type === 'error') {
        setError(msg.message)
        setPhase('error')
        stopWorker()
      }
    }
    worker.onerror = (event) => {
      setError(event.message || 'the worker crashed')
      setPhase('error')
      stopWorker()
    }
    workerRef.current = worker
    worker.postMessage({ iterations: n, seed, realHosts: drawMode === 'real' })
  }

  const cancel = () => {
    stopWorker()
    setCancelled(true)
    setPhase('done') // keep whatever partial tallies arrived
  }

  const changeSeed = (v) => {
    setSeed(v)
    resetRun()
  }
  const changeMode = (v) => {
    setDrawMode(v)
    resetRun()
  }

  const statusText =
    phase === 'running'
      ? 'Simulating tournaments…'
      : phase === 'error'
        ? 'Run failed'
        : cancelled
          ? `Cancelled at ${fmtInt(done)}`
          : 'Complete'

  return (
    <div className="space-y-6">
      {/* ---------------------------------------------------- control panel */}
      <Panel
        eyebrow="// monte carlo"
        title="Run the simulation"
        actions={<Badge tone="neutral">{TEAMS.length} real teams</Badge>}
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Iterations" hint={`${fmtInt(MIN_ITERS)}–${fmtInt(MAX_ITERS)}`}>
            <NumberInput
              aria-label="Number of tournaments to simulate"
              min={MIN_ITERS}
              max={MAX_ITERS}
              step={100}
              value={iterations}
              onChange={(e) => setIterations(e.target.value)}
            />
          </Field>
          <Field label="Random seed" hint="reproducible">
            <TextInput
              aria-label="Random seed"
              placeholder="e.g. 2026"
              value={seed}
              onChange={(e) => changeSeed(e.target.value)}
            />
          </Field>
          <Field label="Group draw" hint="host placement">
            <Select aria-label="Group draw mode" value={drawMode} onChange={(e) => changeMode(e.target.value)}>
              <option value="real">Real hosts (MEX·CAN·USA)</option>
              <option value="random">Fully random draw</option>
            </Select>
          </Field>
        </div>

        <Toolbar className="mt-4 justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 font-mono text-[10px] uppercase tracking-wider text-muted">presets</span>
            {PRESETS.map((p) => {
              const active = clampIters(iterations) === p
              return (
                <Button
                  key={p}
                  variant="ghost"
                  size="sm"
                  className={active ? 'border-neonCyan/45 text-neonCyan' : ''}
                  onClick={() => setIterations(String(p))}
                >
                  {p >= 1000 ? `${p / 1000}k` : p}
                </Button>
              )
            })}
          </div>
          <div className="flex items-center gap-2">
            {phase === 'running' ? (
              <Button variant="danger" onClick={cancel}>
                <Square className="h-4 w-4" />
                Cancel
              </Button>
            ) : (
              <Button variant="primary" onClick={run} disabled={!draw}>
                <Play className="h-4 w-4" />
                Run
              </Button>
            )}
          </div>
        </Toolbar>

        {/* Progress bar — only once a run has started. */}
        {total > 0 && (
          <div className="mt-4 space-y-2">
            <div className="h-2 w-full overflow-hidden rounded-full bg-fill">
              <div
                className="h-full rounded-full bg-neonCyan transition-[width] duration-150 ease-out"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div className="flex items-center justify-between font-mono text-[11px] text-muted">
              <span className="flex items-center gap-1.5">
                {phase === 'running' && <Loader2 className="h-3 w-3 animate-spin text-neonCyan" />}
                {statusText}
              </span>
              <span className="tabular-nums">
                {fmtInt(done)} / {fmtInt(total)}
              </span>
            </div>
          </div>
        )}

        {error && (
          <Callout tone="bad" title="Simulation error" className="mt-4">
            {error}
          </Callout>
        )}
      </Panel>

      {/* ------------------------------------------------ odds + explainer */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* main column: headline + odds table */}
        <div className="space-y-4">
          {hasOdds ? (
            <Stat
              label="Predicted champion"
              value={fmtPct(favourite.titlePct)}
              sub={`${favourite.name} · ${fmtInt(done)} tournament${done === 1 ? '' : 's'}${cancelled ? ' (cancelled)' : ''}`}
              accent
            />
          ) : (
            <Stat
              label="Title favourite · by Elo"
              value={String(favourite.elo)}
              sub={`${favourite.name} — press Run for Monte Carlo odds`}
              accent
            />
          )}

          <Panel
            eyebrow="// title odds"
            title="Championship probability"
            actions={<Badge tone={hasOdds ? 'accent' : 'neutral'}>{hasOdds ? `${fmtInt(done)} sims` : 'not run yet'}</Badge>}
            bodyClass="p-0"
          >
            <div className="max-h-[30rem] overflow-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10 bg-void/85 backdrop-blur">
                  <tr className="border-b border-hair font-mono text-[10px] uppercase tracking-wider text-muted">
                    <th className="w-8 px-3 py-2 text-left font-medium">#</th>
                    <th className="px-3 py-2 text-left font-medium">Team</th>
                    <th className="hidden px-3 py-2 text-right font-medium sm:table-cell">Rating</th>
                    <th className="px-3 py-2 text-right font-medium">Title</th>
                    <th className="hidden px-3 py-2 text-right font-medium md:table-cell">Final</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hair">
                  {rows.map((r, i) => (
                    <tr key={r.code} className={i === 0 && hasOdds ? 'bg-neonCyan/[0.04]' : undefined}>
                      <td className="px-3 py-2 font-mono text-xs tabular-nums text-muted">{i + 1}</td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-ink">{r.name}</span>
                          <span className="font-mono text-[10px] text-muted">{r.code}</span>
                        </div>
                      </td>
                      <td className="hidden px-3 py-2 text-right font-mono tabular-nums text-muted sm:table-cell">
                        {r.elo}
                      </td>
                      <td className="px-3 py-2 text-right">
                        {hasOdds ? (
                          <div className="flex items-center justify-end gap-2">
                            <span className="hidden h-1.5 w-16 overflow-hidden rounded-full bg-fill sm:block">
                              <span
                                className={`block h-full rounded-full ${i === 0 ? 'bg-neonCyan/80' : 'bg-ink/20'}`}
                                style={{ width: `${(r.titlePct / maxTitle) * 100}%` }}
                              />
                            </span>
                            <span
                              className={`font-mono tabular-nums ${i === 0 ? 'font-semibold text-neonCyan' : 'text-ink'}`}
                            >
                              {fmtPct(r.titlePct)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                      <td className="hidden px-3 py-2 text-right font-mono tabular-nums text-muted md:table-cell">
                        {hasOdds ? fmtPct(r.finalPct) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>

        {/* sidebar: how it works + provenance */}
        <div className="space-y-4">
          <Callout tone="info" title="How the odds are computed">
            Each match samples goals from the two teams’ Elo gap
            <span className="mx-1 rounded bg-void/40 px-1.5 py-0.5 font-mono text-xs text-ink">
              Eₐ = 1 / (1 + 10^((R_b−R_a)/400))
            </span>
            via independent Poisson counts; a level knockout tie is settled by an Elo-weighted coin flip. The seeded draw
            is held fixed while <span className="text-ink">{fmtInt(clampIters(iterations))}</span> full tournaments are
            replayed, and each nation’s title share is tallied.
          </Callout>

          <Callout tone="warn" title="It’s a prediction">
            Every figure is modelled from ratings, not a claim of fact. The same seed always reproduces the same run.
          </Callout>

          <Panel eyebrow="// provenance" bodyClass="space-y-1.5">
            <div className="flex items-center justify-between gap-2 text-sm">
              <span className="text-muted">Elo source</span>
              <span className="text-ink">{PROVENANCE.eloSource.split(' (')[0]}</span>
            </div>
            <div className="flex items-center justify-between gap-2 text-sm">
              <span className="text-muted">Snapshot</span>
              <span className="font-mono tabular-nums text-ink">{PROVENANCE.eloAsOf}</span>
            </div>
            <div className="flex items-center justify-between gap-2 text-sm">
              <span className="text-muted">Format</span>
              <span className="text-ink">48 → 12 groups → R32</span>
            </div>
          </Panel>
        </div>
      </div>

      {/* ------------------------------------------------------ group draw */}
      <Panel
        eyebrow="// seeded draw"
        title="The group draw"
        actions={
          <Badge tone="neutral">
            <Shuffle className="mr-1 h-3 w-3" />
            seed: {seed || '∅'}
          </Badge>
        }
      >
        {drawError ? (
          <Callout tone="bad" title="Draw failed">
            {drawError}
          </Callout>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {GROUP_LABELS.map((label) => {
              const members = draw[label]
              const hasHost = members.some((t) => t.host)
              return (
                <div key={label} className="rounded-xl border border-hair bg-void/20">
                  <div className="flex items-center justify-between border-b border-hair px-3 py-2">
                    <span className="font-mono text-xs font-semibold text-ink">Group {label}</span>
                    {hasHost && (
                      <span className="inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider text-neonCyan">
                        <Trophy className="h-3 w-3" />
                        host
                      </span>
                    )}
                  </div>
                  <ul className="divide-y divide-hair/60">
                    {members.map((t) => (
                      <li
                        key={t.code}
                        className="flex items-center justify-between gap-2 px-3 py-1.5 text-xs"
                      >
                        <span className="flex min-w-0 items-center gap-1.5">
                          <span className="font-mono text-[9px] text-muted">P{t.pot}</span>
                          <span className="truncate text-ink">{t.name}</span>
                          {t.host && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-neonCyan" title="Host nation" />}
                        </span>
                        <span className="font-mono tabular-nums text-muted">{t.elo}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        )}
      </Panel>
    </div>
  )
}
