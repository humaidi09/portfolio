import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, Code2, ExternalLink, Folder, X } from 'lucide-react'
import SectionHeading from './ui/SectionHeading'
import SpotlightCard from './ui/SpotlightCard'
import Reveal from './ui/Reveal'
import { GithubIcon } from './ui/BrandIcons'
import { useProjects } from '../hooks/useProjects'

// Representative source snippets shown in each project's detail modal.
const CODE_PREVIEWS = {
  'world-cup-2026': `class Player:
    def __init__(self, name, position, team):
        self.name = name
        self.position = position
        self.team = team
        self.goals = 0

    def score(self, n=1):
        self.goals += n


class Team:
    def __init__(self, name, coach):
        self.name = name
        self.coach = coach
        self.players = []

    def register(self, player: Player):
        self.players.append(player)

    def total_goals(self):
        return sum(p.goals for p in self.players)`,
  'restaurant-management': `class MenuItem:
    def __init__(self, name, price):
        self.name = name
        self.price = price


class Cart:
    def __init__(self):
        self.items = []

    def add(self, item: MenuItem, qty=1):
        self.items.append((item, qty))

    def total(self):
        return sum(i.price * q for i, q in self.items)


class Admin(User):          # inherits auth from User
    def add_menu_item(self, name, price):
        MENU.append(MenuItem(name, price))`,
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
  'auth-system': `#include <bits/stdc++.h>
using namespace std;

const string DB = "users.txt";

bool userExists(const string& user) {
    ifstream in(DB);
    string u; size_t h;
    while (in >> u >> h)
        if (u == user) return true;
    return false;
}

string registerUser(const string& user, const string& pass) {
    if (userExists(user)) return "Username already exists.";
    ofstream out(DB, ios::app);
    out << user << ' ' << hash<string>{}(pass) << '\\n';
    return "Registration successful!";
}

bool login(const string& user, const string& pass) {
    ifstream in(DB);
    string u; size_t h;
    while (in >> u >> h)
        if (u == user && h == hash<string>{}(pass)) return true;
    return false;   // invalid credentials
}`,
  'sudoku-solver': `bool isValid(int g[9][9], int row, int col, int num) {
    for (int i = 0; i < 9; ++i) {
        if (g[row][i] == num) return false;        // row rule
        if (g[i][col] == num) return false;        // column rule
    }
    int br = row - row % 3, bc = col - col % 3;     // 3x3 box
    for (int r = 0; r < 3; ++r)
        for (int c = 0; c < 3; ++c)
            if (g[br + r][bc + c] == num) return false;
    return true;
}

bool solve(int g[9][9]) {
    for (int row = 0; row < 9; ++row)
        for (int col = 0; col < 9; ++col)
            if (g[row][col] == 0) {
                for (int num = 1; num <= 9; ++num)
                    if (isValid(g, row, col, num)) {
                        g[row][col] = num;
                        if (solve(g)) return true;
                        g[row][col] = 0;            // backtrack
                    }
                return false;
            }
    return true;
}`,
  'banking-system': `#include <bits/stdc++.h>
using namespace std;

class Account {
    string owner;
    double balance;
    vector<pair<string, double>> history;
public:
    Account(string o, double b = 0) : owner(o), balance(b) {}

    void deposit(double amt) {
        balance += amt;
        history.push_back({"DEPOSIT", amt});
    }

    void withdraw(double amt) {
        if (amt > balance) throw runtime_error("Insufficient funds");
        balance -= amt;
        history.push_back({"WITHDRAW", amt});
    }

    void transfer(Account& to, double amt) {
        withdraw(amt);
        to.deposit(amt);
        history.push_back({"TRANSFER", amt});
    }
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
                    className="flex h-full flex-col text-left"
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
              <a
                href={project.github}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-neonCyan px-5 py-2.5 font-semibold text-void transition-opacity duration-200 hover:opacity-90"
              >
                <GithubIcon className="h-4 w-4" />
                View on GitHub
              </a>
              {project.demo && project.demo !== '#' && (
                <a
                  href={project.demo}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-hair bg-fill px-5 py-2.5 font-semibold text-ink transition-colors hover:bg-fill-strong"
                >
                  <ExternalLink className="h-4 w-4" />
                  Live demo
                </a>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
