export const personalInfo = {
  name: "Hussain Ahmed",
  // Hero headshot — save your photo as public/profile.jpg (served at /profile.jpg)
  photo: "/profile.jpg",
  role: "CSE Student & Aspiring Software Engineer",
  tagline: "Competitive Programmer | C++ & DSA Enthusiast | Python Developer",
  phone: "+8801754366440",
  email: "humaidiofficial408@gmail.com",
  github: "https://github.com/humaidi09",
  linkedin: "https://www.linkedin.com/in/hussain-ahmed-02264a39a",
  // WhatsApp is derived from the phone number above.
  whatsapp: "https://wa.me/8801754366440",
  // To add Facebook / Instagram / X, paste your real profile URLs here and
  // add matching entries to the SOCIALS arrays in Contact.jsx / Footer.jsx.
  // facebook: "",
  // instagram: "",
  // twitter: "",
  university: "Leading University, Sylhet",
  degree: "B.Sc. in Computer Science & Engineering (2024 – 2029)",
  gpa: "3.85 / 4.00",
  semester: "Currently in 4th Semester",
  bio: "Undergraduate Computer Science student with a strong passion for problem-solving, algorithms, Object-Oriented Programming, and building scalable modern web applications. Active competitive programmer and tech community volunteer."
};

export const stats = [
  { label: "Current CGPA", value: 3.85, suffix: " / 4.00" },
  { label: "Problems Solved", value: 500, suffix: "+" },
  { label: "Contests & Events", value: 3, suffix: "+" },
  { label: "Projects Built", value: 6, suffix: "" }
];

export const skills = {
  languages: ["C", "C++", "Python", "JavaScript", "HTML5", "CSS3"],
  coreCS: ["Data Structures", "Algorithms", "Object-Oriented Programming (OOP)", "Intermediate SQL", "Problem Solving", "Competitive Programming"],
  toolsAndDB: ["Git", "GitHub", "VS Code", "MySQL", "React.js", "Tailwind CSS"],
  softSkills: ["Teamwork", "Communication", "Time Management", "Collaboration"],
  // Spoken languages — shown as a small proficiency row under the skill grid.
  spokenLanguages: [
    { name: "Bengali", level: "Native" },
    { name: "English", level: "Professional" },
    { name: "Arabic", level: "Basic" }
  ]
};

// Skills section — two named groups shown as boxes. DB-backed and editable at
// /admin → Skills; this is the fallback rendered when the API is unreachable
// (local dev, Render cold starts).
export const skillGroups = [
  {
    title: "Core CS skills",
    items: ["C/C++", "DSA", "OOP", "Python", "JavaScript", "Database", "HTML/CSS"]
  },
  {
    title: "Soft Skills",
    items: ["Problem Solving", "Teamwork", "Time Management", "Collaboration", "Git/GitHub"]
  }
];

