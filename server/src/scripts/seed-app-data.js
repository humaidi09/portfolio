import 'dotenv/config'
import { connectDB } from '../db.js'
import AppDataset from '../models/AppDataset.js'

/**
 * Seed the editable content of the six standalone apps into the AppDataset
 * collection, so every app can be updated live from /admin → Apps.
 *
 * NON-DESTRUCTIVE and idempotent: each dataset is upserted with `$setOnInsert`,
 * so a brand-new dataset is created with its bundled defaults, but a dataset
 * that already exists is left EXACTLY as it is — anything edited in /admin is
 * never overwritten. Safe to re-run after a deploy.
 *
 * The data below mirrors each app's current bundled source verbatim (the same
 * values the app falls back to when offline), so seeding changes nothing a
 * visitor sees until the owner edits a value in the admin.
 *
 *   node src/scripts/seed-app-data.js
 *
 * Field types drive the admin inputs: 'string' | 'number' | 'boolean' | 'json'
 * (nested arrays/objects edit as JSON). Anything unlisted defaults to 'string'.
 */

/* ------------------------------------------------------------- worldcup ---- */

// The 48 real qualified teams, verbatim from worldcup/src/engine/worldcup.js.
const WORLDCUP_TEAMS = [
  { code: 'USA', name: 'United States', confederation: 'CONCACAF', pot: 1, host: true, elo: 1746 },
  { code: 'MEX', name: 'Mexico', confederation: 'CONCACAF', pot: 1, host: true, elo: 1913 },
  { code: 'CAN', name: 'Canada', confederation: 'CONCACAF', pot: 1, host: true, elo: 1729 },
  { code: 'ESP', name: 'Spain', confederation: 'UEFA', pot: 1, host: false, elo: 2259 },
  { code: 'ARG', name: 'Argentina', confederation: 'CONMEBOL', pot: 1, host: false, elo: 2173 },
  { code: 'FRA', name: 'France', confederation: 'UEFA', pot: 1, host: false, elo: 2070 },
  { code: 'ENG', name: 'England', confederation: 'UEFA', pot: 1, host: false, elo: 2125 },
  { code: 'BRA', name: 'Brazil', confederation: 'CONMEBOL', pot: 1, host: false, elo: 1993 },
  { code: 'POR', name: 'Portugal', confederation: 'UEFA', pot: 1, host: false, elo: 1995 },
  { code: 'NED', name: 'Netherlands', confederation: 'UEFA', pot: 1, host: false, elo: 1971 },
  { code: 'BEL', name: 'Belgium', confederation: 'UEFA', pot: 1, host: false, elo: 1947 },
  { code: 'GER', name: 'Germany', confederation: 'UEFA', pot: 1, host: false, elo: 1907 },
  { code: 'CRO', name: 'Croatia', confederation: 'UEFA', pot: 2, host: false, elo: 1881 },
  { code: 'MAR', name: 'Morocco', confederation: 'CAF', pot: 2, host: false, elo: 1901 },
  { code: 'COL', name: 'Colombia', confederation: 'CONMEBOL', pot: 2, host: false, elo: 2003 },
  { code: 'URU', name: 'Uruguay', confederation: 'CONMEBOL', pot: 2, host: false, elo: 1841 },
  { code: 'SUI', name: 'Switzerland', confederation: 'UEFA', pot: 2, host: false, elo: 1928 },
  { code: 'JPN', name: 'Japan', confederation: 'AFC', pot: 2, host: false, elo: 1888 },
  { code: 'SEN', name: 'Senegal', confederation: 'CAF', pot: 2, host: false, elo: 1816 },
  { code: 'IRN', name: 'Iran', confederation: 'AFC', pot: 2, host: false, elo: 1764 },
  { code: 'KOR', name: 'South Korea', confederation: 'AFC', pot: 2, host: false, elo: 1723 },
  { code: 'ECU', name: 'Ecuador', confederation: 'CONMEBOL', pot: 2, host: false, elo: 1871 },
  { code: 'AUT', name: 'Austria', confederation: 'UEFA', pot: 2, host: false, elo: 1821 },
  { code: 'AUS', name: 'Australia', confederation: 'AFC', pot: 2, host: false, elo: 1795 },
  { code: 'NOR', name: 'Norway', confederation: 'UEFA', pot: 3, host: false, elo: 1952 },
  { code: 'PAN', name: 'Panama', confederation: 'CONCACAF', pot: 3, host: false, elo: 1658 },
  { code: 'EGY', name: 'Egypt', confederation: 'CAF', pot: 3, host: false, elo: 1742 },
  { code: 'ALG', name: 'Algeria', confederation: 'CAF', pot: 3, host: false, elo: 1756 },
  { code: 'SCO', name: 'Scotland', confederation: 'UEFA', pot: 3, host: false, elo: 1746 },
  { code: 'PAR', name: 'Paraguay', confederation: 'CONMEBOL', pot: 3, host: false, elo: 1814 },
  { code: 'TUN', name: 'Tunisia', confederation: 'CAF', pot: 3, host: false, elo: 1562 },
  { code: 'CIV', name: 'Ivory Coast', confederation: 'CAF', pot: 3, host: false, elo: 1728 },
  { code: 'UZB', name: 'Uzbekistan', confederation: 'AFC', pot: 3, host: false, elo: 1630 },
  { code: 'QAT', name: 'Qatar', confederation: 'AFC', pot: 3, host: false, elo: 1411 },
  { code: 'KSA', name: 'Saudi Arabia', confederation: 'AFC', pot: 3, host: false, elo: 1596 },
  { code: 'RSA', name: 'South Africa', confederation: 'CAF', pot: 3, host: false, elo: 1560 },
  { code: 'JOR', name: 'Jordan', confederation: 'AFC', pot: 4, host: false, elo: 1628 },
  { code: 'CPV', name: 'Cape Verde', confederation: 'CAF', pot: 4, host: false, elo: 1619 },
  { code: 'GHA', name: 'Ghana', confederation: 'CAF', pot: 4, host: false, elo: 1571 },
  { code: 'CUW', name: 'Curacao', confederation: 'CONCACAF', pot: 4, host: false, elo: 1438 },
  { code: 'HAI', name: 'Haiti', confederation: 'CONCACAF', pot: 4, host: false, elo: 1517 },
  { code: 'NZL', name: 'New Zealand', confederation: 'OFC', pot: 4, host: false, elo: 1534 },
  { code: 'BIH', name: 'Bosnia and Herzegovina', confederation: 'UEFA', pot: 4, host: false, elo: 1605 },
  { code: 'SWE', name: 'Sweden', confederation: 'UEFA', pot: 4, host: false, elo: 1731 },
  { code: 'TUR', name: 'Turkey', confederation: 'UEFA', pot: 4, host: false, elo: 1852 },
  { code: 'CZE', name: 'Czech Republic', confederation: 'UEFA', pot: 4, host: false, elo: 1680 },
  { code: 'COD', name: 'DR Congo', confederation: 'CAF', pot: 4, host: false, elo: 1704 },
  { code: 'IRQ', name: 'Iraq', confederation: 'AFC', pot: 4, host: false, elo: 1561 },
]

