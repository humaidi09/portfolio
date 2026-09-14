import { useEffect, useRef, useState } from 'react'
import { Check, Copy, Eye, EyeOff, Loader2, LogIn, UserPlus } from 'lucide-react'
import { Badge, Button, Callout, Field, Mono, Panel, Stat, TextInput } from '../ui/kit'
import {
  HASH_ITERATIONS,
  createUserStore,
  loginUser,
  registerUser,
  strengthLabel,
} from '../../../lib/demos/auth'

/**
 * Login & Registration — live port. Register and sign in against the real
 * salted, 120,000-round SHA-256 derivation from the C++ repo (see
 * lib/demos/auth.js + sha256.js), computed live and asynchronously in the
 * browser. The store keeps only {username, salt, verifier} — never the
 * password — and the credential store on the right makes that concrete. A demo
 * account is pre-registered on open so Login works immediately.
 */

// Pre-registered demo account (the repo's own test fixture credentials).
const DEMO_USER = 'humaidi09'
const DEMO_PASSWORD = 'Str0ngPass!2026'

// Strength label → meter fill + colour. Semantics only (red/amber/green), kept
// separate from the site's single amber signal.
const STRENGTH = {
  weak: { segments: 1, bar: 'bg-red-500', text: 'text-red-300' },
  fair: { segments: 2, bar: 'bg-amber-500', text: 'text-amber-300' },
  strong: { segments: 3, bar: 'bg-emerald-400', text: 'text-emerald-300' },
}

const round = (n) => (n == null ? null : Math.round(n))
const fmtMs = (ms) => (ms == null ? '— ms' : `${round(ms)} ms`)

/** Middle-truncate a long hex digest; the full value stays available via copy. */
const truncate = (hex, head = 14, tail = 6) =>
  hex.length <= head + tail + 1 ? hex : `${hex.slice(0, head)}…${hex.slice(-tail)}`

/** Rough offline-attack estimate for the work-factor callout. */
function attackEstimate(msPerAttempt) {
  const seconds = 1e9 * (msPerAttempt / 1000) // one billion guesses
  const years = seconds / (365 * 24 * 3600)
  if (years >= 1) return `${years >= 10 ? Math.round(years) : years.toFixed(1)} years`
  const days = seconds / (24 * 3600)
  if (days >= 1) return `${Math.round(days)} days`
  return `${Math.round(seconds / 3600)} hours`
}

