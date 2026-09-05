import 'dotenv/config'
import mongoose from 'mongoose'
import { connectDB } from './db.js'
import SkillGroup from './models/SkillGroup.js'

/**
 * Targeted seed: upsert ONLY the skill groups into the live DB (matched on
 * title, so it updates rather than duplicates). Kept separate from the full
 * seed so it never overwrites other collections that are edited via /admin.
 *
 *   node src/seedSkills.js
 */
async function main() {
  await connectDB()
  const dataUrl = new URL('../../src/data/portfolioData.js', import.meta.url)
  const { skillGroups } = await import(dataUrl.href)

  let created = 0
  let updated = 0
  for (const [i, g] of skillGroups.entries()) {
    const match = { title: g.title }
    const doc = { title: g.title, items: g.items || [], order: i }
    const existing = await SkillGroup.findOne(match)
    if (existing) {
      await SkillGroup.updateOne(match, doc)
      updated += 1
    } else {
      await SkillGroup.create(doc)
      created += 1
    }
  }
  console.log(`✓ SkillGroup — ${created} created, ${updated} updated. Total now: ${await SkillGroup.countDocuments()}`)
  await mongoose.disconnect()
  process.exit(0)
}

main().catch((err) => {
  console.error('✗ Skill seed failed:', err.message)
  process.exit(1)
})
