import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, Code2, Folder, Play, X } from 'lucide-react'
import SectionHeading from './ui/SectionHeading'
import SpotlightCard from './ui/SpotlightCard'
import Reveal from './ui/Reveal'
import { GithubIcon } from './ui/BrandIcons'
import { useProjects } from '../hooks/useProjects'

// Representative source snippets shown in each project's detail modal.
const CODE_PREVIEWS = {
  'world-cup-2026': `class Person:                      # base: everyone in the tournament
    def __init__(self, person_id, first_name, last_name, nationality):
        self.person_id = person_id
        self.first_name, self.last_name = first_name, last_name
        self.nationality = nationality

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"


class Player(Person):              # extends Person with a career ledger
    def __init__(self, *person, jersey_number, position, overall_rating):
        super().__init__(*person)
        self.jersey_number = jersey_number
        self.position = position
        self.goals = self.assists = 0
        self.matches_played = self.minutes_played = 0

    def play_match(self, minutes=90):
        self.matches_played += 1
        self.minutes_played += minutes


class Forward(Player):             # one of four position subclasses
    def play_match(self, minutes=90):
        super().play_match(minutes)                    # shared bookkeeping,
        print(f"{self.full_name} played as Forward.")  # then its own role`,
  'restaurant-management': `from decimal import Decimal
from enum import Enum


class OrderStatus(str, Enum):
    OPEN = "OPEN"
    PLACED = "PLACED"
    SERVED = "SERVED"
    PAID = "PAID"
    CANCELLED = "CANCELLED"


# Legal moves live in one table, not scattered "if status == ..." checks.
_ALLOWED = {
    OrderStatus.OPEN:   {OrderStatus.PLACED, OrderStatus.CANCELLED},
    OrderStatus.PLACED: {OrderStatus.SERVED, OrderStatus.CANCELLED},
    OrderStatus.SERVED: {OrderStatus.PAID},
    OrderStatus.PAID: set(),
    OrderStatus.CANCELLED: set(),
}


class Order:
    def _transition(self, target: OrderStatus) -> None:
        if target not in _ALLOWED[self.status]:
            raise OrderStateError(
                f"cannot move order from {self.status.value} to {target.value}")
        self.status = target

    @property
    def subtotal(self) -> Decimal:       # exact Decimal money, never float
        total = money(0)
        for line in self.lines:
            total += line.subtotal
        return money(total)`,
  'cgpa-calculator': `#include <bits/stdc++.h>
using namespace std;

struct Course { string grade; double credits; };

double gradePoint(const string& g) {
    static map<string, double> gp = {
        {"A+", 4.0}, {"A", 3.75}, {"A-", 3.5}, {"B+", 3.25},
        {"B", 3.0}, {"C", 2.5}, {"F", 0.0}};
    return gp[g];
}

double semesterGPA(const vector<Course>& courses) {
    double credits = 0, points = 0;
    for (const auto& c : courses) {
        credits += c.credits;
        points  += gradePoint(c.grade) * c.credits;
    }
    return points / credits;   // total points / total credits
}`,
  'auth-system': `#include "sha256.h"

// Passwords are never stored in the clear. Each gets a random salt, then
// the verifier is sha256(salt + password) stretched 120,000 times, so a
// stolen database costs an attacker 120k hashes per guess, not one.
constexpr int kHashIterations = 120000;

std::string derivePassword(const std::string& password,
                           const std::string& salt) {
    // First round binds the salt to the password; the rest only stretch.
    std::string digest = sha256Hex(salt + ":" + password);
    for (int i = 1; i < kHashIterations; ++i)
        digest = sha256Hex(digest + salt);
    return digest;
}

// Verified in constant time so a timing side-channel can't leak the hash.
bool constantTimeEquals(const std::string& a, const std::string& b) {
    if (a.size() != b.size()) return false;
    unsigned char diff = 0;
    for (std::size_t i = 0; i < a.size(); ++i)
        diff |= a[i] ^ b[i];
    return diff == 0;
}`,
  'sudoku-solver': `// Backtracking with two refinements over the naive row/col/box scan:
//   * a 9-bit mask per row, column and box -> O(1) legality tests
//   * most-constrained-variable ordering   -> dead branches fail fast
constexpr int kAllDigits = 0x1FF;   // bits 0-8 set: digits 1-9

int candidatesAt(int row, int col) const {
    int used = rowMask[row] | colMask[col] | boxMask[boxOf(row, col)];
    return ~used & kAllDigits;      // the still-legal digits, as a bitmask
}

bool search(SearchState& s) {
    int row, col, candidates;
    if (!s.selectCell(row, col, candidates)) return true;  // solved: grid full
    if (candidates == 0) return false;                     // dead end: backtrack

    // Try only the digits still legal here, lowest set bit first.
    for (int m = candidates; m != 0; m &= m - 1) {
        int value = digitFromBit(m & -m);
        s.place(row, col, value);
        if (search(s)) return true;
        s.unplace(row, col, value);
    }
    return false;
}`,
  'banking-system': `#include <cstdint>

// Money is a whole number of minor units (cents / paisa), never a float:
// 0.1 + 0.2 != 0.3 in binary floating point, and that rounding error is
// unacceptable for currency. A signed 64-bit count spans ~+/-92 quadrillion.
class Money {
public:
    explicit Money(std::int64_t minorUnits) : units_(minorUnits) {}
    static Money of(std::int64_t major, std::int64_t minor = 0);  // of(12,50)=12.50
    static bool parse(const std::string& text, Money& out);       // "12.50"

    // Checked arithmetic: returns false on 64-bit overflow instead of
    // wrapping silently, so a corrupted amount can't fabricate money.
    bool tryAdd(Money other, Money& out) const;
    bool trySubtract(Money other, Money& out) const;

    std::string toString() const;    // "1,234.50"

private:
    std::int64_t units_ = 0;
};`,
}

