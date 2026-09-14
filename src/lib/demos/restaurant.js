// Faithful in-browser port of the Restaurant-Management-System core (Python → JS).
//
// Two ideas from the repo carry the demo:
//   1. Money is exact. The Python side uses Decimal quantised to two places with
//      ROUND_HALF_UP; here we hold every amount as an integer number of cents and
//      never let a binary float touch a total. Rates are applied as integer
//      numerator/denominator pairs so the rounding is exact and reproducible.
//   2. An order is a small state machine. The legal moves live in one transition
//      table (mirroring _ALLOWED_TRANSITIONS), not scattered `if status == …`.
//
// One deliberate divergence from the repo's default config, matching the pattern
// set by the CGPA demo: the write-up and slides quote a 12.5% service charge, so
// that is what the demo uses (the repo's BillConfig defaults to 10%). Everything
// else — the discount→service→tax order, rounding each step before the next, and
// the discount cap — is exactly the repo's compute_bill.

/* --------------------------------------------------------------- money ---- */

/** Exact half-up rounding of the integer ratio numer/denom (handles sign). */
export function roundHalfUp(numer, denom) {
  if (numer < 0) return -roundHalfUp(-numer, denom)
  return Math.floor((numer * 2 + denom) / (denom * 2))
}

/**
 * Parse a monetary amount to an integer number of cents. Mirrors money():
 * strings/ints are accepted and quantised to two places (ROUND_HALF_UP on the
 * third decimal); a JS float is refused outright, because the value is already
 * imprecise before it reaches us.
 */
export function toCents(value) {
  if (typeof value === 'number' && !Number.isInteger(value)) {
    throw new TypeError("refusing to build money from a float; pass a string like '9.99'")
  }
  const m = /^(-?)(\d+)(?:\.(\d+))?$/.exec(String(value).trim())
  if (!m) throw new Error(`not a valid monetary amount: ${value}`)
  const sign = m[1] === '-' ? -1 : 1
  const frac = m[3] || ''
  let cents = Number(m[2]) * 100 + Number((frac + '00').slice(0, 2))
  if (frac.length > 2 && Number(frac[2]) >= 5) cents += 1 // ROUND_HALF_UP
  return sign * cents
}

/** Render cents as "$1,234.50" — display only; all arithmetic stays in cents. */
export function formatMoney(cents, symbol = '$') {
  const sign = cents < 0 ? '-' : ''
  const abs = Math.abs(cents)
  const dollars = Math.floor(abs / 100).toLocaleString('en-US')
  return `${sign}${symbol}${dollars}.${String(abs % 100).padStart(2, '0')}`
}

/* ---------------------------------------------------------------- bill ---- */

// Rates as exact integer fractions [numerator, denominator]. Service charge is
// 12.5% per the write-up (see the module header); tax is 5%, as in the repo.
export const BILL_CONFIG = {
  serviceCharge: [125, 1000], // 12.5%
  tax: [5, 100], // 5%
}

/** Percentage label for a rate, e.g. [125,1000] → "12.5%". */
export function ratePercent([num, den]) {
  return `${+((num / den) * 100).toFixed(4)}%`
}

const applyRate = (cents, [num, den]) => roundHalfUp(cents * num, den)

/**
 * The money value of a discount for a given subtotal, never more than the
 * subtotal itself. `discount` is null, {kind:'percent', rate:[n,d]} or
 * {kind:'amount', cents}. Faithful to Discount.applied_to + its min() cap.
 */
export function discountValue(subtotalCents, discount) {
  if (!discount) return 0
  const raw = discount.kind === 'percent' ? applyRate(subtotalCents, discount.rate) : discount.cents
  return Math.min(raw, subtotalCents)
}

/**
 * Compute the itemised bill from a subtotal (in cents). Pure. The order is
 * fixed and each intermediate is rounded to the cent before the next, so the
 * printed lines always add up to the printed total:
 *   subtotal → −discount → +service charge → +tax → total
 */
export function computeBill(subtotalCents, { discount = null, config = BILL_CONFIG } = {}) {
  const discountCents = discountValue(subtotalCents, discount)
  const discounted = subtotalCents - discountCents
  const serviceCharge = applyRate(discounted, config.serviceCharge)
  const taxable = discounted + serviceCharge
  const tax = applyRate(taxable, config.tax)
  const total = taxable + tax
  return { subtotal: subtotalCents, discount: discountCents, discounted, serviceCharge, taxable, tax, total }
}

