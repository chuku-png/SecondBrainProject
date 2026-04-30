'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const TYPE_COLORS: Record<string, string> = {
  Fuerza:    '#fb923c',
  Cardio:    '#60a5fa',
  Yoga:      '#c084fc',
  Natación:  '#22d3ee',
  Ciclismo:  '#4ade80',
  Funcional: '#facc15',
  Boxeo:     '#f87171',
  Pilates:   '#f472b6',
  Otro:      '#94a3b8',
}

const DAY_HEADERS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

function getColor(types: string[]): string {
  if (!types.length) return ''
  return TYPE_COLORS[types[0]] ?? TYPE_COLORS['Otro']
}

export default function GymCalendar({
  calendarData,
  todayStr,
}: {
  calendarData: Record<string, string[]>
  todayStr: string
}) {
  const today = new Date(todayStr + 'T12:00:00')
  const [year, setYear]   = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())

  function prev() {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }
  function next() {
    const nextY = month === 11 ? year + 1 : year
    const nextM = month === 11 ? 0 : month + 1
    const limit = new Date(today.getFullYear(), today.getMonth(), 1)
    const candidate = new Date(nextY, nextM, 1)
    if (candidate > limit) return
    setYear(nextY); setMonth(nextM)
  }

  const monthLabel = new Date(year, month, 1).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })
  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth()

  // Build day grid (Mon-start)
  const firstDay = new Date(year, month, 1)
  const dow = firstDay.getDay()
  const offset = dow === 0 ? 6 : dow - 1
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells: (number | null)[] = [
    ...Array(offset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  // Count workouts this month
  const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`
  const trainingDays = Object.keys(calendarData).filter(d => d.startsWith(monthPrefix)).length

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
        <button onClick={prev} className="p-1 text-brand-muted hover:text-brand-text transition-colors rounded-lg">
          <ChevronLeft size={15} />
        </button>
        <div className="text-center">
          <p className="text-xs font-bold font-mono text-brand-text capitalize">{monthLabel}</p>
          <p className="text-[10px] font-mono text-brand-muted">{trainingDays} días entrenados</p>
        </div>
        <button onClick={next} disabled={isCurrentMonth}
          className="p-1 text-brand-muted hover:text-brand-text transition-colors rounded-lg disabled:opacity-30">
          <ChevronRight size={15} />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 px-2 pt-2">
        {DAY_HEADERS.map(d => (
          <div key={d} className="text-center text-[9px] font-mono font-bold text-brand-muted uppercase pb-1">{d}</div>
        ))}
      </div>

      {/* Cells */}
      <div className="grid grid-cols-7 px-2 pb-3 gap-y-1">
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const types   = calendarData[dateStr] ?? []
          const color   = getColor(types)
          const isToday = dateStr === todayStr
          const isFuture = dateStr > todayStr
          const trained  = types.length > 0
          const label    = types.length > 1 ? `${types[0]} +${types.length - 1}` : types[0]

          return (
            <div key={dateStr} className="flex flex-col items-center gap-0.5 relative group">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-mono transition-all ${
                  trained
                    ? 'text-white font-bold'
                    : isToday
                      ? 'ring-1 ring-brand-dark text-brand-dark font-bold'
                      : isFuture
                        ? 'text-gray-200'
                        : 'text-brand-muted'
                }`}
                style={trained ? { backgroundColor: color } : undefined}
              >
                {day}
              </div>
              {/* Tooltip */}
              {trained && (
                <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-brand-dark text-white text-[9px] font-mono px-1.5 py-0.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  {label}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="px-3 pb-3 flex flex-wrap gap-2">
        {Object.entries(TYPE_COLORS).slice(0, 4).map(([type, color]) => (
          <div key={type} className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-[9px] font-mono text-brand-muted">{type}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
