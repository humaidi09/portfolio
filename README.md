# humaidi.dev — Developer Portfolio

A modern, fully responsive single-page portfolio for **Humaidi** — CSE Student & Junior Software Developer.

Premium dark theme, glassmorphism cards, cyan→violet→magenta neon gradients, a cursor-tracking spotlight on cards, a terminal-style typing badge, and smooth scroll-triggered motion.

## Tech stack

- **React 19** + **Vite**
- **Tailwind CSS v4** (`@tailwindcss/vite`)
- **Framer Motion** (scroll reveals, hover micro-interactions)
- **Lucide** icons (GitHub/LinkedIn shipped as custom SVGs)
- Fonts: **Space Grotesk** (display), **Inter** (body), **JetBrains Mono** (code)

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL (default http://localhost:5173).

Build for production:

```bash
npm run build
npm run preview
```

## Make it yours

All content lives in one file — **[`src/data/portfolio.js`](src/data/portfolio.js)**. Search for `PLACEHOLDER` and replace:

| What | Where |
| --- | --- |
| Email address | `profile.email` |
| Phone number | `profile.phone` |
| GitHub / LinkedIn URLs | `profile.socials` |
| Résumé link | `profile.resumeUrl` |
| Education (degrees, dates) | `education.items[]` |
| Community / clubs | `experience[]` |
| Project titles, blurbs, tags, **Live / Code links** | `projects[]` |

Projects with no `live` or `code` link simply hide that button. The GitHub / LinkedIn handles shown on the contact cards (`@humaidi09`, `in/hussain-ahmed`) are in `src/components/Contact.jsx`.

## Contact form

The form validates client-side, then hands off to the visitor's mail client via a `mailto:` link (no backend required). For direct inbox delivery, wire the submit handler in `src/components/Contact.jsx` to a service like **EmailJS**, **Formspree**, or your own API.

## Structure

```
src/
├── App.jsx                 # composes all sections
├── index.css               # design tokens, base styles, utilities
├── data/portfolio.js       # ← all editable content
└── components/
    ├── Background.jsx       # aurora + dot-grid atmosphere
    ├── Navbar.jsx           # glass nav, scroll-spy, mobile menu
    ├── Hero.jsx             # headline, typing badge, code card
    ├── About.jsx
    ├── Skills.jsx
    ├── Projects.jsx
    ├── Education.jsx
    ├── Contact.jsx
    ├── Footer.jsx
    └── ui/
        ├── SpotlightCard.jsx   # signature cursor-glow glass card
        ├── SectionHeading.jsx
        ├── Reveal.jsx          # scroll-into-view motion wrapper
        └── BrandIcons.jsx      # GitHub / LinkedIn SVG marks
```

## Accessibility & polish

- Responsive from 375px up to large desktop.
- Visible keyboard focus rings; social/icon links are labelled.
- `prefers-reduced-motion` disables animations and the typewriter.