/* --------------------------------------------------------------- order ---- */

export const OrderStatus = {
  OPEN: 'OPEN', // being built; items can be added or removed
  PLACED: 'PLACED', // sent to the kitchen; locked for editing
  SERVED: 'SERVED', // delivered to the table
  PAID: 'PAID', // settled; terminal
  CANCELLED: 'CANCELLED', // abandoned; terminal
}

// Which statuses each status may move to. Terminal states map to []. This is
// the whole lifecycle, in one readable place — the repo's _ALLOWED_TRANSITIONS.
export const ALLOWED_TRANSITIONS = {
  [OrderStatus.OPEN]: [OrderStatus.PLACED, OrderStatus.CANCELLED],
  [OrderStatus.PLACED]: [OrderStatus.SERVED, OrderStatus.CANCELLED],
  [OrderStatus.SERVED]: [OrderStatus.PAID],
  [OrderStatus.PAID]: [],
  [OrderStatus.CANCELLED]: [],
}

/** The legal next states for a status (empty for a terminal state). */
export const nextStates = (status) => ALLOWED_TRANSITIONS[status] ?? []

/** Whether `from → to` is a legal transition. */
export const canTransition = (from, to) => nextStates(from).includes(to)

/** Only OPEN orders can be edited — mirrors Order._require(OPEN). */
export const isEditable = (status) => status === OrderStatus.OPEN

/** Exact line subtotal in cents: unit price × quantity (quantity is a whole number). */
export const lineSubtotal = (unitCents, qty) => unitCents * qty

/** Order subtotal in cents: the sum of every line's subtotal. */
export const orderSubtotal = (lines) => lines.reduce((sum, l) => sum + lineSubtotal(l.unitCents, l.qty), 0)

/** Total number of items across the order. */
export const itemCount = (lines) => lines.reduce((n, l) => n + l.qty, 0)

/* ---------------------------------------------------------------- menu ---- */

// A small menu for "The Terminal Table" (the repo's default restaurant name).
// Prices are strings so no float ever seeds the money; `cents` is derived once.
const item = (code, name, price, category) => ({ code, name, price, cents: toCents(price), category, available: true })

export const MENU = [
  item('GARL', 'Garlic Bread', '4.50', 'Starters'),
  item('SOUP', 'Soup of the Day', '5.00', 'Starters'),
  item('MARG', 'Margherita Pizza', '12.00', 'Mains'),
  item('PASTA', 'Pasta Alfredo', '11.50', 'Mains'),
  item('BURG', 'Classic Burger', '10.50', 'Mains'),
  item('GRILL', 'Grilled Chicken', '13.00', 'Mains'),
  item('CAKE', 'Chocolate Cake', '6.00', 'Desserts'),
  item('ICE', 'Ice Cream', '3.50', 'Desserts'),
  item('COFF', 'Espresso', '3.00', 'Drinks'),
  item('JUICE', 'Fresh Juice', '4.00', 'Drinks'),
  item('COLA', 'Cola', '2.50', 'Drinks'),
]

export const MENU_BY_CODE = new Map(MENU.map((i) => [i.code, i]))

// Category display order for the menu panel.
export const CATEGORIES = ['Starters', 'Mains', 'Desserts', 'Drinks']

// A sample order that opens on a subtotal of exactly $36.50 — so with the
// default 10% loyalty discount the bill lands on the write-up's $38.81.
export const INITIAL_ORDER = [
  { code: 'MARG', qty: 1 }, // 12.00
  { code: 'PASTA', qty: 1 }, // 11.50
  { code: 'GARL', qty: 1 }, //  4.50
  { code: 'CAKE', qty: 1 }, //  6.00
  { code: 'COLA', qty: 1 }, //  2.50
] //                        = 36.50

// Discount options offered in the UI. The 10% loyalty discount is the default
// so the demo opens on the canonical worked example.
export const DISCOUNTS = {
  none: { label: 'No discount', discount: null },
  loyalty10: { label: '10% loyalty', discount: { kind: 'percent', rate: [10, 100] } },
  fixed5: { label: '$5.00 off', discount: { kind: 'amount', cents: 500 } },
}
