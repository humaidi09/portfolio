// Faithful in-browser port of the Banking-System core (C++17 → JS).
//
// The system is built around two invariants the real repo never breaks:
//   1. Every amount is EXACT. Money is a whole number of minor units (paisa /
//      cents), never a float — 0.1 + 0.2 must be 0.30, not 0.30000000000000004.
//   2. Every balance is BACKED BY A LEDGER that proves it. Each account keeps an
//      append-only list of movements; the balance is a *derived* quantity, folded
//      from that history (mirrors Account::verifyLedger), never a mutable number
//      you would have to trust.
//
// BigInt is the JS stand-in for the C++ std::int64_t: an exact integer, and the
// natural place to enforce the same signed-64-bit overflow checks.

// ------------------------------------------------------------------- Money --

export const MINOR_PER_MAJOR = 100n // two-decimal currency: 10.00 is the integer 1000

// Signed 64-bit range. Checked arithmetic refuses to leave it (see tryAdd) so a
// corrupted or malicious amount can never wrap around and fabricate money.
export const INT64_MAX = 9223372036854775807n
export const INT64_MIN = -9223372036854775808n

export const Money = {
  // of(12, 50) === 12.50. Mirrors Money::of(major, minor).
  of(major, minor = 0) {
    return BigInt(major) * MINOR_PER_MAJOR + BigInt(minor)
  },

  // Parses "12.50", "-3.05", "100", "0.99", "1.5" (→ 1.50). Returns the exact
  // minor-unit count, or null on anything malformed — it never guesses. A faithful
  // port of Money::parse: at most two decimal places, and a lone sign is not a
  // number.
  parse(text) {
    if (typeof text !== 'string' || text.length === 0) return null

    let i = 0
    let negative = false
    if (text[i] === '+' || text[i] === '-') {
      negative = text[i] === '-'
      i++
    }
    if (i === text.length) return null // a lone sign is not a number

    let major = 0n
    let anyDigit = false
    for (; i < text.length && text[i] !== '.'; i++) {
      const c = text[i]
      if (c < '0' || c > '9') return null
      major = major * 10n + BigInt(c.charCodeAt(0) - 48)
      anyDigit = true
    }

    let minor = 0n
    if (i < text.length && text[i] === '.') {
      i++
      let digits = 0
      for (; i < text.length; i++) {
        const c = text[i]
        if (c < '0' || c > '9') return null
        if (digits >= 2) return null // more than two decimal places is not representable
        minor = minor * 10n + BigInt(c.charCodeAt(0) - 48)
        digits++
        anyDigit = true
      }
      if (digits === 1) minor *= 10n // "1.5" means 1.50
    }

    if (!anyDigit) return null
    const total = major * MINOR_PER_MAJOR + minor
    return negative ? -total : total
  },

  // Two decimals with thousands separators, e.g. "1,234.50", "-12.30", "0.05".
  format(units) {
    const negative = units < 0n
    const value = negative ? -units : units
    const major = (value / MINOR_PER_MAJOR).toString()
    const minor = (value % MINOR_PER_MAJOR).toString().padStart(2, '0')
    const grouped = major.replace(/\B(?=(\d{3})+(?!\d))/g, ',') // group into thousands
    return `${negative ? '-' : ''}${grouped}.${minor}`
  },

  // Checked add: returns null on 64-bit overflow instead of wrapping silently.
  // Mirrors Money::tryAdd — the same guard, so the same amounts are refused.
  tryAdd(a, b) {
    if (b > 0n && a > INT64_MAX - b) return null
    if (b < 0n && a < INT64_MIN - b) return null
    return a + b
  },

  trySubtract(a, b) {
    return Money.tryAdd(a, -b)
  },
}

// --------------------------------------------------------------- Ledger ----

// The kind of movement a ledger line records. Values match the C++ EntryType
// serialisation so a statement reads identically to the CLI's.
export const ENTRY = {
  Open: 'OPEN',
  Deposit: 'DEPOSIT',
  Withdrawal: 'WITHDRAWAL',
  TransferIn: 'TRANSFER_IN',
  TransferOut: 'TRANSFER_OUT',
}

