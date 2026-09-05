import 'dotenv/config'
import mongoose from 'mongoose'
import { connectDB } from './db.js'
import CpProfile from './models/CpProfile.js'

/**
 * Targeted seed: upsert ONLY the competitive-programming judge cards into the
 * live DB (matched on `key`, so it updates rather than duplicates). Kept
 * separate from the full seed so it never overwrites other collections that are
 * edited via /admin. portfolioData.js stays the single source of truth.
 *
 *   node src/seedCp.js
 */
async function main() {
  await connectDB()
  const dataUrl = new URL('../../src/data/portfolioData.js', import.meta.url)
  const { competitiveProgramming } = await import(dataUrl.href)

  let created = 0
  let updated = 0
  for (const [i, p] of competitiveProgramming.entries()) {
    const match = { key: p.key }
    const doc = {
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
      stats: p.stats ?? null,
      order: i,
    }
    const existing = await CpProfile.findOne(match)
    if (existing) {
      await CpProfile.updateOne(match, { $set: doc })
      updated += 1
    } else {
      await CpProfile.create(doc)
      created += 1
    }
  }
  console.log(
    `✓ CpProfile — ${created} created, ${updated} updated. Total now: ${await CpProfile.countDocuments()}`,
  )
  await mongoose.disconnect()
  process.exit(0)
}

main().catch((err) => {
  console.error('✗ CP seed failed:', err.message)
  process.exit(1)
})