/* ----------------------------------------------------------- restaurant ---- */

const RESTAURANT_MENU = [
  { code: 'GARL', name: 'Garlic Bread', price: '4.50', category: 'Starters', available: true },
  { code: 'SOUP', name: 'Soup of the Day', price: '5.00', category: 'Starters', available: true },
  { code: 'MARG', name: 'Margherita Pizza', price: '12.00', category: 'Mains', available: true },
  { code: 'PASTA', name: 'Pasta Alfredo', price: '11.50', category: 'Mains', available: true },
  { code: 'BURG', name: 'Classic Burger', price: '10.50', category: 'Mains', available: true },
  { code: 'GRILL', name: 'Grilled Chicken', price: '13.00', category: 'Mains', available: true },
  { code: 'CAKE', name: 'Chocolate Cake', price: '6.00', category: 'Desserts', available: true },
  { code: 'ICE', name: 'Ice Cream', price: '3.50', category: 'Desserts', available: true },
  { code: 'COFF', name: 'Espresso', price: '3.00', category: 'Drinks', available: true },
  { code: 'JUICE', name: 'Fresh Juice', price: '4.00', category: 'Drinks', available: true },
  { code: 'COLA', name: 'Cola', price: '2.50', category: 'Drinks', available: true },
]

// The discount options; `discount` is the raw shape the engine reads (null, a
// {kind:'percent', rate:[n,d]} or {kind:'amount', cents}).
const RESTAURANT_DISCOUNTS = [
  { key: 'none', label: 'No discount', discount: null },
  { key: 'loyalty10', label: '10% loyalty', discount: { kind: 'percent', rate: [10, 100] } },
  { key: 'fixed5', label: '$5.00 off', discount: { kind: 'amount', cents: 500 } },
]