const ACCENTS = ['cyan', 'violet']
const BANNER = {
  cyan: 'from-neonCyan/30 via-neonCyan/10 to-transparent',
  violet: 'from-neonPurple/30 via-neonPurple/10 to-transparent',
}
const TAG_TEXT = { cyan: 'text-neonCyan', violet: 'text-neonPurple' }

export default function Projects() {
  const { projects } = useProjects()
  const categories = useMemo(
    () => ['All', ...Array.from(new Set(projects.map((p) => p.category)))],
    [projects],
  )
  const [filter, setFilter] = useState('All')
  const [selected, setSelected] = useState(null)

  const visible = filter === 'All' ? projects : projects.filter((p) => p.category === filter)

  return (
    <section id="projects" className="relative mx-auto max-w-6xl scroll-mt-24 px-4 py-12 sm:px-6 md:py-16">
      <SectionHeading
        index="04"
        eyebrow="// projects"
        title="Things I've built"
      />

      {/* Filter tabs — a single swipeable row on mobile, wraps on larger screens */}
      <div className="mt-8 -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0 [&::-webkit-scrollbar]:hidden">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setFilter(cat)}
            className={`relative shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              filter === cat
                ? 'border-transparent text-void'
                : 'border-hair bg-fill text-muted hover:text-ink'
            }`}
          >
            {filter === cat && (
              <motion.span
                layoutId="filter-pill"
                className="absolute inset-0 -z-10 rounded-full bg-neonCyan"
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              />
            )}
            {cat}
          </button>
        ))}
      </div>

      <motion.div layout className="mt-8 grid gap-5 sm:grid-cols-2">
        <AnimatePresence mode="popLayout">
          {visible.map((p, i) => {
            const accent = ACCENTS[i % ACCENTS.length]
            // The live action opens the full standalone app served under the
            // domain (liveUrl → full load).
            const live = p.liveUrl ? { el: 'a', props: { href: p.liveUrl }, label: 'Open the app' } : null
            return (
              <motion.div
                key={p.key}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.3, delay: (i % 2) * 0.05 }}
              >
                <SpotlightCard accent={accent} className="flex h-full flex-col">
                  <button
                    type="button"
                    onClick={() => setSelected(p)}
                    className="flex flex-1 flex-col text-left"
                    aria-label={`Open details for ${p.title}`}
                  >
                    {/* Banner */}
                    <div className="code-surface relative flex min-h-28 items-end overflow-hidden bg-surface p-6">
                      <div aria-hidden="true" className={`absolute inset-0 bg-gradient-to-br ${BANNER[accent]}`} />
                      <div aria-hidden="true" className="absolute inset-0 bg-dot-grid opacity-40" />
                      <span className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-hair bg-black/30 px-2.5 py-1 font-mono text-[11px] text-ink backdrop-blur">
                        <Folder className="h-3 w-3" />
                        {p.category}
                      </span>
                      <span className="relative max-w-[85%] font-display text-2xl font-bold leading-tight text-white">
                        {p.title}
                      </span>
                    </div>

                    {/* Body */}
                    <div className="flex flex-1 flex-col p-6">
                      <p className="text-sm leading-relaxed text-muted">{p.summary}</p>
                      <ul className="mt-4 flex flex-wrap gap-2">
                        {p.tech.map((t) => (
                          <li
                            key={t}
                            className={`rounded-md border border-hair bg-fill px-2.5 py-1 font-mono text-xs ${TAG_TEXT[accent]}`}
                          >
                            {t}
                          </li>
                        ))}
                      </ul>
                      <span className="mt-auto flex items-center gap-1.5 pt-5 text-sm font-semibold text-ink">
                        View details
                        <ArrowUpRight className="h-4 w-4" />
                      </span>
                    </div>
                  </button>

                  {/* Direct link to the live standalone app (plain full load). */}
                  {live && (
                    <live.el
                      {...live.props}
                      aria-label={`${live.label}: ${p.title}`}
                      className="group/live flex items-center justify-center gap-2 border-t border-hair px-6 py-3 font-mono text-xs font-semibold text-neonCyan transition-colors hover:bg-neonCyan/[0.06]"
                    >
                      <Play className="h-3.5 w-3.5 fill-current" />
                      {live.label}
                      <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover/live:-translate-y-0.5 group-hover/live:translate-x-0.5" />
                    </live.el>
                  )}
                </SpotlightCard>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </motion.div>

      <ProjectModal project={selected} onClose={() => setSelected(null)} />
    </section>
  )
}