export const projects = [
  {
    id: "world-cup-2026",
    title: "World Cup 2026 Management System",
    category: "Python/OOP",
    tech: ["Python", "OOP", "Inheritance", "pytest"],
    summary: "An object-oriented model of a football squad, built to show the four pillars of OOP: one Person → Player → position hierarchy, driven through a shared interface.",
    details: "Person is the base class; Player extends it with a career ledger; and Goalkeeper, Defender, Midfielder and Forward each extend Player with their own statistics. Every position overrides play_match() but calls up through super(), so shared bookkeeping runs once while each object behaves like itself — polymorphism in action. A Team owns the squad, captaincy and competition record. 25 tests and CI on Linux, macOS and Windows across Python 3.10 to 3.13.",
    github: "https://github.com/humaidi09/World-Cup-2026",
    demo: "#"
  },
  {
    id: "restaurant-management",
    title: "Restaurant Management System",
    category: "Python/CLI",
    tech: ["Python", "Decimal", "State Machine", "pytest"],
    summary: "A dependency-free CLI for a restaurant's front of house: build a menu, move orders through their lifecycle, and compute bills with discount, service charge and tax.",
    details: "Money is exact two-decimal Decimal that refuses floats outright, so receipts always add up. Orders are a state machine (OPEN to PLACED to SERVED to PAID, or CANCELLED) that rejects illegal moves, and editing is only allowed while open. Billing applies discount then service charge then tax in a fixed, rounded order. State persists to JSON via write-temp-then-rename so an interrupted save cannot corrupt data. 60 tests run on Linux, macOS and Windows across Python 3.10 to 3.13.",
    github: "https://github.com/humaidi09/Restaurant-Management-System",
    demo: "#"
  },
  {
    id: "cgpa-calculator",
    title: "CGPA Calculator",
    category: "C++/CLI",
    tech: ["C++", "OOP", "CLI"],
    summary: "An interactive calculator that computes semester GPA and cumulative CGPA from per-course grades and credit hours.",
    details: "Takes the number of courses, then each course's grade and credit hours. Computes total credits and total grade points (grade point × credit hours), derives the semester GPA, and rolls the results up into an overall CGPA. Prints a clear per-course breakdown alongside the final CGPA.",
    github: "https://github.com/humaidi09/CGPA-Calculator",
    demo: "#"
  },
  {
    id: "auth-system",
    title: "Login & Registration System",
    category: "C++/File Handling",
    tech: ["C++17", "SHA-256", "Salting", "Key Stretching"],
    summary: "A file-backed authentication system built around one rule: a password is never stored in any recoverable form. Self-implemented SHA-256, salted and key-stretched.",
    details: "Registration enforces a password strength policy and rejects duplicate usernames; credentials are stored as a per-user salt plus a SHA-256 hash stretched over 120,000 iterations, never plain text. Login uses constant-time comparison, locks an account after repeated failures, and returns identical messages for unknown users and wrong passwords to prevent username enumeration. Zero dependencies, 36 unit tests, and CI on Linux, macOS and Windows.",
    github: "https://github.com/humaidi09/Login-Registration-System",
    demo: "#"
  },
  {
    id: "sudoku-solver",
    title: "Sudoku Solver, Generator & Checker",
    category: "C++/DSA",
    tech: ["C++17", "Backtracking", "Bitmask", "MRV Heuristic"],
    summary: "A zero-dependency C++17 Sudoku toolkit that cracks the 'world's hardest' puzzle in ~2 ms, generates puzzles guaranteed to have a single solution, and proves that uniqueness.",
    details: "Recursive backtracking accelerated by 9-bit row/column/box constraint masks for O(1) candidate lookup and most-constrained-variable ordering, so hard 17-clue puzzles finish in milliseconds. A counting search that stops at the second solution proves whether a puzzle is well-posed; the generator carves clues while re-checking uniqueness after every removal, so its output is unique by construction. Ships with a full CLI (solve / check / generate / benchmark), 46 unit tests, and CI across Linux, macOS and Windows.",
    github: "https://github.com/humaidi09/Sudoku-Solver",
    demo: "#"
  },
  {
    id: "banking-system",
    title: "Banking System",
    category: "C++/OOP",
    tech: ["C++17", "Ledger Integrity", "File Handling"],
    summary: "A file-backed banking backend built around two invariants: every amount is exact, and every balance is backed by a ledger that proves it.",
    details: "Money is stored as an exact integer count of minor units (never a float, eliminating the 0.1 + 0.2 bug) with checked arithmetic that reports overflow instead of wrapping. Each account keeps an immutable ledger from which its balance is derived; a stored balance that does not match its history is rejected on load, so a tampered file cannot pass silently. Transfers are atomic — everything that could fail is checked before either leg moves — and saves are written via temp-then-rename so a crash cannot corrupt the data. 29 unit tests and CI on Linux, macOS and Windows.",
    github: "https://github.com/humaidi09/Banking-System",
    demo: "#"
  }
];

export const experiences = [
  {
    role: "Executive Member",
    organization: "Leading University Computer Club (LUCC)",
    period: "Jul 2026 – Present",
    skills: ["Leadership", "Event Coordination"]
  },
  {
    role: "Assistant Mathematics Teacher (Part-time)",
    organization: "Ideal Madrasah, Sylhet (Shobujbag Campus)",
    period: "Feb 2025 – Present",
    skills: ["Classroom Management", "Communication"]
  },
  {
    role: "Member",
    organization: "Leading University Research Society (LURS)",
    period: "Jun 2026 – Present",
    skills: ["Research Methodology", "Academic Writing"]
  },
  {
    role: "Member",
    organization: "IEEE Computer Society LU SB Chapter",
    period: "May 2024 – Present",
    skills: ["Volunteering", "Event Management"]
  }
];

