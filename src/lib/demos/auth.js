// Faithful in-browser port of the project's authentication core (C++ → JS):
// src/password.cpp (salting, key stretching, constant-time compare, policy),
// src/user.cpp (username rules) and the register/login paths of
// src/auth_service.cpp. Everything runs locally — the store is an in-memory
// Map, no network, and the plaintext password is never kept or returned.
//
// The security-relevant constants and the derivation are matched exactly to the
// repo; see the block comments on each function.

import { sha256Hex } from './sha256.js'

/**
 * SHA-256 rounds applied when deriving a stored verifier (kHashIterations in
 * password.h). Key stretching makes a stolen credentials file expensive to
 * attack offline: one guess costs the attacker this many hashes, not one.
 *
 * Faithful detail: the C++ loop is `digest = sha256(salt + ":" + password);`
 * then `for (i = 1; i < kHashIterations; ++i) digest = sha256(digest + salt);`
 * — i.e. one binding round plus 119,999 stretch rounds, HASH_ITERATIONS SHA-256
 * invocations in total (the README states it as "repeat 119,999 times").
 */
export const HASH_ITERATIONS = 120000

/** Salt size in bytes (generateSalt's default). 16 bytes → 32 hex characters. */
export const SALT_BYTES = 16

// performance.now when available (sub-millisecond, monotonic) so the reported
// work factor is accurate; Date.now is a harmless fallback outside the browser.
const now = typeof performance !== 'undefined' && performance.now ? () => performance.now() : () => Date.now()

const HEX = '0123456789abcdef'

function bytesToHex(bytes) {
  let out = ''
  for (let i = 0; i < bytes.length; i++) {
    out += HEX[(bytes[i] >> 4) & 0xf] + HEX[bytes[i] & 0xf]
  }
  return out
}

/**
 * Cryptographically random salt as a hex string (generateSalt in password.cpp,
 * here backed by Web Crypto instead of mt19937). A unique per-user salt means
 * two people with the same password still get different verifiers, so one
 * cracked hash reveals nothing about the other and rainbow tables are useless.
 */
export function generateSaltHex(bytes = SALT_BYTES) {
  const buf = new Uint8Array(bytes)
  crypto.getRandomValues(buf)
  return bytesToHex(buf)
}

/**
 * Derive the stored verifier from a password and its salt — the synchronous,
 * line-for-line mirror of derivePassword(). Correct but blocking; the UI uses
 * deriveAsync() so 120k rounds don't freeze the main thread. Kept for
 * determinism checks and as the readable reference.
 */
export function derivePassword(password, saltHex) {
  // First round binds the salt to the password; later rounds only stretch.
  let digest = sha256Hex(saltHex + ':' + password)
  for (let i = 1; i < HASH_ITERATIONS; i++) {
    digest = sha256Hex(digest + saltHex)
  }
  return digest
}

/**
 * The same derivation, sliced into chunks so the browser stays responsive and a
 * progress bar can visualise the work factor. Runs `chunkRounds` SHA-256 rounds
 * per tick, yields with setTimeout(0), and resolves to the verifier plus the
 * pure compute time (the setTimeout gaps are excluded — elapsedMs is what an
 * attacker actually pays per guess). Pass an AbortSignal to cancel in flight.
 */
export function deriveAsync(password, saltHex, options = {}) {
  const { onProgress, chunkRounds = 2000, signal } = options
  const total = HASH_ITERATIONS

  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(new DOMException('Derivation aborted', 'AbortError'))

    let digest = ''
    let done = 0 // number of SHA-256 rounds completed (0…total)
    let computeMs = 0

    const step = () => {
      if (signal?.aborted) return reject(new DOMException('Derivation aborted', 'AbortError'))

      const start = now()
      const end = Math.min(done + chunkRounds, total)
      while (done < end) {
        // Round 0 is the binding round; rounds 1…total-1 are the stretch.
        digest = done === 0 ? sha256Hex(saltHex + ':' + password) : sha256Hex(digest + saltHex)
        done++
      }
      computeMs += now() - start

      if (onProgress) onProgress(done / total)

      if (done < total) {
        setTimeout(step, 0)
      } else {
        resolve({ verifierHex: digest, elapsedMs: computeMs, rounds: total })
      }
    }

    setTimeout(step, 0)
  })
}

/**
 * Compare two hex digests without leaking where they first differ through
 * timing (constantTimeEquals): length check, then XOR-accumulate every byte and
 * test the accumulator once at the end. `==` would short-circuit at the first
 * differing byte, and that timing difference leaks information.
 */
