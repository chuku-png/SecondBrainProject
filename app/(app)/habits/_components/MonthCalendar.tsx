'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

// Global mode: calendarData[date] = { done, total }
// Per-habit mode: calendarData[date] = true (completed)
type CalendarData =
  | Record<string, { done: number; total: number }>
  | Record<string, boolean>

function isGlobal(data: CalendarData, date: string): data is Record<string, { done: number; total: number }> {
  const v = (data as Record<string, unknown>)[date]
  return typeof v === 'object' && v !== null && 'done' in v
}

function getDayColor(
  data: CalendarData,
  date: string,
  habitColor?: string
): string | null {
  const v = (data as Record<string, unknown>)[date]
  if (!v) return null

  if (typeof v === 'boolean') {
    return v ? (habitColor ?? '#22c55e') : null
  }

  const { done, total } = v as { done: number; total: number }
  if (total === 0 || done === 0) return null
  if (done >= total) return '#22c55e'
  return '#f97316'
}

export default function MonthCalendar({
  calendarData,
  habitColor,
  showLegend = true,
}: {
  calendarData: CalendarData
  habitColor?: string
  showLegend?: boolean
}) {
  const now = new Date()
  const [viewDate, setViewDate] = useState(new Date(now.getFullYear(), now.getMonth(), 1))

  const year  = viewDate.getFullYear()
  const month = viewDate.getMonth()

  const todayStr = now.toISOString().split('T')[0]

  // First day of month (adjusted to Mon-start: 0=Mon … 6=Sun)
  const firstDow = new Date(year, month, 1).getDay()
  const startOffset = (firstDow + 6) % 7

  const daysInMonth  = new Date(year, month + 1, 0).getDate()
  const daysInPrev   = new Date(year, month, 0).getDate()

  const cells: { date: string; day: number; inMonth: boolean }[] = []

  // Padding from previous month
  for (let i = startOffset - 1; i >= 0; i--) {
    const d = daysInPrev - i
    const date = new Date(year, month - 1, d).toISOString().split('T')[0]
    cells.push({ date, day: d, inMonth: false })
  }

  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d).toISOString().split('T')[0]
    cells.push({ date, day: d, inMonth: true })
  }

  // Next month padding
  const remaining = cells.length % 7 === 0 ? 0 : 7 - (cells.length % 7)
  for (let d = 1; d <= remaining; d++) {
    const date = new Date(year, month + 1, d).toISOString().split('T')[0]
    cells.push({ date, day: d, inMonth: false })
  }

  const monthLabel = viewDate.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })

  const isGlobalMode = Object.values(calendarData).some(v => typeof v === 'object' && v !== null && 'done' in v)

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4">
      {/* Nav */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setViewDate(new Date(year, month - 1, 1))}
          className="p-1.5 text-brand-muted hover:text-brand-text transition-colors rounded-lg"
        >
          <ChevronLeft size={15} />
        </button>
        <p className="text-xs font-bold font-mono text-brand-text capitalize">{monthLabel}</p>
        <button
          onClick={() => setViewDate(new Date(year, month + 1, 1))}
          className="p-1.5 text-brand-muted hover:text-brand-text transition-colors rounded-lg"
        >
          <ChevronRight size={15} />
        </button>
      </div>

      {/* Day headers Mon–Sun */}
      <div className="grid grid-cols-7 mb-1.5">
        {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((d, i) => (
          <div key={i} className="text-center text-[9px] font-mono text-brand-muted font-bold py-0.5">
            {d}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7">
        {cells.map(({ date, day, inMonth }) => {
          if (!inMonth) {
            return <div key={date} className="h-8" />
          }

          const isFuture = date > todayStr
          const isToday  = date === todayStr
          const bg = isFuture ? null : getDayColor(calendarData, date, habitColor)

          return (
            <div key={date} className="flex items-center justify-center h-8">
              <div
                className={`w-7 h-7 flex items-center justify-center rounded-full text-[11px] font-mono transition-colors
                  ${bg ? 'text-white font-bold' : isFuture ? 'text-gray-200' : 'text-brand-muted'}
                  ${isToday && !bg ? 'ring-1 ring-brand-dark text-brand-dark font-bold' : ''}
                `}
                style={bg ? { backgroundColor: bg } : undefined}
              >
                {day}
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
          {isGlobalMode ? (
            <>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-green-400 flex-shrink-0" />
                <span className="text-[10px] font-mono text-brand-muted">Todos</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-orange-400 flex-shrink-0" />
                <span className="text-[10px] font-mono text-brand-muted">Parcial</span>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: habitColor ?? '#22c55e' }} />
              <span className="text-[10px] font-mono text-brand-muted">Completado</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
