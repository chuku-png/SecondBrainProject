interface HabitProgress {
  id: string
  name: string
  color: string
  frequency: number
  weeklyCount: number
}

export default function WeekProgressPanel({ habits }: { habits: HabitProgress[] }) {
  if (habits.length === 0) return null

  const today = new Date()
  const dow = today.getDay()
  const monday = new Date(today)
  monday.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1))

  const weekDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
  const currentDow = dow === 0 ? 6 : dow - 1 // 0=Mon … 6=Sun

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="px-4 pt-3.5 pb-1 flex items-center justify-between">
        <p className="text-[10px] font-mono text-brand-muted uppercase tracking-wide">Esta semana</p>
        <div className="flex gap-px">
          {weekDays.map((d, i) => (
            <span
              key={i}
              className={`text-[8px] font-mono w-5 text-center ${
                i === currentDow ? 'text-brand-dark font-bold' : 'text-brand-border'
              }`}
            >
              {d}
            </span>
          ))}
        </div>
      </div>

      <div className="px-4 pb-3 flex flex-col gap-2.5 mt-1">
        {habits.map(h => {
          const done  = h.weeklyCount
          const total = h.frequency
          const pct   = total > 0 ? Math.min(1, done / total) : 0
          const met   = done >= total

          return (
            <div key={h.id}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: h.color }} />
                  <span className="text-xs font-mono text-brand-text truncate">{h.name}</span>
                </div>
                <span className={`text-xs font-bold font-mono flex-shrink-0 ml-2 ${met ? 'text-green-500' : 'text-brand-muted'}`}>
                  {done}/{total}
                </span>
              </div>
              <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${pct * 100}%`, backgroundColor: met ? '#22c55e' : h.color }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
