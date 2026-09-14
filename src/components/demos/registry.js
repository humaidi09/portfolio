import { Grid3x3, Trophy, Landmark, ShieldCheck, UtensilsCrossed, GraduationCap } from 'lucide-react'

/**
 * The six live demos, in showcase order. One entry drives everything: the hub
 * card, the route (`/demos/<slug>`), the shell header, and the lazy import of
 * the demo component. `slug` matches both the project id in portfolioData and
 * the blog post slug, so "Try it live" links and "Read the write-up" links are
 * derived, never hand-maintained.
 *
 * Each demo is a faithful in-browser port of the real repo's algorithm — the
 * same logic, running client-side — so a visitor can actually exercise the work,
 * not just read about it.
 */
export const DEMOS = [
  {
    slug: 'sudoku-solver',
    title: 'Sudoku Solver',
    tagline: 'Paste a grid and watch backtracking with 9-bit constraint masks crack it in milliseconds — or generate a puzzle proven to have exactly one solution.',
    tech: ['C++17 → JS', 'Backtracking', 'Bitmask', 'MRV'],
    icon: Grid3x3,
    repo: 'https://github.com/humaidi09/Sudoku-Solver',
    blogSlug: 'sudoku-solver',
    load: () => import('./sudoku/SudokuDemo.jsx'),
  },
  {
    slug: 'world-cup-2026',
    title: 'World Cup 2026 Simulator',
    tagline: 'Draw the 48-team field into groups, then run thousands of Monte Carlo tournaments to turn Elo ratings into each nation’s title odds.',
    tech: ['Python → JS', 'Monte Carlo', 'Elo', 'Web Worker'],
    icon: Trophy,
    repo: 'https://github.com/humaidi09/World-Cup-2026',
    blogSlug: 'world-cup-2026',
    load: () => import('./worldcup/WorldCupDemo.jsx'),
  },
  {
    slug: 'banking-system',
    title: 'Banking System',
    tagline: 'Open accounts and post transactions against an append-only ledger that proves every balance — with money stored as exact integer minor units, never floats.',
    tech: ['C++17 → JS', 'Integer money', 'Ledger', 'Checked math'],
    icon: Landmark,
    repo: 'https://github.com/humaidi09/Banking-System',
    blogSlug: 'banking-system',
    load: () => import('./banking/BankingDemo.jsx'),
  },
  {
    slug: 'auth-system',
    title: 'Login & Registration',
    tagline: 'Register and sign in against a real salted, 120,000-iteration SHA-256 hash — computed live in your browser and never stored in any recoverable form.',
    tech: ['C++17 → JS', 'SHA-256', 'Salt + stretch', 'Constant-time'],
    icon: ShieldCheck,
    repo: 'https://github.com/humaidi09/Login-Registration-System',
    blogSlug: 'auth-system',
    load: () => import('./auth/AuthDemo.jsx'),
  },
  {
    slug: 'restaurant-management',
    title: 'Restaurant Management',
    tagline: 'Build an order, move it through its state machine, and print a bill that applies discount, service charge and tax in a fixed rounded order — reproducible to the cent.',
    tech: ['Python → JS', 'State machine', 'Exact money'],
    icon: UtensilsCrossed,
    repo: 'https://github.com/humaidi09/Restaurant-Management-System',
    blogSlug: 'restaurant-management',
    load: () => import('./restaurant/RestaurantDemo.jsx'),
  },
  {
    slug: 'cgpa-calculator',
    title: 'CGPA Calculator',
    tagline: 'Enter your courses, grades and credit hours to get a credit-weighted semester GPA and cumulative CGPA, with the full per-course breakdown behind the number.',
    tech: ['C++ → JS', 'Credit-weighted', 'OOP'],
    icon: GraduationCap,
    repo: 'https://github.com/humaidi09/CGPA-Calculator',
    blogSlug: 'cgpa-calculator',
    load: () => import('./cgpa/CgpaDemo.jsx'),
  },
]

/** Look up a demo by its slug (route segment). */
export function getDemo(slug) {
  return DEMOS.find((d) => d.slug === slug)
}