export default function AuthDemo() {
  // Stable in-memory store (lazy init so it is created exactly once).
  const storeRef = useRef(null)
  if (storeRef.current === null) storeRef.current = createUserStore()
  const store = storeRef.current

  const [records, setRecords] = useState([]) // render snapshot of the store
  const [lastWorkMs, setLastWorkMs] = useState(null) // most recent measured derivation cost
  const [highlight, setHighlight] = useState(null) // username to flash after registering

  // Register form
  const [regUser, setRegUser] = useState('')
  const [regPw, setRegPw] = useState('')
  const [regConfirm, setRegConfirm] = useState('')
  const [regResult, setRegResult] = useState(null)

  // Login form — username pre-filled with the demo account.
  const [logUser, setLogUser] = useState(DEMO_USER)
  const [logPw, setLogPw] = useState('')
  const [logResult, setLogResult] = useState(null)

  // Derivation state. `busy` names the form currently deriving (single-threaded,
  // so only one runs at a time); `progress` is 0…1.
  const [busy, setBusy] = useState(null)
  const [progress, setProgress] = useState(0)

  // Seeding the demo account (a full derivation) happens once, after first paint,
  // so the initial render is instant instead of blocking on 120k rounds.
  const [seeding, setSeeding] = useState(true)
  const [seedProgress, setSeedProgress] = useState(0)

  const abortRef = useRef(null)
  const didSeed = useRef(false)

  useEffect(() => {
    if (didSeed.current) return // guard React strict-mode's double-invoke
    didSeed.current = true
    registerUser(
      store,
      { username: DEMO_USER, password: DEMO_PASSWORD },
      { onProgress: setSeedProgress },
    ).then((result) => {
      setRecords(store.list())
      if (result.elapsedMs != null) setLastWorkMs(result.elapsedMs)
      setSeeding(false)
    })
    // Cancel any in-flight user derivation if the demo unmounts.
    return () => abortRef.current?.abort()
  }, [store])

  const locked = busy !== null || seeding

  async function onRegister(e) {
    e.preventDefault()
    if (locked) return
    const controller = new AbortController()
    abortRef.current = controller
    setRegResult(null)
    setBusy('register')
    setProgress(0)
    try {
      const result = await registerUser(
        store,
        { username: regUser.trim(), password: regPw, confirmPassword: regConfirm },
        { onProgress: setProgress, signal: controller.signal },
      )
      setRegResult(result)
      if (result.ok) {
        setRecords(store.list())
        if (result.elapsedMs != null) setLastWorkMs(result.elapsedMs)
        setHighlight(result.record.username)
        setTimeout(() => setHighlight((u) => (u === result.record.username ? null : u)), 2500)
        setRegPw('')
        setRegConfirm('')
        setLogUser(result.record.username) // ready to sign in as the new user
        setLogResult(null)
      }
    } catch (err) {
      if (err?.name !== 'AbortError') throw err
    } finally {
      setBusy(null)
      abortRef.current = null
    }
  }

  async function onLogin(e) {
    e.preventDefault()
    if (locked) return
    const controller = new AbortController()
    abortRef.current = controller
    setLogResult(null)
    setBusy('login')
    setProgress(0)
    try {
      const result = await loginUser(
        store,
        { username: logUser.trim(), password: logPw },
        { onProgress: setProgress, signal: controller.signal },
      )
      setLogResult(result)
      if (result.elapsedMs != null) setLastWorkMs(result.elapsedMs)
    } catch (err) {
      if (err?.name !== 'AbortError') throw err
    } finally {
      setBusy(null)
      abortRef.current = null
    }
  }

  const fillDemo = () => {
    setLogUser(DEMO_USER)
    setLogPw(DEMO_PASSWORD)
    setLogResult(null)
  }

  const displayRecords = [...records].reverse() // newest first

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      {/* ------------------------------------------------------- forms column */}
      <div className="order-1 space-y-6">
        <Callout tone="info" title="Try it — a demo account is pre-registered">
          Sign in with <Mono>{DEMO_USER}</Mono> / <Mono>{DEMO_PASSWORD}</Mono>, or register your
          own. Every hash is derived live in your browser — nothing is sent to a server, and no
          password is ever stored.
        </Callout>

        {/* Register ------------------------------------------------------- */}
        <Panel eyebrow="// register" title="Create an account" bodyClass="space-y-4">
          <form onSubmit={onRegister} className="space-y-4">
            <Field label="Username" hint="3–32 chars">
              <TextInput
                value={regUser}
                onChange={(e) => setRegUser(e.target.value)}
                placeholder="e.g. humaidi09"
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                disabled={locked}
              />
            </Field>

            <Field label="Password" hint="8+ · upper · lower · digit">
              <PasswordField
                value={regPw}
                onChange={(e) => setRegPw(e.target.value)}
                placeholder="Choose a strong password"
                autoComplete="new-password"
                ariaLabel="New password"
                disabled={locked}
              />
              {regPw && <StrengthMeter password={regPw} />}
            </Field>

            <Field label="Confirm password">
              <PasswordField
                value={regConfirm}
                onChange={(e) => setRegConfirm(e.target.value)}
                placeholder="Re-enter the password"
                autoComplete="new-password"
                ariaLabel="Confirm password"
                disabled={locked}
              />
            </Field>

            {busy === 'register' && <ProgressBlock progress={progress} verb="Deriving verifier" />}
            {regResult && <RegisterResult result={regResult} />}

            <Button type="submit" disabled={locked || !regUser || !regPw} className="w-full sm:w-auto">
              {busy === 'register' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
              {busy === 'register' ? 'Deriving…' : 'Register'}
            </Button>
          </form>
        </Panel>

        {/* Login ---------------------------------------------------------- */}
        <Panel
          eyebrow="// login"
          title="Sign in"
          actions={
            <Button variant="subtle" size="sm" type="button" onClick={fillDemo} disabled={locked}>
              Use demo login
            </Button>
          }
          bodyClass="space-y-4"
        >
          <form onSubmit={onLogin} className="space-y-4">
            <Field label="Username">
              <TextInput
                value={logUser}
                onChange={(e) => setLogUser(e.target.value)}
                placeholder="Username"
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                disabled={locked}
              />
            </Field>

            <Field label="Password">
              <PasswordField
                value={logPw}
                onChange={(e) => setLogPw(e.target.value)}
                placeholder="Password"
                autoComplete="off"
                ariaLabel="Password"
                disabled={locked}
              />
            </Field>

            {busy === 'login' && <ProgressBlock progress={progress} verb="Verifying" />}
            {logResult && <LoginResult result={logResult} />}

            <Button type="submit" disabled={locked || !logUser || !logPw} className="w-full sm:w-auto">
              {busy === 'login' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogIn className="h-4 w-4" />
              )}
              {busy === 'login' ? 'Verifying…' : 'Log in'}
            </Button>
          </form>
        </Panel>
      </div>

      {/* ----------------------------------------------------------- sidebar */}
      <div className="order-2 space-y-4">
        <Stat
          label="Cost per attempt"
          value={fmtMs(lastWorkMs)}
          sub={`${HASH_ITERATIONS.toLocaleString()} SHA-256 rounds`}
          accent
        />

        <Callout tone="warn" title="Why the work factor matters">
          One password guess costs an attacker {HASH_ITERATIONS.toLocaleString()} SHA-256 rounds,
          not one.{' '}
          {lastWorkMs != null && (
            <>
              At ≈ {round(lastWorkMs)} ms per attempt, a billion-guess offline attack on a stolen
              database is ≈{' '}
              <span className="font-semibold text-ink">{attackEstimate(lastWorkMs)}</span> of
              compute.
            </>
          )}
        </Callout>

        <Panel
          eyebrow="// credential store"
          title="What's actually stored"
          actions={
            <Badge tone="neutral">
              {records.length} acct{records.length === 1 ? '' : 's'}
            </Badge>
          }
          bodyClass="space-y-3"
        >
          {seeding && (
            <div className="flex items-center gap-3 rounded-xl border border-hair bg-void/20 p-3">
              <Loader2 className="h-4 w-4 shrink-0 animate-spin text-neonCyan" />
              <div className="min-w-0 flex-1">
                <div className="text-xs text-ink">Provisioning demo account…</div>
                <div className="mt-1.5">
                  <ProgressBar value={seedProgress} />
                </div>
              </div>
            </div>
          )}

          {displayRecords.map((r) => (
            <RecordCard key={r.username} record={r} highlight={highlight === r.username} />
          ))}

          <p className="text-xs leading-relaxed text-muted">
            Only the username, a random per-user salt and the derived verifier are kept — never the
            password. Change any input and the verifier changes completely.
          </p>
        </Panel>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------- sub-views -- */

/** Password input with a show/hide toggle. */
function PasswordField({ value, onChange, placeholder, disabled, autoComplete = 'off', ariaLabel }) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <TextInput
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete={autoComplete}
        aria-label={ariaLabel}
        className="pr-11"
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        disabled={disabled}
        aria-label={show ? 'Hide password' : 'Show password'}
        title={show ? 'Hide password' : 'Show password'}
        className="absolute inset-y-0 right-0 grid w-10 place-items-center text-muted transition-colors hover:text-neonCyan disabled:opacity-40"
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  )
}