export const ENTRY_LABEL = {
  OPEN: 'Open',
  DEPOSIT: 'Deposit',
  WITHDRAWAL: 'Withdrawal',
  TRANSFER_IN: 'Transfer in',
  TRANSFER_OUT: 'Transfer out',
}

// Does this movement add to the balance (credit) or take from it (debit)? This is
// exactly the sign the C++ verifyLedger fold applies per entry type.
export function isCredit(type) {
  return type === ENTRY.Open || type === ENTRY.Deposit || type === ENTRY.TransferIn
}

// Fold an append-only ledger into per-line running balances. The balance is
// PROVEN by replaying the history from zero — never stored as a number we would
// have to trust. This is Account::verifyLedger's replay, returning each step so
// the demo can show a running-balance column.
export function foldLedger(ledger) {
  let running = 0n
  return ledger.map((e, index) => {
    if (e.type === ENTRY.Open) running = e.amount // opening entry sets the starting balance
    else if (isCredit(e.type)) running = running + e.amount
    else running = running - e.amount
    return { ...e, seq: index + 1, balanceAfter: running }
  })
}

// An account's balance is the last running total its ledger folds to.
export function balanceOf(account) {
  let running = 0n
  for (const e of account.ledger) {
    if (e.type === ENTRY.Open) running = e.amount
    else if (isCredit(e.type)) running = running + e.amount
    else running = running - e.amount
  }
  return running
}

// ----------------------------------------------------------------- Bank ----

// A distinct code per failure — the caller reacts on the code, not on message
// wording (keeps behaviour testable and lets the UI colour errors consistently).
export const STATUS = {
  Ok: 'Ok',
  AccountNotFound: 'AccountNotFound',
  InvalidAmount: 'InvalidAmount', // zero or negative where a positive amount is required
  InsufficientFunds: 'InsufficientFunds',
  Overflow: 'Overflow', // the operation would exceed the representable range
  SameAccount: 'SameAccount', // transfer source and destination are equal
  EmptyOwnerName: 'EmptyOwnerName',
}

export function statusMessage(status) {
  switch (status) {
    case STATUS.Ok: return 'OK'
    case STATUS.AccountNotFound: return 'No account exists with that number.'
    case STATUS.InvalidAmount: return 'Amount must be greater than zero.'
    case STATUS.InsufficientFunds: return 'Insufficient funds for this operation.'
    case STATUS.Overflow: return 'Amount is too large to process.'
    case STATUS.SameAccount: return 'Source and destination accounts must differ.'
    case STATUS.EmptyOwnerName: return 'Account holder name must not be empty.'
    default: return 'Unknown error.'
  }
}

// The bank state is plain and immutable: a list of accounts and the next id to
// hand out. Operations never mutate it — they return a fresh bank (and leave the
// old one untouched on failure, which is what makes "a refused op changes
// nothing" true by construction). nextId starts at 1001, a human-friendly number.
export function createBank() {
  return { accounts: [], nextId: 1001 }
}

export function findAccount(bank, id) {
  return bank.accounts.find((a) => a.id === id)
}

// Accounts sorted ascending by number — the order the C++ std::map iterates.
export function listAccounts(bank) {
  return [...bank.accounts].sort((a, b) => a.id - b.id)
}

// The bank's total liabilities: the sum of every (ledger-derived) balance.
export function totalDeposits(bank) {
  return bank.accounts.reduce((sum, a) => sum + balanceOf(a), 0n)
}

const okResult = (bank, accountId, balance) => ({ status: STATUS.Ok, bank, accountId, balance })
const failResult = (bank, status, accountId = 0) => ({ status, bank, accountId, balance: 0n })

// Returns a new bank with `entry` appended to account `id`'s ledger.
function appendEntry(bank, id, entry) {
  return {
    ...bank,
    accounts: bank.accounts.map((a) => (a.id === id ? { ...a, ledger: [...a.ledger, entry] } : a)),
  }
}

