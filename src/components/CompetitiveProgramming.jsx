import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, ExternalLink, Flame, Trophy, X } from 'lucide-react'
import SectionHeading from './ui/SectionHeading'
import Reveal from './ui/Reveal'
import Heatmap from './ui/Heatmap'
import { getCpStats } from '../lib/cp'
import { api } from '../lib/api'
import { useCollection } from '../hooks/useCollection'
import { competitiveProgramming } from '../data/portfolioData'

/**
 * Competitive-programming section. One card per online judge; Codeforces and
 * AtCoder pull live stats in the browser (see lib/cp.js), LeetCode and CodeChef
 * link out. Clicking a card opens a detail view with the full activity heatmap,
 * problems-solved counts and longest streaks.
 */
export default function CompetitiveProgramming() {
  // Judges are managed in /admin and served from the API; the static list ships
  // as a fallback so the section still renders when the API is asleep.
  const { items: platforms } = useCollection(api.listCp, competitiveProgramming)
  const data = useCpData(platforms)
  const [selected, setSelected] = useState(null)

  return (
    <section id="cp" className="relative mx-auto max-w-6xl scroll-mt-24 px-4 py-12 sm:px-6 md:py-16">
      <SectionHeading
        index="03"
        eyebrow="// competitive programming"
        title="Where I practice"
      />

      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        {platforms.map((p, i) => (
          <Reveal key={p.key || p.id} delay={(i % 2) * 0.06}>
            <CpCard platform={p} state={data[p.key]} onOpen={() => setSelected(p)} />
          </Reveal>
        ))}
      </div>

      <CpModal
        platform={selected}
        state={selected ? data[selected.key] : undefined}
        onClose={() => setSelected(null)}
      />
    </section>
  )
}

/** Fetch live stats for every judge that supports it; link judges are skipped. */
function useCpData(platforms) {
  const [state, setState] = useState({})

  useEffect(() => {
    let alive = true
    const set = (key, value) => alive && setState((s) => ({ ...s, [key]: value }))

    platforms.forEach((p) => {
      if (p.source !== 'codeforces' && p.source !== 'atcoder') return
      if (!p.handle) {
        set(p.key, { status: 'nohandle' })
        return
      }
      set(p.key, { status: 'loading' })
      getCpStats(p.source, p.handle)
        .then((d) => set(p.key, { status: 'ok', data: d }))
        .catch((e) => set(p.key, { status: 'error', error: e?.message || 'Could not load stats' }))
    })

    return () => {
      alive = false
    }
  }, [platforms])

  return state
}

/* ------------------------------------------------------------------ */
/*  Card                                                               */
/* ------------------------------------------------------------------ */

function StatusDot({ tone = 'muted', label }) {
  const color =
    tone === 'live' ? 'var(--color-neon-cyan)' : tone === 'error' ? '#ff6b6b' : 'var(--color-muted)'
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wide text-muted">
      <span className="relative flex h-1.5 w-1.5">
        {tone === 'live' && (
          <span
            className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-70"
            style={{ backgroundColor: color }}
          />
        )}
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
      </span>
      {label}
    </span>
  )
}

/** Each judge's real brand mark, on a white tile so the full-colour logos read on the black card. */
function Monogram({ platform, size = 'h-11 w-11' }) {
  return (
    <span
      className={`grid ${size} shrink-0 place-items-center overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/5`}
    >
      <img
        src={platform.logo}
        alt=""
        aria-hidden="true"
        draggable="false"
        loading="lazy"
        className={`h-full w-full object-contain ${platform.logoClass || 'p-1.5'}`}
      />
    </span>
  )
}

