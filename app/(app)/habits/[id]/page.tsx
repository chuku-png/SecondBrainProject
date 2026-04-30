import { getHabitWithCalendar, getHabitWeekLogs } from '@/app/_actions/habits'
import { getAuthUser } from '@/app/_actions/auth'
import { localDateStr, localMondayStr } from '@/lib/timezone'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Pencil, Flame } from 'lucide-react'
import MonthCalendar from '../_components/MonthCalendar'
import WeekDayStrip from '../_components/WeekDayStrip'

export default async function HabitDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await getAuthUser()
  if (!user) redirect('/login')

  const [{ data, error }, { data: weekLogsData }] = await Promise.all([
    getHabitWithCalendar(id),
    getHabitWeekLogs(id),
  ])
  if (error || !data) notFound()

  const { habit, completedDates } = data

  const calendarData: Record<string, boolean> = {}
  for (const date of completedDates) {
    calendarData[date] = true
  }

  const totalDays = completedDates.length
  const freqLabel = habit.frequency === 7 ? 'Diario' : `${habit.frequency}x / semana`

  const todayStr  = localDateStr()
  const mondayStr = localMondayStr()

  // Streak
  const datesSet = new Set(completedDates)
  let streak     = 0
  const check    = new Date(todayStr + 'T12:00:00')
  if (!datesSet.has(todayStr)) check.setDate(check.getDate() - 1)
  for (let i = 0; i < 365; i++) {
    const d = check.toISOString().split('T')[0]
    if (datesSet.has(d)) { streak++; check.setDate(check.getDate() - 1) }
    else break
  }

  // Weekly count
  const weeklyCount = completedDates.filter(d => d >= mondayStr && d <= todayStr).length

  // Build 7 days of current week (Mon–Sun)
  const weekDays: string[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(mondayStr + 'T12:00:00')
    d.setDate(d.getDate() + i)
    weekDays.push(d.toISOString().split('T')[0])
  }

  // Build week logs array for the strip
  const weekLogs = (weekLogsData ?? []).map(l => ({
    id: l.id,
    date: l.date,
    completed: l.completed,
    note: l.note ?? null,
  }))

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
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold font-mono text-white"
            style={{ backgroundColor: habit.color }}>
            {freqLabel}
          </span>
        </div>

        {/* Weekly day strip */}
        <div className="mb-4">
          <WeekDayStrip
            habitId={habit.id}
            habitColor={habit.color}
            linkedModule={habit.linked_module}
            weekDays={weekDays}
            initialLogs={weekLogs}
            todayStr={todayStr}
          />
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