// Opens a new account with the next sequential id. The opening balance is
// optional but may not be negative. The name is rejected if it is only
// whitespace, but stored as given (faithful to Bank::openAccount).
export function openAccount(bank, owner, openingBalance = 0n) {
  if (owner.trim().length === 0) return failResult(bank, STATUS.EmptyOwnerName)
  if (openingBalance < 0n) return failResult(bank, STATUS.InvalidAmount)

  const id = bank.nextId
  const account = {
    id,
    owner,
    // Every account is born with an OPEN entry — the ledger has no gaps.
    ledger: [{ type: ENTRY.Open, amount: openingBalance, counterparty: 0, note: 'account opened' }],
  }
  const next = { accounts: [...bank.accounts, account], nextId: id + 1 }
  return okResult(next, id, openingBalance)
}

export function deposit(bank, id, amount, note = '') {
  const account = findAccount(bank, id)
  if (!account) return failResult(bank, STATUS.AccountNotFound, id)
  if (amount <= 0n) return failResult(bank, STATUS.InvalidAmount, id)

  const newBalance = Money.tryAdd(balanceOf(account), amount) // checked: refuse to overflow
  if (newBalance === null) return failResult(bank, STATUS.Overflow, id)

  const next = appendEntry(bank, id, { type: ENTRY.Deposit, amount, counterparty: 0, note })
  return okResult(next, id, newBalance)
}

export function withdraw(bank, id, amount, note = '') {
  const account = findAccount(bank, id)
  if (!account) return failResult(bank, STATUS.AccountNotFound, id)
  if (amount <= 0n) return failResult(bank, STATUS.InvalidAmount, id)

  const balance = balanceOf(account)
  if (balance < amount) return failResult(bank, STATUS.InsufficientFunds, id) // no overdraft, ever

  const next = appendEntry(bank, id, { type: ENTRY.Withdrawal, amount, counterparty: 0, note })
  return okResult(next, id, balance - amount)
}

// Moves money between two accounts. Atomic: every failure is checked BEFORE
// either ledger is touched, so a refused transfer leaves both sides untouched and
// a successful one conserves the bank's total. Check order matches Bank::transfer.
export function transfer(bank, fromId, toId, amount, note = '') {
  if (fromId === toId) return failResult(bank, STATUS.SameAccount, fromId)
  if (amount <= 0n) return failResult(bank, STATUS.InvalidAmount, fromId)

  const from = findAccount(bank, fromId)
  const to = findAccount(bank, toId)
  if (!from || !to) return failResult(bank, STATUS.AccountNotFound, fromId)

  const fromBalance = balanceOf(from)
  if (fromBalance < amount) return failResult(bank, STATUS.InsufficientFunds, fromId)

  // Check the credit side for overflow before moving anything.
  if (Money.tryAdd(balanceOf(to), amount) === null) return failResult(bank, STATUS.Overflow, fromId)

  // Both legs, now that both are known safe.
  let next = appendEntry(bank, fromId, { type: ENTRY.TransferOut, amount, counterparty: toId, note })
  next = appendEntry(next, toId, { type: ENTRY.TransferIn, amount, counterparty: fromId, note })
  return okResult(next, fromId, fromBalance - amount)
}

// -------------------------------------------------------------- Sample -----

// Two pre-loaded accounts, built by running the very operations above — so the
// opening balances and ledgers are authentic, not hand-typed. This reproduces
// examples/demo_bank.txt exactly: Ada 1,250.75 and Grace 599.25 (1,850.00 total).
export function sampleBank() {
  let b = createBank()
  const ada = openAccount(b, 'Ada Lovelace', Money.of(1000))
  b = ada.bank
  const grace = openAccount(b, 'Grace Hopper', Money.of(500))
  b = grace.bank
  b = deposit(b, ada.accountId, Money.of(500), 'salary').bank
  b = withdraw(b, ada.accountId, Money.of(150), 'rent').bank
  b = transfer(b, ada.accountId, grace.accountId, Money.of(99, 25), 'split dinner').bank
  return b
}