function CpCard({ platform, state, onOpen }) {
  const isLink = platform.source === 'link'
  const status = isLink ? (platform.handle ? 'link' : 'nohandle') : state?.status
  const d = state?.data
  // Lifetime solved: a manual override ("132+") when set, else the live tally.
  const solvedDisplay =
    platform.solvedOverride != null
      ? `${platform.solvedOverride}+`
      : d?.solved
        ? d.solved.total.toLocaleString()
        : null

  const statusLabel =
    status === 'ok'
      ? 'live'
      : status === 'loading'
        ? 'syncing'
        : status === 'error'
          ? 'offline'
          : status === 'link'
            ? 'profile'
            : 'not linked'
  const tone = status === 'ok' ? 'live' : status === 'error' ? 'error' : 'muted'

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`View ${platform.name} activity`}
      className="group relative flex h-full w-full flex-col overflow-hidden rounded-2xl glass p-5 text-left transition-colors hover:border-hair-strong"
    >
      {/* Faint graph-paper plane — the competitive programmer's grid */}
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-grid-lines opacity-[0.35]" />

      {/* "Editorial panel" treatment: a warm amber top-edge light-catch + a
          soft amber glow in the top corner, layered over the black glass — no
          cold white, so nothing reads grey. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-2xl [background:linear-gradient(150deg,color-mix(in_oklab,var(--color-neon-cyan)_12%,transparent),transparent_34%)]"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -inset-px rounded-2xl bg-[radial-gradient(300px_circle_at_20%_0%,color-mix(in_oklab,var(--color-neon-cyan)_14%,transparent),transparent_60%)] opacity-70"
      />

      <div className="relative flex items-center gap-3">
        <Monogram platform={platform} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-display text-lg font-semibold text-ink">{platform.name}</h3>
            <StatusDot tone={tone} label={statusLabel} />
          </div>
          {platform.handle && !platform.unlisted ? (
            <p className="truncate font-mono text-xs" style={{ color: d?.tierColor || 'var(--color-muted)' }}>
              @{platform.handle}
            </p>
          ) : (
            platform.stats && <p className="truncate font-mono text-xs text-muted/70">lifetime</p>
          )}
        </div>
      </div>

      {/* Body varies by state */}
      <div className="relative mt-5 flex flex-1 flex-col">
        {status === 'loading' && <CardSkeleton />}

        {status === 'error' && (
          <p className="text-sm text-muted">
            Couldn&rsquo;t reach {platform.name} right now. Open the profile to see the latest.
          </p>
        )}

        {status === 'nohandle' && !isLink && (
          <p className="text-sm text-muted">
            Add a {platform.name} handle in the portfolio data to show live stats here.
          </p>
        )}

        {status === 'ok' && d && (
          <>
            <div className="flex items-start justify-between gap-4">
              {d.rating != null ? (
                <>
                  <div>
                    <div className="font-display text-4xl font-bold leading-none" style={{ color: d.tierColor }}>
                      {d.rating}
                    </div>
                    <div className="mt-1.5 font-mono text-[11px] capitalize text-muted">
                      {d.rank || 'current rating'}
                      {d.maxRating != null && <span className="text-muted/70"> · max {d.maxRating}</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-4xl font-bold leading-none text-ink">{solvedDisplay}</div>
                    <div className="mt-1.5 font-mono text-[11px] text-muted">solved</div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <div className="font-display text-4xl font-bold leading-none text-ink">{solvedDisplay}</div>
                    <div className="mt-1.5 font-mono text-[11px] text-muted">problems solved</div>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full border border-hair bg-fill px-2.5 py-1 font-mono text-[11px] text-ink">
                    <Flame className="h-3 w-3 text-neonCyan" />
                    {d.streak.all}d streak
                  </div>
                </>
              )}
            </div>

            <div className="mt-4">
              <Heatmap daily={d.daily} weeks={18} cell={9} gap={2} showLabels={false} />
            </div>

            <div className="mt-auto flex items-center justify-between gap-2 pt-4 font-mono text-[11px] text-muted">
              <span className="inline-flex flex-wrap items-center gap-x-3 gap-y-1">
                {d.rating != null && (
                  <span className="inline-flex items-center gap-1 text-ink">
                    <Flame className="h-3 w-3 text-neonCyan" />
                    {d.streak.all}d streak
                  </span>
                )}
                <span>{d.solved.month} this month</span>
              </span>
              <span className="inline-flex items-center gap-1 text-ink transition-transform group-hover:translate-x-0.5">
                Details <ArrowUpRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </>
        )}

        {(status === 'link' || (isLink && status === 'nohandle')) && (
          <LinkCardBody platform={platform} />
        )}
      </div>
    </button>
  )
}

