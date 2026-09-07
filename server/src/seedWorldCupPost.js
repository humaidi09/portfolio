import 'dotenv/config'
import fs from 'node:fs'
import mongoose from 'mongoose'
import { connectDB } from './db.js'
import Post from './models/Post.js'

/**
 * Publish the "World Cup 2026 Prediction Engine" project write-up as a real
 * blog post.
 *
 * The body is sourced from WORLD-CUP-2026-PROJECT.md at the repo root (the
 * full, present-it-first-to-last guide), so that file stays the single source
 * of truth — edit the .md and re-run to update. Upsert is matched on slug, so
 * running twice updates the existing post rather than duplicating it, and we
 * go through .save() (not updateOne) so the model's readingTime / publishedAt
 * hooks fire.
 *
 * The 5 process diagrams the post embeds live in public/blog/worldcup/*.svg
 * and are referenced by /blog/worldcup/<name>.svg (served from the frontend
 * origin), so they are NOT inlined here.
 *
 *   node src/seedWorldCupPost.js
 */
const SLUG = 'world-cup-2026-prediction-engine'
const MD_URL = new URL('../../WORLD-CUP-2026-PROJECT.md', import.meta.url)

/**
 * A branded 16:9 cover in the site's own voice — deep black, warm gold, a
 * serif title, the `//` monospace motif. The accent is a tiny knockout
 * bracket converging to a single champion node: the project's whole idea
 * (many teams → one champion) in one glyph. Inlined as an SVG data URL so
 * the post is self-contained (no media host).
 */
const COVER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720" fill="none">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="720" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#0d0d10"/>
      <stop offset="1" stop-color="#08080a"/>
    </linearGradient>
    <radialGradient id="glow" cx="26%" cy="40%" r="62%">
      <stop offset="0" stop-color="#f2b43d" stop-opacity="0.17"/>
      <stop offset="1" stop-color="#f2b43d" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1280" height="720" fill="url(#bg)"/>
  <rect width="1280" height="720" fill="url(#glow)"/>
  <rect x="24" y="24" width="1232" height="672" rx="20" fill="none" stroke="#f2b43d" stroke-opacity="0.14"/>
  <g stroke="#f2b43d" stroke-opacity="0.26" stroke-width="1.25">
    <line x1="946" y1="132" x2="1054" y2="167"/>
    <line x1="946" y1="204" x2="1054" y2="167"/>
    <line x1="946" y1="278" x2="1054" y2="313"/>
    <line x1="946" y1="350" x2="1054" y2="313"/>
    <line x1="1054" y1="167" x2="1156" y2="240"/>
    <line x1="1054" y1="313" x2="1156" y2="240"/>
  </g>
  <g fill="#f2b43d">
    <circle cx="946" cy="132" r="3.5" fill-opacity="0.8"/>
    <circle cx="946" cy="204" r="3.5" fill-opacity="0.8"/>
    <circle cx="946" cy="278" r="3.5" fill-opacity="0.8"/>
    <circle cx="946" cy="350" r="3.5" fill-opacity="0.8"/>
    <circle cx="1054" cy="167" r="4.5"/>
    <circle cx="1054" cy="313" r="4.5"/>
    <circle cx="1156" cy="240" r="7.5"/>
  </g>
  <circle cx="101" cy="144" r="5.5" fill="#f2b43d"/>
  <text x="118" y="152" font-family="'JetBrains Mono','SFMono-Regular',Menlo,Consolas,monospace" font-size="24" letter-spacing="1" fill="#f2b43d">prediction engine</text>
  <text x="90" y="330" font-family="Georgia,'Times New Roman',serif" font-size="94" font-weight="700" letter-spacing="-1" fill="#f6f4ef">World Cup 2026</text>
  <text x="90" y="436" font-family="Georgia,'Times New Roman',serif" font-size="94" font-weight="700" letter-spacing="-1" fill="#f6f4ef">Prediction Engine</text>
  <rect x="96" y="474" width="132" height="5" rx="2.5" fill="#f2b43d"/>
  <text x="96" y="556" font-family="'JetBrains Mono','SFMono-Regular',Menlo,Consolas,monospace" font-size="25" fill="#b8b3a6">python &#183; elo &#8594; poisson &#183; monte carlo</text>
  <text x="96" y="596" font-family="'JetBrains Mono','SFMono-Regular',Menlo,Consolas,monospace" font-size="19" fill="#8a8578">real data in &#183; every result a PREDICTION out</text>
  <text x="1184" y="650" text-anchor="end" font-family="'JetBrains Mono',Menlo,Consolas,monospace" font-size="22" fill="#8a8578">Hussain Ahmed</text>
</svg>`

const COVER_DATA_URL = `data:image/svg+xml;base64,${Buffer.from(COVER_SVG).toString('base64')}`

async function main() {
  const raw = fs.readFileSync(MD_URL, 'utf8')
  // Drop the leading top-level H1 — the detail page already renders the title.
  const content = raw.replace(/^﻿?#\s+.*(\r?\n)+/, '')

  const data = {
    title: 'FIFA World Cup 2026 Prediction Engine — How to Present It',
    slug: SLUG,
    subtitle:
      'A real, offline, 48-team World Cup simulator in pure Python — real teams, real published Elo, Monte Carlo odds. Every result labelled a prediction.',
    excerpt:
      'How I would present my World Cup 2026 prediction engine to anyone — from a beginner friend to a professor: the format, the Elo → Poisson match model, the Monte Carlo odds, the architecture, and audience-by-audience talking points.',
    content,
    coverImage: COVER_DATA_URL,
    category: 'Project',
    tags: ['World Cup 2026', 'Python', 'Simulation', 'Monte Carlo', 'Elo'],
    author: 'Hussain Ahmed',
    status: 'published',
    featured: true,
  }

  await connectDB()
  const doc = (await Post.findOne({ slug: SLUG })) || new Post()
  const isNew = doc.isNew
  Object.assign(doc, data)
  await doc.save()

  console.log(
    `✓ Post "${doc.title}" ${isNew ? 'created' : 'updated'} — slug "${doc.slug}", ` +
      `${doc.readingTime} min read, status ${doc.status}, featured ${doc.featured}, cover ${doc.coverImage ? 'set' : 'none'}.`,
  )
  await mongoose.disconnect()
  process.exit(0)
}

main().catch((err) => {
  console.error('✗ World Cup post seed failed:', err.message)
  process.exit(1)
})