/** Three-segment strength meter driven by the faithful strengthLabel(). */
function StrengthMeter({ password }) {
  const label = strengthLabel(password)
  const meta = STRENGTH[label]
  return (
    <div className="mt-2 flex items-center gap-2">
      <div className="flex flex-1 gap-1" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={`h-1.5 flex-1 rounded-full ${i < meta.segments ? meta.bar : 'bg-fill'}`}
          />
        ))}
      </div>
      <span className={`w-12 text-right font-mono text-[11px] ${meta.text}`}>{label}</span>
    </div>
  )
}

/** Amber work-factor progress bar (0…1). */
function ProgressBar({ value }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full border border-hair bg-void/50">
      <div
        className="h-full rounded-full bg-neonCyan transition-[width] duration-100 ease-out"
        style={{ width: `${Math.max(2, Math.round(value * 100))}%` }}
      />
    </div>
  )
}

/** Progress bar plus a mono status line, shown while a derivation runs. */
function ProgressBlock({ progress, verb }) {
  return (
    <div className="space-y-1.5">
      <ProgressBar value={progress} />
      <div className="flex items-center justify-between font-mono text-[11px] text-muted">
        <span>
          {verb} · {HASH_ITERATIONS.toLocaleString()} rounds
        </span>
        <span className="tabular-nums">{Math.round(progress * 100)}%</span>
      </div>
    </div>
  )
}

