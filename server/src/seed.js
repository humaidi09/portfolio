import 'dotenv/config'
import { connectDB } from './db.js'
import Project from './models/Project.js'

/**
 * One-time (idempotent) seed: pull the six projects from the frontend's static
 * data file and upsert them into MongoDB. Safe to re-run — matches on `slug`
 * (the old `id`) so it updates rather than duplicates.
 *
 *   node src/seed.js
 */
async function main() {
  await connectDB()

  // Import the frontend data file directly so there is one source of truth.
  const dataUrl = new URL('../../src/data/portfolioData.js', import.meta.url)
  const { projects } = await import(dataUrl.href)

  let created = 0
  let updated = 0

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
      updated += 1
    } else {
      await Project.create(doc)
      created += 1
    }
  }

  console.log(`✓ Seed complete — ${created} created, ${updated} updated.`)
  process.exit(0)
}

main().catch((err) => {
  console.error('✗ Seed failed:', err.message)
  process.exit(1)
})
