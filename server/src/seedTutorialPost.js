import 'dotenv/config'
import fs from 'node:fs'
import mongoose from 'mongoose'
import { connectDB } from './db.js'
import Post from './models/Post.js'

/**
 * Publish the "How I Built This Website" tutorial as a real blog post.
 *
 * The post body is sourced from HOW-I-BUILT-THIS.md at the repo root (the
 * Banglish step-by-step tutorial), so the file stays the single source of
 * truth — edit the .md and re-run to update. Upsert is matched on slug, so
 * running twice updates the existing post rather than duplicating it, and we
 * go through .save() (not updateOne) so the model's readingTime / publishedAt
 * hooks fire.
 *
 *   node src/seedTutorialPost.js
 */
const SLUG = 'how-i-built-this-website'
const MD_URL = new URL('../../HOW-I-BUILT-THIS.md', import.meta.url)

/**
 * A branded 16:9 cover in the site's own voice — deep black, warm gold, a
 * serif title, the `//` monospace motif, and the network-node accent that
 * echoes the site background. A designed title card, not a stock photo.
 * Inlined as an SVG data URL so the post is self-contained (no media host).
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
    <line x1="980" y1="120" x2="1090" y2="182"/>
    <line x1="1090" y1="182" x2="1040" y2="292"/>
    <line x1="1040" y1="292" x2="922" y2="250"/>
    <line x1="922" y1="250" x2="980" y2="120"/>
    <line x1="1090" y1="182" x2="1172" y2="112"/>
    <line x1="1040" y1="292" x2="1150" y2="332"/>
  </g>
  <g fill="#f2b43d">
    <circle cx="980" cy="120" r="4.5"/>
    <circle cx="1090" cy="182" r="6" fill-opacity="0.92"/>
    <circle cx="1040" cy="292" r="4"/>
    <circle cx="922" cy="250" r="3.5" fill-opacity="0.8"/>
    <circle cx="1172" cy="112" r="3"/>
    <circle cx="1150" cy="332" r="3.5" fill-opacity="0.7"/>
  </g>
  <text x="96" y="152" font-family="'JetBrains Mono','SFMono-Regular',Menlo,Consolas,monospace" font-size="24" letter-spacing="1" fill="#f2b43d">// full-stack tutorial</text>
  <text x="90" y="332" font-family="Georgia,'Times New Roman',serif" font-size="106" font-weight="700" letter-spacing="-1" fill="#f6f4ef">How I Built</text>
  <text x="90" y="446" font-family="Georgia,'Times New Roman',serif" font-size="106" font-weight="700" letter-spacing="-1" fill="#f6f4ef">This Website</text>
  <rect x="96" y="486" width="132" height="5" rx="2.5" fill="#f2b43d"/>
  <text x="96" y="566" font-family="'JetBrains Mono','SFMono-Regular',Menlo,Consolas,monospace" font-size="26" fill="#b8b3a6">react + node + mongodb + cloudinary</text>
  <text x="1184" y="650" text-anchor="end" font-family="'JetBrains Mono',Menlo,Consolas,monospace" font-size="22" fill="#8a8578">Hussain Ahmed</text>
</svg>`

const COVER_DATA_URL = `data:image/svg+xml;base64,${Buffer.from(COVER_SVG).toString('base64')}`

async function main() {
  const raw = fs.readFileSync(MD_URL, 'utf8')
  // Drop the leading top-level H1 — the detail page already renders the title.
  const content = raw.replace(/^﻿?#\s+.*(\r?\n)+/, '')

  const data = {
    title: 'How I Built This Website — Full-Stack Tutorial',
    slug: SLUG,
    subtitle:
      'React + Vite + Tailwind frontend, Node + Express + MongoDB backend, Cloudinary media — zero theke deploy porjonto, step by step.',
    excerpt:
      'Ei portfolio + blog CMS ta ekdom zero theke kivabe banaisi — stack, architecture, code ar deploy — full step-by-step, Banglish e.',
    content,
    coverImage: COVER_DATA_URL,
    category: 'Tutorial',
    tags: ['Full-Stack', 'React', 'Node.js', 'MongoDB', 'Tutorial'],
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
  console.error('✗ Tutorial post seed failed:', err.message)
  process.exit(1)
})