export function constantTimeEqualHex(a, b) {
  if (a.length !== b.length) return false
  let difference = 0
  for (let i = 0; i < a.length; i++) {
    difference |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return difference === 0
}

/**
 * Username rules from user.cpp / checkUsername: 3–32 characters of letters,
 * digits, underscore, dot or dash — a set that also guarantees a name can never
 * break the tab-separated on-disk record format.
 */
export function checkUsername(username) {
  if (username.length < 3) return { valid: false, problem: 'must be at least 3 characters' }
  if (username.length > 32) return { valid: false, problem: 'must be at most 32 characters' }
  if (!/^[A-Za-z0-9_.-]+$/.test(username)) {
    return { valid: false, problem: 'may use only letters, digits, dot, dash and underscore' }
  }
  return { valid: true, problem: '' }
}

// The handful of passwords that show up in every breach list (kBanned).
const BANNED = new Set([
  'password', '12345678', 'qwerty123', 'letmein', 'admin123',
  'password1', 'welcome1', 'iloveyou', 'abc12345',
])

/**
 * Password strength policy (checkPasswordPolicy): 8–128 characters, a mix of
 * character classes, no spaces, and no breach-list entry. Returns the list of
 * problems in the same order the C++ appends them; ok is true when empty.
 */
export function checkPasswordPolicy(password) {
  const problems = []
  if (password.length < 8) problems.push('must be at least 8 characters long')
  if (password.length > 128) problems.push('must be no longer than 128 characters')
  if (!/[A-Z]/.test(password)) problems.push('must contain an uppercase letter')
  if (!/[a-z]/.test(password)) problems.push('must contain a lowercase letter')
  if (!/[0-9]/.test(password)) problems.push('must contain a digit')
  if (password.includes(' ')) problems.push('must not contain spaces')
  if (BANNED.has(password.toLowerCase())) problems.push('is too common — pick something less guessable')
  return { problems, ok: problems.length === 0 }
}

// ASCII punctuation, matching C's ispunct — the "symbol" class for scoring.
const SYMBOL = /[!-/:-@[-`{-~]/

/** Rough strength label ("weak" / "fair" / "strong") for live feedback. */
export function strengthLabel(password) {
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (SYMBOL.test(password)) score++
  if (score <= 2) return 'weak'
  if (score <= 4) return 'fair'
  return 'strong'
}

/* --------------------------------------------------------------- store ---- */

/**
 * In-memory account store — the demo's stand-in for the file-backed UserStore.
 * It keeps ONLY what the real store persists per account: the username, the
 * salt and the derived verifier. The plaintext password is never held here.
 * Usernames are keyed case-insensitively, so "Humaid" and "humaid" collide,
 * exactly as the real store does.
 */
export function createUserStore() {
  const byKey = new Map()
  const key = (username) => username.toLowerCase()

  return {
    has(username) {
      return byKey.has(key(username))
    },
    get(username) {
      return byKey.get(key(username)) || null
    },
    /** Store {username, saltHex, verifierHex}; false if the name is taken. */
    add(record) {
      if (byKey.has(key(record.username))) return false
      byKey.set(key(record.username), {
        username: record.username,
        saltHex: record.saltHex,
        verifierHex: record.verifierHex,
      })
      return true
    },
    list() {
      return [...byKey.values()]
    },
    get size() {
      return byKey.size
    },
  }
}

/* --------------------------------------------------- register / login ---- */

// Every outcome the demo reports, mirroring the relevant AuthStatus values.
export const STATUS = {
  SUCCESS: 'success',
  INVALID_USERNAME: 'invalid-username',
  USERNAME_TAKEN: 'username-taken',
  PASSWORD_MISMATCH: 'password-mismatch',
  WEAK_PASSWORD: 'weak-password',
  UNKNOWN_USER: 'unknown-user',
  WRONG_PASSWORD: 'wrong-password',
}

// A wrong password and an unknown username return the *identical* message, so
// the login form cannot be used to discover which usernames exist. A test in
// the repo pins these two messages equal.
const INVALID_CREDENTIALS = 'Invalid username or password.'

/**
 * Register an account against the store, mirroring AuthService::registerUser:
 * validate the username, reject a duplicate, require the confirmation to match,
 * enforce the password policy — then generate a fresh salt and derive the
 * verifier (asynchronously, with progress). Resolves with the stored record on
 * success. `options` (onProgress / chunkRounds / signal) is forwarded to
 * deriveAsync.
 */
export async function registerUser(store, { username, password, confirmPassword }, options = {}) {
  const nameCheck = checkUsername(username)
  if (!nameCheck.valid) {
    return { ok: false, status: STATUS.INVALID_USERNAME, message: `Username ${nameCheck.problem}.` }
  }
  if (store.has(username)) {
    return { ok: false, status: STATUS.USERNAME_TAKEN, message: `Username "${username}" is already taken.` }
  }
  if (confirmPassword !== undefined && password !== confirmPassword) {
    return { ok: false, status: STATUS.PASSWORD_MISMATCH, message: 'The two passwords do not match.' }
  }
  const policy = checkPasswordPolicy(password)
  if (!policy.ok) {
    return { ok: false, status: STATUS.WEAK_PASSWORD, message: 'Password is not strong enough. It:', problems: policy.problems }
  }

  const saltHex = generateSaltHex()
  const { verifierHex, elapsedMs } = await deriveAsync(password, saltHex, options)
  const record = { username, saltHex, verifierHex }
  store.add(record)

  return {
    ok: true,
    status: STATUS.SUCCESS,
    message: `Registration successful. Welcome, ${username}!`,
    record,
    elapsedMs,
  }
}

/**
 * Verify credentials against the store, mirroring AuthService::login: an
 * unknown username returns immediately with the same wording as a wrong
 * password (no enumeration); a known username derives the verifier and compares
 * it in constant time. Resolves with the derivation's elapsedMs so the UI can
 * show the per-attempt cost.
 */
export async function loginUser(store, { username, password }, options = {}) {
  const record = store.get(username)
  if (!record) {
    return { ok: false, status: STATUS.UNKNOWN_USER, message: INVALID_CREDENTIALS }
  }

  const { verifierHex, elapsedMs } = await deriveAsync(password, record.saltHex, options)
  if (!constantTimeEqualHex(verifierHex, record.verifierHex)) {
    return { ok: false, status: STATUS.WRONG_PASSWORD, message: INVALID_CREDENTIALS, elapsedMs }
  }

  return {
    ok: true,
    status: STATUS.SUCCESS,
    message: `Login successful. Welcome back, ${record.username}!`,
    elapsedMs,
  }
}
