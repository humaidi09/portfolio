import 'dotenv/config'
import { connectDB } from '../db.js'
import Project from '../models/Project.js'
import Profile from '../models/Profile.js'

/**
 * One-time, idempotent, NON-destructive migration for the "control everything
 * from the DB" work. Unlike seed.js (which can overwrite admin-edited rows), this
 * only ever fills gaps — it never clobbers an existing edited value:
 *
 *   1. Create the Profile identity document from the static data ONLY if none
 *      exists yet (so admin edits made after this runs are never overwritten).
 *   2. Create the `sudoku-solver` project if it is missing from the live DB.
 *   3. For the six web apps, $set `sourceUrl` (only when currently empty/absent)
 *      and $unset the dead `demo` field.
 *
 * Reads server/.env for MONGODB_URI (never printed). Safe to re-run.
 *
 *   node src/scripts/migrate-db-control.js
 */
async function main() {
  await connectDB()

  // Import the frontend data file directly so there is one source of truth.
  const dataUrl = new URL('../../../src/data/portfolioData.js', import.meta.url)
  const { personalInfo, skills, projects } = await import(dataUrl.href)

  // 1) Profile — create from static identity only if the collection is empty.
  const existingProfile = await Profile.findOne()
  if (existingProfile) {
    console.log('• Profile already exists — left untouched (admin edits preserved).')
  } else {
    await Profile.create({
      name: personalInfo.name || '',
      photo: personalInfo.photo || '',
      role: personalInfo.role || '',
      tagline: personalInfo.tagline || '',
      phone: personalInfo.phone || '',
      email: personalInfo.email || '',
      github: personalInfo.github || '',
      linkedin: personalInfo.linkedin || '',
      whatsapp: personalInfo.whatsapp || '',
      facebook: personalInfo.facebook || '',
      instagram: personalInfo.instagram || '',
      twitter: personalInfo.twitter || '',
      university: personalInfo.university || '',
      degree: personalInfo.degree || '',
      gpa: personalInfo.gpa || '',
      semester: personalInfo.semester || '',
      bio: personalInfo.bio || '',
      skillLanguages: skills.languages || [],
      skillCoreCS: skills.coreCS || [],
      skillTools: skills.toolsAndDB || [],
    })
    console.log('✓ Profile created from static identity.')
  }

  // 2) sudoku-solver — create if missing (it is absent from the live DB).
  const staticSudoku = projects.find((p) => p.id === 'sudoku-solver')
  if (staticSudoku) {
    const exists = await Project.findOne({ slug: 'sudoku-solver' })
    if (exists) {
      console.log('• Project sudoku-solver already present.')
    } else {
      // Place it right after the six apps (max order + 1) so the grid order is stable.
      const last = await Project.findOne().sort({ order: -1 })
      await Project.create({
        slug: 'sudoku-solver',
        title: staticSudoku.title,
        category: staticSudoku.category || '',
        tech: staticSudoku.tech || [],
        summary: staticSudoku.summary || '',
        details: staticSudoku.details || '',
        github: staticSudoku.github || '',
        sourceUrl: staticSudoku.sourceUrl || '',
        liveUrl: staticSudoku.liveUrl || '',
        alwaysShow: !!staticSudoku.alwaysShow,
        order: (last?.order ?? 0) + 1,
      })
      console.log('✓ Project sudoku-solver created.')
    }
  }

  // 3) For each static project carrying a sourceUrl, set it when the DB doc is
  //    missing/empty, and drop the dead `demo` field everywhere it lingers.
  let setCount = 0
  for (const p of projects) {
    if (!p.sourceUrl) continue
    const doc = await Project.findOne({ slug: p.id })
    if (doc && !doc.sourceUrl) {
      await Project.updateOne({ slug: p.id }, { $set: { sourceUrl: p.sourceUrl } })
      setCount += 1
    }
  }
  const unset = await Project.updateMany({ demo: { $exists: true } }, { $unset: { demo: '' } })
  console.log(`✓ sourceUrl set on ${setCount} project(s); demo removed from ${unset.modifiedCount} doc(s).`)

  console.log('✓ Migration complete.')
  process.exit(0)
}

main().catch((err) => {
  console.error('✗ Migration failed:', err.message)
  process.exit(1)
})