/* ---------------------------------------------------------------- cgpa ----- */

const CGPA_PROFILES = [
  {
    id: 'std-4', name: '4.00 Scale', scaleMax: 4, editable: false,
    grades: [
      { grade: 'A+', point: 4.0 }, { grade: 'A', point: 3.75 }, { grade: 'A-', point: 3.5 },
      { grade: 'B+', point: 3.25 }, { grade: 'B', point: 3.0 }, { grade: 'B-', point: 2.75 },
      { grade: 'C+', point: 2.5 }, { grade: 'C', point: 2.25 }, { grade: 'D', point: 2.0 },
      { grade: 'F', point: 0.0 },
    ],
  },
  {
    id: 'std-5', name: '5.00 Scale', scaleMax: 5, editable: false,
    grades: [
      { grade: 'A', point: 5.0 }, { grade: 'B', point: 4.0 }, { grade: 'C', point: 3.0 },
      { grade: 'D', point: 2.0 }, { grade: 'E', point: 1.0 }, { grade: 'F', point: 0.0 },
    ],
  },
]

// Honours bands on the 4.00 scale — the UGC ranges classify() encodes.
const CGPA_CLASSIFICATION = [
  { min: 3.75, label: 'First Class' },
  { min: 3.25, label: 'Very Good' },
  { min: 2.75, label: 'Good' },
  { min: 2.25, label: 'Satisfactory' },
  { min: 2.0, label: 'Pass' },
  { min: 0.0, label: 'Below pass' },
]

/* --------------------------------------------------------------- nonet ----- */

