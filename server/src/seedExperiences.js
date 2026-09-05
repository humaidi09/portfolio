import 'dotenv/config'
import mongoose from 'mongoose'
import { connectDB } from './db.js'
import Experience from './models/Experience.js'

/**
 * Targeted seed: upsert ONLY the experience / involvement entries into the live
 * DB (matched on role + organization, so it updates rather than duplicates).
 * Kept separate from the full seed so it never overwrites other collections
 * that are edited via /admin. portfolioData.js stays the single source of truth.
 *
 *   node src/seedExperiences.js
 */
async function main() {
  await connectDB()
  const dataUrl = new URL('../../src/data/portfolioData.js', import.meta.url)
  const { experiences } = await import(dataUrl.href)

  let created = 0
  let updated = 0
  for (const [i, e] of experiences.entries()) {
    const match = { role: e.role, organization: e.organization }
    const doc = { ...match, period: e.period || '', skills: e.skills || [], order: i }
    const existing = await Experience.findOne(match)
    if (existing) {
      await Experience.updateOne(match, doc)
      updated += 1
    } else {
      await Experience.create(doc)
      created += 1
    }
  }
  console.log(
    `✓ Experience — ${created} created, ${updated} updated. Total now: ${await Experience.countDocuments()}`,
  )
  await mongoose.disconnect()
  process.exit(0)
}

main().catch((err) => {
  console.error('✗ Experience seed failed:', err.message)
  process.exit(1)
})
