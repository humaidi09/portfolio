import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, Play, RotateCcw, Trophy } from 'lucide-react'
import { Link } from '../lib/router'
import { buildResults, drawGroups, GROUP_LABELS, makeRng, PROVENANCE, TEAMS, teamsByRating } from '../lib/demos/worldcup'
import { GithubIcon } from './ui/BrandIcons'

const clamp = (value) => Math.max(200, Math.min(20000, Math.round(Number(value) || 1000)))
const format = (value) => Number(value).toLocaleString('en-US')

/** A real, in-browser port of the World Cup prediction engine. */
export default function WorldCupApp() {
  const [seed, setSeed] = useState('2026')
  const [iterations, setIterations] = useState('1000')
  const [realHosts, setRealHosts] = useState(true)
  const [run, setRun] = useState({ phase: 'idle', done: 0, total: 0, counts: null, error: '' })
  const workerRef = useRef(null)

  const draw = useMemo(() => {
    try {
      return { groups: drawGroups(TEAMS, makeRng(seed), realHosts), error: '' }
    } catch (error) {
      return { groups: null, error: error.message }
    }
  }, [seed, realHosts])

  const rows = run.counts ? buildResults(run.counts, run.done) : teamsByRating()
  const top = rows[0]
  const progress = run.total ? (run.done / run.total) * 100 : 0

  const stop = () => {
    workerRef.current?.terminate()
    workerRef.current = null
    setRun((current) => current.phase === 'running' ? { ...current, phase: 'idle' } : current)
  }
  useEffect(() => () => workerRef.current?.terminate(), [])
  useEffect(() => {
    workerRef.current?.terminate()
    workerRef.current = null
    setRun({ phase: 'idle', done: 0, total: 0, counts: null, error: '' })
  }, [seed, realHosts])

  const start = () => {
    const total = clamp(iterations)
    setIterations(String(total))
    workerRef.current?.terminate()
    setRun({ phase: 'running', done: 0, total, counts: null, error: '' })
    const worker = new Worker(new URL('../workers/worldcup.worker.js', import.meta.url), { type: 'module' })
    workerRef.current = worker
    worker.onmessage = ({ data }) => {
      if (data.type === 'progress') setRun({ phase: 'running', done: data.done, total: data.total, counts: data.counts, error: '' })
      if (data.type === 'done') { setRun({ phase: 'done', done: data.done, total: data.total, counts: data.counts, error: '' }); worker.terminate(); workerRef.current = null }
      if (data.type === 'error') { setRun({ phase: 'error', done: 0, total: 0, counts: null, error: data.message }); worker.terminate(); workerRef.current = null }
    }
    worker.postMessage({ iterations: total, seed, realHosts })
  }

  return (
    <section className="relative mx-auto max-w-6xl px-4 pb-20 pt-28 sm:px-6 sm:pt-32">
      <Link to="/apps" className="inline-flex items-center gap-2 font-mono text-xs text-muted transition-colors hover:text-neonCyan"><ArrowLeft className="h-3.5 w-3.5" />All apps</Link>
      <div className="mt-5 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div className="max-w-3xl"><p className="eyebrow">// World Cup 2026</p><h1 className="mt-3 text-4xl font-semibold text-ink sm:text-5xl">Simulation & prediction engine</h1><p className="mt-4 leading-relaxed text-muted">A 48-team, rule-aware World Cup simulation. The draw uses real pots and confederation constraints; title odds come from repeated Elo-based tournaments, run locally in your browser.</p></div>
        <a href="https://github.com/humaidi09/World-Cup-2026" target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-hair bg-fill px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:border-neonCyan/50 hover:text-neonCyan"><GithubIcon className="h-4 w-4" />Source code</a>
      </div>

      <div className="mt-9 grid gap-5 lg:grid-cols-[0.95fr_1.45fr]">
        <aside className="glass rounded-2xl border border-hair p-5 sm:p-6">
          <div className="flex items-center justify-between"><p className="font-mono text-xs text-muted">// simulation controls</p><span className="rounded-full border border-neonCyan/25 bg-neonCyan/10 px-2 py-1 font-mono text-[10px] text-neonCyan">{TEAMS.length} teams</span></div>
          <label className="mt-6 block font-mono text-xs text-muted">Iterations <span className="text-muted/60">(200–20,000)</span><input type="number" min="200" max="20000" step="100" value={iterations} onChange={(event) => setIterations(event.target.value)} className="mt-2 w-full rounded-xl border border-hair bg-fill px-3 py-2.5 text-sm text-ink outline-none transition-colors focus:border-neonCyan/60" /></label>
          <label className="mt-4 block font-mono text-xs text-muted">Random seed<input value={seed} onChange={(event) => setSeed(event.target.value)} className="mt-2 w-full rounded-xl border border-hair bg-fill px-3 py-2.5 text-sm text-ink outline-none transition-colors focus:border-neonCyan/60" /></label>
          <label className="mt-4 flex cursor-pointer items-center gap-3 rounded-xl border border-hair bg-fill p-3 text-sm text-ink"><input type="checkbox" checked={realHosts} onChange={(event) => setRealHosts(event.target.checked)} className="h-4 w-4 accent-cyan-500" />Use host placements (Mexico, Canada, USA)</label>
          <div className="mt-5 flex gap-2"><button type="button" onClick={start} disabled={run.phase === 'running' || !draw.groups} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-neonCyan px-4 py-3 text-sm font-semibold text-void transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"><Play className="h-4 w-4 fill-current" />{run.phase === 'running' ? 'Simulating…' : 'Run simulation'}</button><button type="button" onClick={() => { setSeed('2026'); setIterations('1000'); setRealHosts(true) }} aria-label="Reset simulation" className="grid w-11 place-items-center rounded-xl border border-hair bg-fill text-muted transition-colors hover:text-neonCyan"><RotateCcw className="h-4 w-4" /></button></div>
          {run.total > 0 && <div className="mt-5"><div className="h-1.5 overflow-hidden rounded-full bg-fill"><div className="h-full bg-gradient-to-r from-neonCyan to-neonPurple transition-all" style={{ width: `${progress}%` }} /></div><p className="mt-2 font-mono text-[11px] text-muted">{run.phase === 'running' ? 'simulating' : 'complete'} · {format(run.done)} / {format(run.total)}</p></div>}
          {run.error && <p role="alert" className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{run.error}</p>}
        </aside>

        <div className="glass overflow-hidden rounded-2xl border border-hair">
          <div className="flex items-center justify-between border-b border-hair px-5 py-4"><div><p className="font-mono text-xs text-muted">// championship odds</p><h2 className="mt-1 text-lg font-semibold text-ink">{run.counts ? `${top.name} leads at ${top.titlePct.toFixed(1)}%` : `${top.name} is Elo favourite`}</h2></div><Trophy className="h-5 w-5 text-neonCyan" /></div>
          <div className="max-h-[30rem] overflow-auto"><table className="w-full text-sm"><thead className="sticky top-0 bg-surface/95 text-left font-mono text-[10px] uppercase tracking-wider text-muted backdrop-blur"><tr><th className="px-5 py-3">#</th><th className="px-3 py-3">Team</th><th className="px-3 py-3 text-right">Elo</th><th className="px-5 py-3 text-right">Title</th></tr></thead><tbody className="divide-y divide-hair">{rows.map((team, index) => <tr key={team.code} className={index === 0 ? 'bg-neonCyan/[0.04]' : ''}><td className="px-5 py-2.5 font-mono text-xs text-muted">{index + 1}</td><td className="px-3 py-2.5 font-medium text-ink">{team.name} <span className="ml-1 font-mono text-[10px] text-muted">{team.code}</span></td><td className="px-3 py-2.5 text-right font-mono text-xs text-muted">{team.elo}</td><td className="px-5 py-2.5 text-right font-mono text-xs text-neonCyan">{run.counts ? `${team.titlePct.toFixed(1)}%` : '—'}</td></tr>)}</tbody></table></div>
        </div>
      </div>

      <div className="mt-5 glass rounded-2xl border border-hair p-5 sm:p-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-mono text-xs text-muted">// seeded group draw</p><p className="mt-1 text-sm text-ink">Seed: <span className="font-mono text-neonCyan">{seed || '2026'}</span></p></div><p className="text-xs text-muted">Ratings: {PROVENANCE.eloSource} · {PROVENANCE.eloAsOf}</p></div>{draw.error ? <p role="alert" className="mt-4 text-sm text-red-300">{draw.error}</p> : <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{GROUP_LABELS.map((group) => <div key={group} className="overflow-hidden rounded-xl border border-hair bg-fill"><div className="border-b border-hair px-3 py-2 font-mono text-xs font-semibold text-ink">Group {group}</div><ul className="divide-y divide-hair">{draw.groups[group].map((team) => <li key={team.code} className="flex items-center justify-between px-3 py-2 text-xs"><span className="truncate text-ink">{team.name}</span><span className="font-mono text-muted">{team.elo}</span></li>)}</ul></div>)}</div>}</div>
    </section>
  )
}