const NONET_LESSONS = [
  {
    id: 'scanning', title: 'Scanning', level: 'Beginner', minutes: 3, practice: 'single',
    summary: 'Place a digit by ruling out rows, columns, and boxes — the first skill.',
    body: [
      { h: 'Cross-hatch a box', p: 'Pick a digit and one 3x3 box. Any row or column that already contains that digit is closed to it, so mentally strike those lines through the box. If a single empty cell is left untouched, the digit must go there.' },
      { h: 'Sweep every box', p: 'Work one digit at a time across all nine boxes. Digits that already appear several times are the easiest to place, because more rows and columns are blocked and fewer cells survive.' },
      { h: 'Why it works', p: 'Each row, column, and box holds every digit exactly once. Scanning simply removes every square a digit is forbidden from until one lawful home remains.' },
    ],
  },
  {
    id: 'naked-single', title: 'Naked Single', level: 'Beginner', minutes: 3, practice: 'single',
    summary: 'A cell where only a single digit can legally fit.',
    body: [
      { h: 'One cell, one option', p: 'A naked single is an empty cell whose row, column, and box already show eight different digits between them. Only the ninth digit is left, so it is forced into that cell.' },
      { h: 'How to spot it', p: 'Choose a nearly full region and look at an empty cell inside it. List the digits visible in its row, column, and box. When that list reaches eight, the missing digit is your answer.' },
      { h: 'Place and repeat', p: 'Writing a naked single often creates more of them, because the digit you placed is now banned from its peers. Keep filling the easy cells before reaching for harder methods.' },
    ],
  },
  {
    id: 'hidden-single', title: 'Hidden Single', level: 'Beginner', minutes: 4, practice: 'single',
    summary: 'A digit that has only one legal home in a row, column, or box.',
    body: [
      { h: 'Hidden in plain sight', p: 'A hidden single is a digit that can go in just one cell of a unit, even when that cell still has other candidates. The cell is not down to one option — the digit is down to one place.' },
      { h: 'Search a unit at a time', p: 'Take one row, column, or box and one digit. Rule out every cell where that digit is blocked by a peer. If exactly one cell remains, the digit belongs there.' },
      { h: 'Naked versus hidden', p: 'A naked single is about the cell: only one digit fits it. A hidden single is about the digit: only one cell fits it. Together they solve most gentle puzzles.' },
      { h: 'The common miss', p: 'Hidden singles hide behind busy pencil marks, so they are easy to skip over. Scanning digit by digit within a unit brings them into view.' },
    ],
  },
  {
    id: 'notes', title: 'Pencil Marks', level: 'Beginner', minutes: 3, practice: 'notes',
    summary: 'Track candidates with pencil marks so patterns become visible.',
    body: [
      { h: 'What pencil marks are', p: 'Pencil marks, or candidates, are the tiny digits you jot in a cell to remember which numbers could still go there. They turn a tiring mental search into simple reading.' },
      { h: 'Keep them honest', p: 'Only mark a digit when it is truly legal — not already present in the cell row, column, or box. Each time you place a number, rub it out of the pencil marks of every peer.' },
      { h: 'Read the marks', p: 'With candidates in place the techniques become visual. A cell showing a single mark is a naked single; a digit that appears only once among a unit marks is a hidden single.' },
    ],
  },
  {
    id: 'pointing-pairs', title: 'Pointing Pairs', level: 'Intermediate', minutes: 5, practice: 'read',
    summary: 'Candidates locked to one line inside a box clear that line elsewhere.',
    body: [
      { h: 'Candidates that point', p: 'If, inside a single box, a digit can only go in cells that share one row or one column, then that digit is committed to that line within the box.' },
      { h: 'Make the elimination', p: 'Because the digit must land on that line inside this box, it cannot appear on the same line in the two neighbouring boxes. Erase the digit from those cells.' },
      { h: 'Where to look', p: 'Scan each box for a digit with only two or three candidates. When they line up in a single row or column, you have a pointing pair or triple and can clear that line beyond the box.' },
    ],
  },
  {
    id: 'box-line-reduction', title: 'Box/Line Reduction', level: 'Intermediate', minutes: 5, practice: 'read',
    summary: 'A digit confined to one box within a line clears the rest of that box.',
    body: [
      { h: 'The mirror of pointing', p: 'Box and line reduction runs the opposite way. If the only cells where a digit can go in a row or column all fall inside a single box, the digit must sit on that line within that box.' },
      { h: 'Make the elimination', p: 'Since the digit is now tied to that line inside the box, it cannot occupy any other cell in the box. Remove the candidate from the box other rows and columns.' },
      { h: 'Pointing versus reduction', p: 'A pointing pair uses a box to clear a line; box and line reduction uses a line to clear a box. Knowing both settles most intermediate grids.' },
    ],
  },
  {
    id: 'x-wing', title: 'X-Wing', level: 'Advanced', minutes: 6, practice: 'read',
    summary: 'A four-corner rectangle across two lines that removes a candidate.',
    body: [
      { h: 'The pattern', p: 'Find a digit that is a candidate in exactly two cells of one row, and in exactly two cells of another row, with both pairs lying in the same two columns. Those four cells mark the corners of a rectangle.' },
      { h: 'Why it eliminates', p: 'The digit must take opposite corners of the rectangle, one in each row. Whichever diagonal it chooses, both columns end up used. So the digit can be removed from every other cell in those two columns.' },
      { h: 'Rows or columns', p: 'The X-Wing works just as well with the roles swapped: two columns whose candidate is pinned to the same two rows let you clear the digit from those rows.' },
      { h: 'How to spot it', p: 'Turn on pencil marks and hunt for a digit with only two candidates in a line. Note its two columns, then look for a second line that pins the same digit to the very same columns.' },
    ],
  },
]