/** Register outcome: success note, or the failing policy rules. */
function RegisterResult({ result }) {
  if (result.ok) {
    return (
      <Callout tone="good" title={result.message}>
        Stored with a fresh salt — the plaintext appears nowhere. See the new record in the
        credential store.
      </Callout>
    )
  }
  return (
    <Callout tone="bad" title={result.message}>
      {result.problems ? (
        <ul className="ml-4 list-disc space-y-0.5">
          {result.problems.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      ) : null}
    </Callout>
  )
}

/** Login outcome: pass/fail badge, timing, and the no-enumeration note. */
function LoginResult({ result }) {
  return (
    <div className="rounded-xl border border-hair bg-void/20 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={result.ok ? 'good' : 'bad'}>{result.ok ? 'Authenticated' : 'Rejected'}</Badge>
        {result.elapsedMs != null && (
          <span className="font-mono text-xs text-muted">
            {result.ok ? 'verified' : 'checked'} in {round(result.elapsedMs)} ms
          </span>
        )}
      </div>
      <p className="mt-2 text-sm text-muted">{result.message}</p>
      {!result.ok && (
        <p className="mt-1.5 font-mono text-[11px] leading-relaxed text-muted/80">
          A wrong password and an unknown user return the identical message — the form can't reveal
          which usernames exist. The hash compare runs in constant time.
        </p>
      )}
    </div>
  )
}

/** One stored account, shown in a dark code-surface with copyable hex. */
function RecordCard({ record, highlight }) {
  const isDemo = record.username.toLowerCase() === DEMO_USER.toLowerCase()
  return (
    <div
      className={`code-surface rounded-xl border p-3 transition-colors ${
        highlight ? 'border-neonCyan/60' : 'border-hair'
      }`}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="truncate font-mono text-sm font-semibold text-ink">{record.username}</span>
        {isDemo && <Badge tone="neutral">demo</Badge>}
      </div>
      <div className="space-y-1.5">
        <HashRow label="salt" value={record.saltHex} />
        <HashRow label="verifier" value={record.verifierHex} />
        <div className="flex items-center gap-2 pt-0.5 font-mono text-[11px]">
          <span className="w-16 shrink-0 text-muted">password</span>
          <span className="text-neonCyan">— never stored —</span>
        </div>
      </div>
    </div>
  )
}

/** A labelled, truncated hex value with a copy button. */
function HashRow({ label, value }) {
  return (
    <div className="flex items-center gap-2 font-mono text-[11px]">
      <span className="w-16 shrink-0 text-muted">{label}</span>
      <span className="min-w-0 flex-1 truncate text-ink" title={value}>
        {truncate(value)}
      </span>
      <CopyButton value={value} label={`Copy ${label}`} />
    </div>
  )
}

/** Copy-to-clipboard affordance with a transient check. */
function CopyButton({ value, label }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch {
      /* clipboard unavailable — nothing to do */
    }
  }
  return (
    <button
      type="button"
      onClick={copy}
      aria-label={label}
      title={label}
      className="grid h-6 w-6 shrink-0 place-items-center rounded-md text-muted transition-colors hover:text-neonCyan"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  )
}