/** Body for judges we can't read from the browser (LeetCode / CodeChef). */
function LinkCardBody({ platform }) {
  const stats = platform.stats
  return (
    <>
      {stats && (stats.rating != null || stats.solved != null || stats.submissions != null) ? (
        <>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {stats.rating != null && (
              <div>
                <div className="font-display text-4xl font-bold leading-none text-ink">{stats.rating}</div>
                <div className="mt-1.5 font-mono text-[11px] text-muted">rating</div>
              </div>
            )}
            {stats.solved != null && (
              <div>
                <div className="font-display text-4xl font-bold leading-none text-ink">{stats.solved}+</div>
                <div className="mt-1.5 font-mono text-[11px] text-muted">solved</div>
              </div>
            )}
            {stats.submissions != null && (
              <div>
                <div className="font-display text-4xl font-bold leading-none text-ink">{stats.submissions}</div>
                <div className="mt-1.5 font-mono text-[11px] text-muted">submissions · past year</div>
              </div>
            )}
          </div>
          {(stats.activeDays != null || stats.maxStreak != null) && (
            <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px] text-muted">
              {stats.activeDays != null && <span>{stats.activeDays} active days</span>}
              {stats.activeDays != null && stats.maxStreak != null && <span aria-hidden="true">·</span>}
              {stats.maxStreak != null && <span>{stats.maxStreak}d max streak</span>}
            </div>
          )}
        </>
      ) : (
        <p className="text-sm leading-relaxed text-muted">
          {platform.handle
            ? `${platform.name} doesn't expose stats to the browser — open the full profile for ratings and solved problems.`
            : `Add a ${platform.name} handle to link the profile here.`}
        </p>
      )}
      {stats?.note && <p className="mt-2 font-mono text-[11px] text-neonCyan">{stats.note}</p>}

      <div className="mt-auto flex items-center justify-between gap-2 pt-4 font-mono text-[11px] text-muted">
        <span>online judge</span>
        <span className="inline-flex items-center gap-1 text-ink transition-transform group-hover:translate-x-0.5">
          {platform.handle ? 'Open profile' : 'Details'} <ArrowUpRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </>
  )
}

function CardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-9 w-24 rounded bg-fill" />
      <div className="mt-2 h-3 w-32 rounded bg-fill" />
      <div className="mt-4 h-12 w-full rounded bg-fill" />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Detail modal                                                       */
/* ------------------------------------------------------------------ */