function ProjectModal({ project, onClose }) {
  const closeRef = useRef(null)

  useEffect(() => {
    if (!project) return
    document.body.style.overflow = 'hidden'
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    closeRef.current?.focus()
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [project, onClose])

  const live = project?.liveUrl ? { el: 'a', props: { href: project.liveUrl }, label: 'Open the app' } : null

  return (
    <AnimatePresence>
      {project && (
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
            aria-labelledby="project-modal-title"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="glass-strong relative z-10 flex max-h-[86vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl shadow-2xl shadow-black/60"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-hair p-6">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-hair bg-fill px-2.5 py-1 font-mono text-[11px] text-neonCyan">
                  <Folder className="h-3 w-3" />
                  {project.category}
                </span>
                <h3 id="project-modal-title" className="mt-3 font-display text-2xl font-bold text-ink">
                  {project.title}
                </h3>
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

            {/* Scrollable body */}
            <div className="min-h-0 flex-1 overflow-y-auto p-6">
              <p className="leading-relaxed text-muted">{project.summary}</p>

              <h4 className="mt-6 flex items-center gap-2.5 font-mono text-xs text-muted">
                <span aria-hidden="true" className="inline-block h-px w-6 bg-neonCyan/70" />
                Architecture
              </h4>
              <p className="mt-2 leading-relaxed text-ink/90">{project.details}</p>

              <h4 className="mt-6 flex items-center gap-2.5 font-mono text-xs text-muted">
                <span aria-hidden="true" className="inline-block h-px w-6 bg-neonCyan/70" />
                Tech stack
              </h4>
              <ul className="mt-2 flex flex-wrap gap-2">
                {project.tech.map((t) => (
                  <li key={t} className="rounded-md border border-hair bg-fill px-2.5 py-1 font-mono text-xs text-ink">
                    {t}
                  </li>
                ))}
              </ul>

              {CODE_PREVIEWS[project.key] && (
                <>
                  <h4 className="mt-6 flex items-center gap-2.5 font-mono text-xs text-muted">
                    <span aria-hidden="true" className="inline-block h-px w-6 bg-neonCyan/70" />
                    <Code2 className="h-3.5 w-3.5 text-neonCyan" />
                    Code preview
                  </h4>
                  <div className="code-surface mt-2 overflow-hidden rounded-xl border border-hair">
                    <div className="flex items-center gap-2 border-b border-hair bg-fill px-4 py-2.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
                      <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/80" />
                      <span className="h-2.5 w-2.5 rounded-full bg-green-400/80" />
                      <span className="ml-2 font-mono text-xs text-muted">
                        {project.tech.includes('C++') ? 'main.cpp' : 'main.py'}
                      </span>
                    </div>
                    <pre className="overflow-x-auto p-4 font-mono text-[12.5px] leading-relaxed text-emerald-200/90">
                      <code>{CODE_PREVIEWS[project.key]}</code>
                    </pre>
                  </div>
                </>
              )}
            </div>

            {/* Footer actions */}
            <div className="flex flex-wrap items-center gap-3 border-t border-hair p-6">
              {live && (
                <live.el
                  {...live.props}
                  onClick={onClose}
                  className="inline-flex items-center gap-2 rounded-xl bg-neonCyan px-5 py-2.5 font-semibold text-void transition-opacity duration-200 hover:opacity-90"
                >
                  <Play className="h-4 w-4 fill-current" />
                  {live.label}
                </live.el>
              )}
              {project.github && (
                <a
                  href={project.github}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-hair bg-fill px-5 py-2.5 font-semibold text-ink transition-colors hover:bg-fill-strong"
                >
                  <GithubIcon className="h-4 w-4" />
                  View on GitHub
                </a>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
