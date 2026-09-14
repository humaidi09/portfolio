import { useMemo, useState } from 'react'
import { GraduationCap, Plus, RotateCcw, Trash2 } from 'lucide-react'
import { Badge, Button, Callout, IconButton, NumberInput, Panel, Select, Stat, TextInput } from '../ui/kit'
import { GRADE_SCALE, classify, courseDetail, cumulative, fmt, summarize } from '../../../lib/demos/cgpa'

/**
 * CGPA Calculator — live port. Build one or more semesters of courses and the
 * engine returns each semester's credit-weighted GPA and the cumulative CGPA
 * pooled across every course (see lib/demos/cgpa.js). Opens on the write-up's
 * worked example so the canonical 3.45 is visible immediately.
 */

const GRADES = GRADE_SCALE.map((g) => g.grade)

// Monotonic id source for stable list keys across edits.
let _seq = 0
const uid = () => `row-${++_seq}`
const course = (title, grade, credits) => ({ id: uid(), title, grade, credits })

const INITIAL = () => [
  {
    id: uid(),
    label: 'Semester 1',
    courses: [
      course('Data Structures', 'A', '4'),
      course('Technical Writing', 'B', '3'),
      course('Calculus II', 'A-', '3'),
    ],
  },
]

export default function CgpaDemo() {
  const [semesters, setSemesters] = useState(INITIAL)

  // Derived figures — recomputed from the single source of truth on every edit.
  const perSemester = useMemo(() => semesters.map((s) => summarize(s.courses)), [semesters])
  const overall = useMemo(() => cumulative(semesters), [semesters])
  const band = classify(overall.gpa)

  /* --- mutations ------------------------------------------------------ */
  const patchCourse = (si, ci, key, value) =>
    setSemesters((prev) =>
      prev.map((s, i) =>
        i !== si ? s : { ...s, courses: s.courses.map((c, j) => (j !== ci ? c : { ...c, [key]: value })) },
      ),
    )
  const addCourse = (si) =>
    setSemesters((prev) => prev.map((s, i) => (i !== si ? s : { ...s, courses: [...s.courses, course('', 'A', '3')] })))
  const removeCourse = (si, ci) =>
    setSemesters((prev) => prev.map((s, i) => (i !== si ? s : { ...s, courses: s.courses.filter((_, j) => j !== ci) })))
  const addSemester = () =>
    setSemesters((prev) => [...prev, { id: uid(), label: `Semester ${prev.length + 1}`, courses: [course('', 'A', '3')] }])
  const removeSemester = (si) => setSemesters((prev) => prev.filter((_, i) => i !== si))
  const reset = () => setSemesters(INITIAL())

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      {/* ------------------------------------------------ semesters column */}
      <div className="order-2 space-y-6 lg:order-1">
        {semesters.map((s, si) => {
          const sum = perSemester[si]
          return (
            <Panel
              key={s.id}
              eyebrow={`// ${s.label.toLowerCase()}`}
              title={s.label}
              actions={
                <div className="flex items-center gap-2">
                  <Badge tone="accent">GPA {fmt(sum.gpa)}</Badge>
                  {semesters.length > 1 && (
                    <IconButton label={`Remove ${s.label}`} onClick={() => removeSemester(si)}>
                      <Trash2 className="h-4 w-4" />
                    </IconButton>
                  )}
                </div>
              }
              bodyClass="space-y-2"
            >
              {/* Column headers — desktop only */}
              <div className="hidden grid-cols-12 gap-3 px-1 pb-1 font-mono text-[10px] uppercase tracking-wider text-muted sm:grid">
                <span className="col-span-5">Course</span>
                <span className="col-span-2">Grade</span>
                <span className="col-span-2">Credits</span>
                <span className="col-span-2 text-right">Points</span>
                <span className="col-span-1" />
              </div>

              {s.courses.map((c, ci) => {
                const d = courseDetail(c)
                return (
                  <div
                    key={c.id}
                    className="grid grid-cols-2 gap-3 rounded-xl border border-hair bg-void/20 p-3 sm:grid-cols-12 sm:items-center sm:border-transparent sm:bg-transparent sm:p-1"
                  >
                    <div className="col-span-2 sm:col-span-5">
                      <TextInput
                        aria-label="Course title"
                        placeholder="Course name"
                        value={c.title}
                        onChange={(e) => patchCourse(si, ci, 'title', e.target.value)}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <span className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-muted sm:hidden">Grade</span>
                      <Select
                        aria-label="Grade"
                        value={c.grade}
                        onChange={(e) => patchCourse(si, ci, 'grade', e.target.value)}
                      >
                        {GRADES.map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-muted sm:hidden">Credits</span>
                      <NumberInput
                        aria-label="Credit hours"
                        min="0"
                        step="0.5"
                        value={c.credits}
                        onChange={(e) => patchCourse(si, ci, 'credits', e.target.value)}
                      />
                    </div>
                    <div className="col-span-1 text-right font-mono text-sm tabular-nums sm:col-span-2">
                      {d.valid ? (
                        <span className="text-ink">
                          <span className="text-muted">{d.point.toFixed(2)}×{d.credits}=</span>
                          <span className="ml-1 font-semibold text-neonCyan">{d.qualityPoints.toFixed(2)}</span>
                        </span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </div>
                    <div className="col-span-1 flex justify-end sm:col-span-1">
                      <IconButton
                        label="Remove course"
                        onClick={() => removeCourse(si, ci)}
                        disabled={s.courses.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </IconButton>
                    </div>
                  </div>
                )
              })}

              <div className="flex items-center justify-between pt-1">
                <Button variant="ghost" size="sm" onClick={() => addCourse(si)}>
                  <Plus className="h-4 w-4" />
                  Add course
                </Button>
                <span className="font-mono text-xs text-muted">
                  {fmt(sum.qualityPoints)} pts ÷ {fmt(sum.credits)} cr
                </span>
              </div>
            </Panel>
          )
        })}

        <div className="flex flex-wrap gap-3">
          <Button variant="ghost" onClick={addSemester}>
            <Plus className="h-4 w-4" />
            Add semester
          </Button>
          <Button variant="subtle" onClick={reset}>
            <RotateCcw className="h-4 w-4" />
            Reset to example
          </Button>
        </div>
      </div>

      {/* ------------------------------------------------- results sidebar */}
      <div className="order-1 space-y-4 lg:order-2">
        <Stat
          label="Cumulative CGPA"
          value={fmt(overall.gpa)}
          sub={`on a 4.00 scale · ${overall.counted} course${overall.counted === 1 ? '' : 's'}`}
          accent
        />
        <div className="flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-neonCyan" />
          <Badge tone={overall.gpa >= 3.25 ? 'good' : overall.gpa >= 2.0 ? 'warn' : 'bad'}>{band}</Badge>
        </div>

        <Callout tone="info" title="How it's computed">
          CGPA pools every course, not the average of semester GPAs:
          <div className="mt-2 rounded-lg bg-void/40 px-3 py-2 font-mono text-xs text-ink">
            {fmt(overall.qualityPoints)} pts ÷ {fmt(overall.credits)} cr ={' '}
            <span className="font-semibold text-neonCyan">{fmt(overall.gpa)}</span>
          </div>
        </Callout>

        <Panel eyebrow="// grade scale" bodyClass="p-0">
          <ul className="divide-y divide-hair">
            {GRADE_SCALE.map((g) => (
              <li key={g.grade} className="flex items-center justify-between px-4 py-2 text-sm">
                <span className="font-mono font-semibold text-ink">{g.grade}</span>
                <span className="font-mono tabular-nums text-muted">{g.point.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  )
}
