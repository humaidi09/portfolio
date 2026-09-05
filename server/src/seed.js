import 'dotenv/config'
import { connectDB } from './db.js'
import Project from './models/Project.js'
import Experience from './models/Experience.js'
import Certification from './models/Certification.js'
import Stat from './models/Stat.js'
import Event from './models/Event.js'
import Puzzle from './models/Puzzle.js'
import CpProfile from './models/CpProfile.js'
import SkillGroup from './models/SkillGroup.js'

/**
 * One-time (idempotent) seed: pull the static content from the frontend's data
 * file and upsert it into MongoDB. Safe to re-run — each collection matches on a
 * natural key so it updates rather than duplicates.
 *
 *   node src/seed.js
 */
async function main() {
  await connectDB()

  // Import the frontend data file directly so there is one source of truth.
  const dataUrl = new URL('../../src/data/portfolioData.js', import.meta.url)
  const { projects, experiences, certifications, stats, competitiveProgramming, skillGroups } = await import(dataUrl.href)
  const puzzleUrl = new URL('../../src/data/puzzles.js', import.meta.url)
  const { PUZZLES } = await import(puzzleUrl.href)

  // Projects — match on slug (the old `id`).
  let pCreated = 0
  let pUpdated = 0
  for (const [i, p] of projects.entries()) {
    const doc = {
      slug: p.id,
      title: p.title,
      category: p.category || '',
      tech: p.tech || [],
      summary: p.summary || '',
      details: p.details || '',
      github: p.github || '',
      demo: p.demo && p.demo !== '#' ? p.demo : '',
      order: i,
    }
    const existing = await Project.findOne({ slug: doc.slug })
    if (existing) {
      await Project.updateOne({ slug: doc.slug }, doc)
      pUpdated += 1
    } else {
      await Project.create(doc)
      pCreated += 1
    }
  }
  console.log(`✓ Projects — ${pCreated} created, ${pUpdated} updated.`)

  // Experiences — match on role + organization.
  await upsertMany(Experience, experiences, (e, i) => ({
    match: { role: e.role, organization: e.organization },
    doc: {
      role: e.role,
      organization: e.organization,
      period: e.period || '',
      skills: e.skills || [],
      order: i,
    },
  }))

  // Certifications — match on title. `id` in the data file maps to credentialId.
  await upsertMany(Certification, certifications, (c, i) => ({
    match: { title: c.title },
    doc: {
      title: c.title,
      issuer: c.issuer || '',
      date: c.date || '',
      credentialId: c.id || '',
      order: i,
    },
  }))

  // Stats — match on label. value is stored as a string.
  await upsertMany(Stat, stats, (s, i) => ({
    match: { label: s.label },
    doc: {
      label: s.label,
      value: String(s.value ?? ''),
      suffix: s.suffix || '',
      order: i,
    },
  }))

  // Events — two starter rows (drawn from real participation). Photos are left
  // empty; upload them from /admin → Events. Cards show a placeholder until then.
  const events = [
    {
      title: 'ILUPC 2026 Team Programming Contest',
      date: 'Aug 2026',
      location: 'Leading University, Sylhet',
      description: 'Competed as part of Team Code Phoenix in the inter-LU programming contest.',
    },
    {
      title: 'HackFusion 2026',
      date: 'Apr 2025',
      location: 'IEEE CS LU SB',
      description: 'Volunteered at the HackFusion hackathon, helping run the event on the day.',
    },
  ]
  await upsertMany(Event, events, (e, i) => ({
    match: { title: e.title },
    doc: {
      title: e.title,
      date: e.date || '',
      location: e.location || '',
      description: e.description || '',
      order: i,
    },
  }))

  // Puzzles — match on the code snippet (its natural key here).
  await upsertMany(Puzzle, PUZZLES, (p, i) => ({
    match: { code: p.code },
    doc: {
      code: p.code,
      options: p.options || [],
      answer: p.answer ?? 0,
      note: p.note || '',
      order: i,
    },
  }))

  // Competitive-programming judges — match on the stable `key`. The data file's
  // `profileUrl` template is stored verbatim (the old profile() function is gone).
  await upsertMany(CpProfile, competitiveProgramming, (p, i) => ({
    match: { key: p.key },
    doc: {
      key: p.key,
      name: p.name,
      mono: p.mono || '',
      source: p.source || 'link',
      accent: p.accent || '',
      handle: p.handle || '',
      logo: p.logo || '',
      logoClass: p.logoClass || '',
      profileUrl: p.profileUrl || '',
      solvedOverride: p.solvedOverride ?? null,
      stats: p.stats ?? undefined,
      order: i,
    },
  }))

  // Skill groups — match on title. `items` is stored as a string array.
  await upsertMany(SkillGroup, skillGroups, (g, i) => ({
    match: { title: g.title },
    doc: {
      title: g.title,
      items: g.items || [],
      order: i,
    },
  }))

  console.log('✓ Seed complete.')
  process.exit(0)
}

/** Generic idempotent upsert for a collection given a mapper → {match, doc}. */
async function upsertMany(Model, items, map) {
  let created = 0
  let updated = 0
  for (const [i, item] of items.entries()) {
    const { match, doc } = map(item, i)
    const existing = await Model.findOne(match)
    if (existing) {
      await Model.updateOne(match, doc)
      updated += 1
    } else {
      await Model.create(doc)
      created += 1
    }
  }
  console.log(`✓ ${Model.modelName} — ${created} created, ${updated} updated.`)
}

main().catch((err) => {
  console.error('✗ Seed failed:', err.message)
  process.exit(1)
})