export const certifications = [
  { title: "SQL (Intermediate)", issuer: "HackerRank", date: "Jul 2026", id: "292DD0FFE495" },
  { title: "SQL (Basic)", issuer: "HackerRank", date: "Jul 2026", id: "D83FAF8D7983" },
  { title: "ILUPC 2026 Team Programming Contest", issuer: "LUCC (Team Code Phoenix)", date: "Aug 2026", id: "Contestant" },
  { title: "16th National Undergraduate Math Olympiad 2025", issuer: "Bangladesh Mathematical Society", date: "Apr 2025", id: "16058" },
  { title: "Web Development with Python Career Launchpad", issuer: "Ostad", date: "Mar 2026", id: "C32383" },
  { title: "HackFusion 2026 Volunteer Certificate", issuer: "IEEE CS LU SB", date: "Apr 2025", id: "IEEE CS LU SB - 0447" }
];

// Real events, mirrored from the DB so the Events section renders even when the
// API is asleep or unreachable (local dev, Render cold starts). When the live
// API responds it overrides this with the same records. Attach photos to each
// event from /admin → Events to replace the placeholder card art.
export const events = [
  {
    title: "ILUPC 2026 Team Programming Contest",
    date: "Aug 2026",
    location: "Leading University, Sylhet",
    description: "Competed as part of Team Code Phoenix in the inter-LU programming contest.",
    images: []
  },
  {
    title: "HackFusion 2026",
    date: "Apr 2025",
    location: "IEEE CS LU SB",
    description: "Volunteered at the HackFusion hackathon, helping run the event on the day.",
    images: []
  }
];

// --- Competitive programming ---------------------------------------------
// Codeforces fetches live stats in the browser (rating, problems solved and
// the day-by-day activity heatmap). AtCoder, LeetCode and CodeChef show a
// solved-problem count from `stats` and link out to the full profile — set
// each `handle` to the real username so the profile link is correct (an empty
// handle shows the count without a link). AtCoder can fetch live instead
// (source: "atcoder") if you'd rather show its heatmap — just add the handle.
//
// `logo` is each judge's real brand mark (public/logos/*), shown on a white
// tile so the full-colour marks read on the black cards. `logoClass` tunes the
// fit — AtCoder's only official mark is a crest with an "AtCoder" wordmark
// baked in, so it's scaled from the top to crop the wordmark out of the tile.
export const competitiveProgramming = [
  {
    key: "codeforces",
    name: "Codeforces",
    mono: "CF",
    // Temporarily unlinked (no handle) — shown as a static solved count with no
    // @username and no profile link. Restore the live rating/heatmap later by
    // setting `handle` back and `source` to "codeforces".
    source: "link",
    accent: "#4f8cff",
    handle: "",
    logo: "/logos/codeforces.png",
    logoClass: "p-1.5",
    solvedOverride: 132,
    stats: { solved: 132 },
    // `{handle}` is filled in by the UI (and stored verbatim in the DB) so the
    // profile link stays a plain, serializable string — no function to persist.
    profileUrl: "https://codeforces.com/profile/{handle}"
  },
  {
    key: "leetcode",
    name: "LeetCode",
    mono: "LC",
    source: "link",
    accent: "#ffa116",
    // Temporarily unlinked (no handle) — no @username, no profile link.
    handle: "",
    logo: "/logos/leetcode.png",
    logoClass: "p-1",
    profileUrl: "https://leetcode.com/u/{handle}/",
    // From the LeetCode profile's submission heatmap (LeetCode has no
    // browser-readable API, so these are entered by hand, not fetched live).
    stats: { submissions: 21, activeDays: 7, maxStreak: 1 }
  },
  {
    key: "atcoder",
    name: "AtCoder",
    mono: "AC",
    source: "link",
    accent: "#c3c5cb",
    handle: "",
    logo: "/logos/atcoder.png",
    logoClass: "origin-top scale-[1.32] p-0.5",
    profileUrl: "https://atcoder.jp/users/{handle}",
    stats: { solved: 165 } // live heatmap available if you add a real handle + source:"atcoder"
  },
  {
    key: "codechef",
    name: "CodeChef",
    mono: "CC",
    source: "link",
    accent: "#c08457",
    handle: "",
    logo: "/logos/codechef.svg",
    logoClass: "p-1.5",
    profileUrl: "https://www.codechef.com/users/{handle}",
    stats: { solved: 213 }
  }
];