const NONET_TECHNIQUES = [
  { key: 'naked-single', label: 'Naked single', lesson: 'naked-single', blurb: 'Only one digit can legally go in this cell.' },
  { key: 'hidden-single', label: 'Hidden single', lesson: 'hidden-single', blurb: 'Within a unit, this digit fits in only one cell.' },
  { key: 'reveal', label: 'Revealed', lesson: 'scanning', blurb: 'This one needs an advanced technique — here is the answer for this cell.' },
]

/* -------------------------------------------------------------- banking ---- */

const BANKING_PRINCIPLES = [
  { icon: 'coins', title: 'Money is exact', body: 'Every amount is a whole number of minor units — cents, not dollars. There are no floats anywhere in the money path, so rounding drift is impossible.' },
  { icon: 'scale', title: 'Balances are derived', body: 'A balance is never stored as a number you must trust. It is folded from the account’s ledger on demand: replay the history from zero and you get the figure.' },
  { icon: 'scroll', title: 'The ledger is append-only', body: 'Movements are only ever appended. Nothing is edited or deleted, so any balance can be re-proven from the very first entry at any time.' },
  { icon: 'transfer', title: 'Transfers are atomic', body: 'A transfer validates both sides before touching either ledger. If anything fails, nothing moves — and a successful transfer conserves the bank’s total to the cent.' },
  { icon: 'shield', title: 'No overdraft, no overflow', body: 'Withdrawals can never exceed the balance, and checked 64-bit arithmetic refuses any amount that would overflow rather than silently wrapping.' },
]

/* ---------------------------------------------------------------- login ---- */

// The handful of passwords in every breach list (kBanned in password.cpp).
const LOGIN_BANNED = [
  'password', '12345678', 'qwerty123', 'letmein', 'admin123',
  'password1', 'welcome1', 'iloveyou', 'abc12345',
].map((password) => ({ password }))

/* ------------------------------------------------------------ the datasets - */

