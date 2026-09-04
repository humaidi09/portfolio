/**
 * A GitHub-style contribution heatmap for solved-problem activity.
 *
 * `daily` is a map of `YYYY-MM-DD → count`. Columns run oldest → newest, rows
 * are weekdays (Sun at top, like GitHub), and the rightmost column ends on
 * today. Amber is the site's one signal color, so intensity is amber alpha —
 * the platform's brand color stays on its card, keeping the section cohesive.
 *
 * Reused at two sizes: a compact strip on each platform card (labels off) and
 * a full year in the detail modal (labels on, horizontally scrollable).
 */

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
// Five steps: empty, then amber ramping up. Index 0 is a faint filled cell.
const LEVEL_MIX = [0, 26, 46, 68, 100]

function keyOf(date) {
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${m}-${d}`
}

function levelFor(count) {
  if (!count) return 0
  if (count < 2) return 1
  if (count < 4) return 2
  if (count < 7) return 3
  return 4
}

function cellStyle(level, size) {
  const base = {
    width: size,
    height: size,
    borderRadius: Math.max(2, Math.round(size * 0.22)),
  }
  if (level === 0) return { ...base, backgroundColor: 'var(--color-fill)' }
  return {
    ...base,
    backgroundColor: `color-mix(in oklab, var(--color-neon-cyan) ${LEVEL_MIX[level]}%, transparent)`,
  }
}

export default function Heatmap({
  daily = {},
  weeks = 53,
  cell = 12,
  gap = 3,
  showLabels = true,
  className = '',
}) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayWeekday = today.getDay() // 0 = Sun

  // Build the grid column-by-column (oldest column first).
  const columns = []
  const monthLabels = []
  let prevMonth = null
  for (let c = 0; c < weeks; c += 1) {
    const cells = []
    let columnMonth = null
    for (let r = 0; r < 7; r += 1) {
      const daysFromEnd = (weeks - 1 - c) * 7 + (todayWeekday - r)
      if (daysFromEnd < 0) {
        cells.push(null) // future cell in the final (current) week
        continue
      }
      const date = new Date(today)
      date.setDate(today.getDate() - daysFromEnd)
      const key = keyOf(date)
      const count = daily[key] || 0
      if (columnMonth === null) columnMonth = date.getMonth()
      cells.push({ key, count, level: levelFor(count), date })
    }
    columns.push(cells)
    // Label the column when its month rolls over (first week of a new month).
    if (showLabels && columnMonth !== null && columnMonth !== prevMonth) {
      monthLabels.push({ col: c, label: MONTHS[columnMonth] })
      prevMonth = columnMonth
    }
  }

  const colStep = cell + gap
  const gridWidth = weeks * colStep - gap

  return (
    <div className={`inline-flex flex-col ${className}`}>
      {showLabels && (
        <div className="relative mb-1 h-4" style={{ width: gridWidth, marginLeft: 26 }}>
          {monthLabels.map(({ col, label }) => (
            <span
              key={`${col}-${label}`}
              className="absolute font-mono text-[10px] text-muted"
              style={{ left: col * colStep }}
            >
              {label}
            </span>
          ))}
        </div>
      )}

      <div className="flex" style={{ gap }}>
        {showLabels && (
          <div className="mr-1 flex flex-col justify-between" style={{ gap, width: 22 }}>
            {['', 'Mon', '', 'Wed', '', 'Fri', ''].map((d, i) => (
              <span
                key={i}
                className="font-mono text-[9px] leading-none text-muted"
                style={{ height: cell, lineHeight: `${cell}px` }}
              >
                {d}
              </span>
            ))}
          </div>
        )}

        <div className="flex" style={{ gap }}>
          {columns.map((cells, c) => (
            <div key={c} className="flex flex-col" style={{ gap }}>
              {cells.map((cellData, r) =>
                cellData ? (
                  <div
                    key={cellData.key}
                    style={cellStyle(cellData.level, cell)}
                    title={`${cellData.count} solved · ${cellData.key}`}
                  />
                ) : (
                  <div key={`empty-${c}-${r}`} style={{ width: cell, height: cell }} />
                ),
              )}
            </div>
          ))}
        </div>
      </div>

      {showLabels && (
        <div className="mt-2 flex items-center gap-1.5 self-end font-mono text-[10px] text-muted">
          <span>Less</span>
          {[0, 1, 2, 3, 4].map((l) => (
            <span key={l} style={cellStyle(l, cell - 2)} />
          ))}
          <span>More</span>
        </div>
      )}
    </div>
  )
}