function StatBlock({ label, values }) {
  return (
    <div className="rounded-xl border border-hair bg-fill p-4">
      <div className="font-mono text-[11px] uppercase tracking-wide text-muted">{label}</div>
      <dl className="mt-3 grid grid-cols-3 gap-2">
        {values.map((v) => (
          <div key={v.k}>
            <dt className="font-display text-2xl font-semibold text-ink tabular-nums">{v.v}</dt>
            <dd className="mt-0.5 font-mono text-[10px] text-muted">{v.k}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

/** Build the "view profile" URL from the stored `{handle}` template. */
function profileHref(platform) {
  if (!platform?.handle || !platform.profileUrl || platform.unlisted) return null
  return platform.profileUrl.replace('{handle}', platform.handle)
}

function CpModal({ platform, state, onClose }) {
  const closeRef = useRef(null)

  useEffect(() => {
    if (!platform) return
    document.body.style.overflow = 'hidden'
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    closeRef.current?.focus()
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [platform, onClose])

  const d = state?.data
  const href = profileHref(platform)
  const solvedAllTime =
    platform?.solvedOverride != null
      ? `${platform.solvedOverride}+`
      : d?.solved
        ? d.solved.total.toLocaleString()
        : null

  return (
    <AnimatePresence>
      {platform && (
        <motion.div
          className="fixed inset-0 z-[90] grid place-items-center p-4 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="cp-modal-title"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="glass-strong relative z-10 flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl shadow-2xl shadow-black/60"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-hair p-6">
              <div className="flex items-center gap-3">
                <Monogram platform={platform} />
                <div>
                  <h3 id="cp-modal-title" className="font-display text-2xl font-bold text-ink">
                    {platform.name}
                  </h3>
                  {platform.handle && !platform.unlisted && (
                    <p className="font-mono text-sm" style={{ color: d?.tierColor || 'var(--color-muted)' }}>
                      @{platform.handle}
                      {d?.rank && <span className="capitalize text-muted"> · {d.rank}</span>}
                    </p>
                  )}
                </div>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-hair bg-fill text-muted transition-colors hover:text-ink"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="min-h-0 flex-1 overflow-y-auto p-6">
              {state?.status === 'ok' && d ? (
                <div className="space-y-4">
                  {(d.rating != null || d.maxRating != null) && (
                    <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
                      {d.rating != null && (
                        <div>
                          <div className="font-display text-5xl font-bold leading-none" style={{ color: d.tierColor }}>
                            {d.rating}
                          </div>
                          <div className="mt-1.5 flex items-center gap-1.5 font-mono text-[11px] text-muted">
                            <Trophy className="h-3 w-3" />
                            current rating
                          </div>
                        </div>
                      )}
                      {d.maxRating != null && (
                        <div>
                          <div className="font-display text-3xl font-semibold leading-none text-ink">{d.maxRating}</div>
                          <div className="mt-1.5 font-mono text-[11px] text-muted">peak rating</div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="grid gap-3 sm:grid-cols-2">
                    <StatBlock
                      label="Problems solved"
                      values={[
                        { k: 'all time', v: solvedAllTime },
                        { k: 'last year', v: d.solved.year.toLocaleString() },
                        { k: 'last 30d', v: d.solved.month.toLocaleString() },
                      ]}
                    />
                    <StatBlock
                      label="Longest streak (days)"
                      values={[
                        { k: 'all time', v: d.streak.all },
                        { k: 'this year', v: d.streak.year },
                        { k: 'this month', v: d.streak.month },
                      ]}
                    />
                  </div>

                  <div>
                    <div className="mb-3 flex items-center gap-2.5 font-mono text-xs text-muted">
                      <span aria-hidden="true" className="inline-block h-px w-6 bg-neonCyan/70" />
                      Activity — last year
                    </div>
                    <div className="overflow-x-auto no-scrollbar">
                      <Heatmap daily={d.daily} weeks={53} cell={12} gap={3} showLabels />
                    </div>
                  </div>
                </div>
              ) : state?.status === 'loading' ? (
                <p className="font-mono text-sm text-muted">Fetching live stats from {platform.name}…</p>
              ) : state?.status === 'error' ? (
                <p className="text-sm leading-relaxed text-muted">
                  Couldn&rsquo;t reach the {platform.name} API just now. Open the full profile for the latest stats.
                </p>
              ) : (
                <LinkModalBody platform={platform} />
              )}
            </div>

            {/* Footer */}
            {href && (
              <div className="flex items-center gap-3 border-t border-hair p-6">
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-neonCyan px-5 py-2.5 font-semibold text-void transition-opacity duration-200 hover:opacity-90"
                >
                  <ExternalLink className="h-4 w-4" />
                  View full profile
                </a>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/** Modal body for link-only judges. */
function LinkModalBody({ platform }) {
  const stats = platform.stats
  const hasNums = stats && (stats.rating != null || stats.solved != null || stats.submissions != null)
  return (
    <div className="space-y-4">
      {hasNums && (
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
          {stats.rating != null && (
            <div>
              <div className="font-display text-5xl font-bold leading-none text-ink">{stats.rating}</div>
              <div className="mt-1.5 font-mono text-[11px] text-muted">rating</div>
            </div>
          )}
          {stats.solved != null && (
            <div>
              <div className="font-display text-3xl font-semibold leading-none text-ink">{stats.solved}+</div>
              <div className="mt-1.5 font-mono text-[11px] text-muted">problems solved</div>
            </div>
          )}
          {stats.submissions != null && (
            <div>
              <div className="font-display text-5xl font-bold leading-none text-ink">{stats.submissions}</div>
              <div className="mt-1.5 font-mono text-[11px] text-muted">submissions · past year</div>
            </div>
          )}
          {stats.activeDays != null && (
            <div>
              <div className="font-display text-3xl font-semibold leading-none text-ink">{stats.activeDays}</div>
              <div className="mt-1.5 font-mono text-[11px] text-muted">active days</div>
            </div>
          )}
          {stats.maxStreak != null && (
            <div>
              <div className="font-display text-3xl font-semibold leading-none text-ink">{stats.maxStreak}</div>
              <div className="mt-1.5 font-mono text-[11px] text-muted">max streak (days)</div>
            </div>
          )}
        </div>
      )}
      <p className="text-sm leading-relaxed text-muted">
        {platform.handle
          ? `${platform.name} doesn't expose activity to the browser, so there's no live heatmap here. The full profile has the up-to-date ratings and solved problems.`
          : `Add a ${platform.name} handle in the portfolio data to link the profile.`}
      </p>
    </div>
  )
}