const DATASETS = [
  // ---- worldcup ----
  {
    app: 'worldcup', slug: 'teams', kind: 'list', order: 0, label: 'Teams',
    fields: ['code', 'name', 'confederation', 'pot', 'host', 'elo'],
    fieldTypes: { code: 'string', name: 'string', confederation: 'string', pot: 'number', host: 'boolean', elo: 'number' },
    data: WORLDCUP_TEAMS,
  },
  {
    app: 'worldcup', slug: 'settings', kind: 'singleton', order: 1, label: 'Tournament settings',
    // Exactly the fields the app's applyRemoteData reads: the baseGoals + goalTilt
    // model knobs and the eloSource/eloAsOf/note provenance strings shown on the
    // Draw/Ratings/Method screens (all live on this one settings object).
    fields: ['baseGoals', 'goalTilt', 'eloSource', 'eloAsOf', 'note'],
    fieldTypes: { baseGoals: 'number', goalTilt: 'number', eloSource: 'string', eloAsOf: 'string', note: 'string' },
    data: {
      baseGoals: 1.35,
      goalTilt: 0.6,
      eloSource: 'eloratings.net (World Football Elo Ratings)',
      eloAsOf: '2026-07-19',
      note: 'A dated Elo snapshot for reproducible simulation, not live values.',
    },
  },

  // ---- restaurant ----
  {
    app: 'restaurant', slug: 'menu', kind: 'list', order: 0, label: 'Menu items',
    fields: ['code', 'name', 'price', 'category', 'available'],
    fieldTypes: { code: 'string', name: 'string', price: 'string', category: 'string', available: 'boolean' },
    data: RESTAURANT_MENU,
  },
  {
    app: 'restaurant', slug: 'categories', kind: 'list', order: 1, label: 'Categories',
    fields: ['name'], fieldTypes: { name: 'string' },
    data: [{ name: 'Starters' }, { name: 'Mains' }, { name: 'Desserts' }, { name: 'Drinks' }],
  },
  {
    app: 'restaurant', slug: 'settings', kind: 'singleton', order: 2, label: 'Restaurant settings',
    fields: ['name', 'currencySymbol', 'serviceChargePercent', 'taxPercent'],
    fieldTypes: { name: 'string', currencySymbol: 'string', serviceChargePercent: 'number', taxPercent: 'number' },
    data: { name: 'The Terminal Table', currencySymbol: '$', serviceChargePercent: 12.5, taxPercent: 5 },
  },
  {
    app: 'restaurant', slug: 'discounts', kind: 'list', order: 3, label: 'Discounts',
    fields: ['key', 'label', 'discount'],
    fieldTypes: { key: 'string', label: 'string', discount: 'json' },
    data: RESTAURANT_DISCOUNTS,
  },

  // ---- cgpa ----
  {
    app: 'cgpa', slug: 'profiles', kind: 'list', order: 0, label: 'Grading scales',
    fields: ['id', 'name', 'scaleMax', 'editable', 'grades'],
    fieldTypes: { id: 'string', name: 'string', scaleMax: 'number', editable: 'boolean', grades: 'json' },
    data: CGPA_PROFILES,
  },
  {
    app: 'cgpa', slug: 'classification', kind: 'list', order: 1, label: 'Honours bands',
    fields: ['min', 'label'], fieldTypes: { min: 'number', label: 'string' },
    data: CGPA_CLASSIFICATION,
  },

  // ---- nonet (sudoku) ----
  {
    app: 'nonet', slug: 'lessons', kind: 'list', order: 0, label: 'Learn lessons',
    fields: ['id', 'title', 'level', 'minutes', 'summary', 'practice', 'body'],
    fieldTypes: { id: 'string', title: 'string', level: 'string', minutes: 'number', summary: 'string', practice: 'string', body: 'json' },
    data: NONET_LESSONS,
  },
  {
    app: 'nonet', slug: 'techniques', kind: 'list', order: 1, label: 'Hint techniques',
    fields: ['key', 'label', 'lesson', 'blurb'],
    fieldTypes: { key: 'string', label: 'string', lesson: 'string', blurb: 'string' },
    data: NONET_TECHNIQUES,
  },

  // ---- banking ----
  {
    app: 'banking', slug: 'settings', kind: 'singleton', order: 0, label: 'Bank settings',
    fields: ['currencySymbol'],
    fieldTypes: { currencySymbol: 'string' },
    data: { currencySymbol: '$' },
  },
  {
    app: 'banking', slug: 'principles', kind: 'list', order: 1, label: 'Integrity principles',
    fields: ['icon', 'title', 'body'],
    fieldTypes: { icon: 'string', title: 'string', body: 'string' },
    data: BANKING_PRINCIPLES,
  },

  // ---- login ----
  {
    app: 'login', slug: 'settings', kind: 'singleton', order: 0, label: 'Password hashing',
    // Only hashIterations is consumed by the app (auth.js applyAuthSettings). Each
    // account stores the iteration count it was created with, so raising this only
    // affects NEW registrations — existing logins verify with their own stored
    // count and never lock out.
    fields: ['hashIterations'],
    fieldTypes: { hashIterations: 'number' },
    data: { hashIterations: 120000 },
  },
  {
    app: 'login', slug: 'banned', kind: 'list', order: 1, label: 'Banned passwords',
    fields: ['password'], fieldTypes: { password: 'string' },
    data: LOGIN_BANNED,
  },
]

async function main() {
  await connectDB()

  let created = 0
  let skipped = 0
  for (const ds of DATASETS) {
    // Insert-only: create with the bundled data if absent; never overwrite an
    // existing dataset (admin edits are preserved). `$setOnInsert` applies the
    // whole document on insert and does nothing on a match.
    const res = await AppDataset.updateOne(
      { app: ds.app, slug: ds.slug },
      { $setOnInsert: ds },
      { upsert: true },
    )
    if (res.upsertedCount) {
      created += 1
      console.log(`✓ created ${ds.app}/${ds.slug} (${ds.kind}, ${Array.isArray(ds.data) ? ds.data.length + ' rows' : 'object'})`)
    } else {
      skipped += 1
      console.log(`• ${ds.app}/${ds.slug} already exists — left untouched.`)
    }
  }

  console.log(`\n✓ App-data seed complete: ${created} created, ${skipped} preserved.`)
  process.exit(0)
}

main().catch((err) => {
  console.error('✗ App-data seed failed:', err.message)
  process.exit(1)
})
