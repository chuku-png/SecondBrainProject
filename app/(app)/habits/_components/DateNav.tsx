'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function DateNav({
  selectedDate,
  todayStr,
}: {
  selectedDate: string
  todayStr: string
}) {
  const router = useRouter()
  const isToday = selectedDate === todayStr

  function go(delta: number) {
    const d = new Date(selectedDate + 'T12:00:00')
    d.setDate(d.getDate() + delta)
    const next = d.toISOString().split('T')[0]
    if (next > todayStr) return
    router.push(next === todayStr ? '/habits' : `/habits?date=${next}`)
  }

  const label = isToday
    ? 'Hoy'
    : new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-AR', {
        weekday: 'short', day: 'numeric', month: 'short',
      })

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => go(-1)}
        className="p-1.5 rounded-lg text-brand-muted hover:text-brand-text hover:bg-brand-border/20 transition-colors"
        aria-label="Día anterior"
      >
        <ChevronLeft size={16} />
      </button>
      <span className={`text-sm font-mono font-bold min-w-[90px] text-center ${isToday ? 'text-brand-dark' : 'text-brand-muted'}`}>
        {label}
      </span>
      <button
        onClick={() => go(1)}
        disabled={isToday}
        className="p-1.5 rounded-lg text-brand-muted hover:text-brand-text hover:bg-brand-border/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Día siguiente"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  )
}
