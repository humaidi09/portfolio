import 'dotenv/config'
import { connectDB } from './db.js'
import Project from './models/Project.js'
import Experience from './models/Experience.js'
import Certification from './models/Certification.js'
import Stat from './models/Stat.js'
import Result from './models/Result.js'

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
  const { projects, experiences, certifications, stats } = await import(dataUrl.href)

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

  // Results — no static source; seed a sensible starting row from the current GPA.
  const results = [
    { term: '3rd Semester', gpa: '3.85', scale: '4.00', note: 'Current' },
  ]
  await upsertMany(Result, results, (r, i) => ({
    match: { term: r.term },
    doc: {
      term: r.term,
      gpa: r.gpa || '',
      scale: r.scale || '4.00',
      note: r.note || '',
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
