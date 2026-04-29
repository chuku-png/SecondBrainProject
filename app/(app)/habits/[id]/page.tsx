import { getHabitWithCalendar } from '@/app/_actions/habits'
import { getAuthUser } from '@/app/_actions/auth'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Pencil, Flame } from 'lucide-react'
import MonthCalendar from '../_components/MonthCalendar'

export default async function HabitDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await getAuthUser()
  if (!user) redirect('/login')

  const { data, error } = await getHabitWithCalendar(id)
  if (error || !data) notFound()

  const { habit, completedDates } = data

  // Build calendarData for per-habit mode (date -> true)
  const calendarData: Record<string, boolean> = {}
  for (const date of completedDates) {
    calendarData[date] = true
  }

  const totalDays  = completedDates.length
  const freqLabel  = habit.frequency === 7 ? 'Diario' : `${habit.frequency}x / semana`

  // Streak from completedDates
  const datesSet   = new Set(completedDates)
  const today      = new Date()
  const todayStr   = today.toISOString().split('T')[0]
  let streak       = 0
  const check      = new Date()
  if (!datesSet.has(todayStr)) check.setDate(check.getDate() - 1)
  for (let i = 0; i < 365; i++) {
    const d = check.toISOString().split('T')[0]
    if (datesSet.has(d)) { streak++; check.setDate(check.getDate() - 1) }
    else break
  }

  // Weekly count
  const dow    = today.getDay()
  const monday = new Date(today)
  monday.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1))
  const mondayStr  = monday.toISOString().split('T')[0]
  const weeklyCount = completedDates.filter(d => d >= mondayStr && d <= todayStr).length

  return (
    <div className="min-h-screen bg-brand-bg dot-pattern">
      <div className="max-w-lg mx-auto px-4 pt-6 pb-8 md:px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href="/habits" className="text-brand-muted hover:text-brand-text transition-colors">
              <ChevronLeft size={22} />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: habit.color }} />
              <h1 className="text-xl font-bold text-brand-text font-mono">{habit.name}</h1>
            </div>
          </div>
          <Link
            href={`/habits/${habit.id}/edit`}
            className="flex items-center gap-1.5 text-brand-muted hover:text-brand-text transition-colors text-xs font-mono"
          >
            <Pencil size={13} />
            Editar
          </Link>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-3 text-center">
            <p className="text-2xl font-bold font-mono text-brand-dark leading-none">{streak}</p>
            <div className="flex items-center justify-center gap-1 mt-1">
              <Flame size={10} className="text-orange-400" />
              <p className="text-[10px] font-mono text-brand-muted">Racha</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-3 text-center">
            <p className="text-2xl font-bold font-mono text-brand-dark leading-none">{weeklyCount}/{habit.frequency}</p>
            <p className="text-[10px] font-mono text-brand-muted mt-1">Esta semana</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-3 text-center">
            <p className="text-2xl font-bold font-mono text-brand-dark leading-none">{totalDays}</p>
            <p className="text-[10px] font-mono text-brand-muted mt-1">Total días</p>
          </div>
        </div>

        {/* Frequency tag */}
        <div className="flex items-center gap-2 mb-4">
          <span
            className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold font-mono text-white"
            style={{ backgroundColor: habit.color }}
          >
            {freqLabel}
          </span>
        </div>

        {/* Calendar */}
        <MonthCalendar
          calendarData={calendarData}
          habitColor={habit.color}
          showLegend={false}
        />

        <p className="text-center text-[10px] font-mono text-brand-muted mt-3">
          Los días marcados son cuando completaste este hábito
        </p>
      </div>
    </div>
  )
}
