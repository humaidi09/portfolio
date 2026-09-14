// Faithful in-browser port of the CGPA-Calculator core (C++ → JS).
//
// The engine mirrors the repo's Semester/Transcript model: a semester holds
// courses, its GPA is the credit-weighted mean of its courses' grade points,
// and the cumulative CGPA is every grade point earned divided by every credit
// attempted — NOT the mean of the semester GPAs (see Transcript::cgpa). The one
// deliberate divergence from the C++ source is the grade scale: the demo uses
// the 7-grade scale published in the write-up and slides, which is the number a
// visitor comparing the two will expect.

// Letter grade → grade point, highest first (matches the blog/slides scale).
export const GRADE_SCALE = [
  { grade: 'A+', point: 4.0 },
  { grade: 'A', point: 3.75 },
  { grade: 'A-', point: 3.5 },
  { grade: 'B+', point: 3.25 },
  { grade: 'B', point: 3.0 },
  { grade: 'C', point: 2.5 },
  { grade: 'F', point: 0.0 },
]

const POINT_OF = new Map(GRADE_SCALE.map((g) => [g.grade, g.point]))

/** Grade point for a letter grade, or null when it is off-scale. */
export function gradePoint(grade) {
  const p = POINT_OF.get(grade)
  return p === undefined ? null : p
}

/**
 * Reduce a list of courses to its credit-weighted totals. A course counts only
 * when its grade is on-scale and its credit hours are positive — the same guard
 * the C++ addCourse() applies before it stores anything.
 */
export function summarize(courses) {
  let credits = 0
  let qualityPoints = 0 // Σ (grade point × credit hours)
  let counted = 0
  for (const c of courses) {
    const point = gradePoint(c.grade)
    const cr = Number(c.credits)
    if (point === null || !Number.isFinite(cr) || cr <= 0) continue
    credits += cr
    qualityPoints += point * cr
    counted += 1
  }
  const gpa = credits > 0 ? qualityPoints / credits : 0
  return { credits, qualityPoints, gpa, counted }
}

/** Per-course breakdown used by the demo table: point and quality points. */
export function courseDetail(course) {
  const point = gradePoint(course.grade)
  const cr = Number(course.credits)
  const valid = point !== null && Number.isFinite(cr) && cr > 0
  return {
    point,
    credits: valid ? cr : 0,
    qualityPoints: valid ? point * cr : 0,
    valid,
  }
}

/**
 * Cumulative CGPA across every semester: all grade points earned over all
 * credits attempted. Faithful to Transcript::cgpa — it pools the courses, it is
 * not the average of the per-semester GPAs.
 */
export function cumulative(semesters) {
  return summarize(semesters.flatMap((s) => s.courses))
}

/** Letter classification a university would print next to a CGPA. */
export function classify(cgpa) {
  if (cgpa >= 3.75) return 'Excellent (First Class)'
  if (cgpa >= 3.25) return 'Very Good'
  if (cgpa >= 2.75) return 'Good'
  if (cgpa >= 2.25) return 'Satisfactory'
  if (cgpa >= 2.0) return 'Pass'
  return 'Fail'
}

/** GPA/CGPA are shown to two decimals, the convention on a transcript. */
export function fmt(n) {
  return n.toFixed(2)
}
