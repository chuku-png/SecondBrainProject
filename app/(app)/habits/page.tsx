import { getHabitsData } from '@/app/_actions/habits'
import { Flame, CheckCircle2 } from 'lucide-react'
import HabitItem from './_components/HabitItem'
import { HabitNewButton } from './_components/HabitModal'

export default async function HabitsPage() {
  const { data: habits, error } = await getHabitsData()

  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  const dateLabel = today.toLocaleDateString('es-AR', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  const pendingHabits   = habits?.filter(h => !h.completed) ?? []
  const completedHabits = habits?.filter(h => h.completed) ?? []
  const completedCount  = completedHabits.length
  const totalCount      = habits?.length ?? 0
  const pct             = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
  const topStreak       = habits ? Math.max(0, ...habits.map(h => h.streak)) : 0

  return (
    <div className="min-h-screen bg-brand-bg dot-pattern">
      <header className="px-4 pt-6 pb-4 md:px-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-text font-mono">Hábitos</h1>
          <p className="text-brand-muted text-sm font-mono capitalize mt-0.5">{dateLabel}</p>
        </div>
        <HabitNewButton variant="header" />
      </header>

      <div className="px-4 pb-8 md:px-8 md:max-w-5xl">
        <div className="md:flex md:gap-6 md:items-start">

          {/* Columna principal */}
          <div className="flex-1 min-w-0">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
                <p className="text-red-700 text-sm font-mono">{error}</p>
              </div>
            )}

            {totalCount > 0 && (
              <div className="md:hidden bg-white rounded-2xl border border-gray-100 px-4 py-3 mb-4 flex items-center justify-between">
                <span className="text-brand-muted text-xs font-mono">Hoy completados</span>
                <span className="text-brand-dark font-bold font-mono text-sm">{completedCount} / {totalCount}</span>
              </div>
            )}

            {!habits || habits.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-4xl mb-3">🎯</p>
                <p className="text-brand-text font-bold font-mono">Sin hábitos todavía</p>
                <p className="text-brand-muted text-sm font-mono mt-1">Creá tu primer hábito para empezar a trackear</p>
                <HabitNewButton variant="header" />
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {pendingHabits.map(habit => (
                  <HabitItem key={habit.id} habit={habit} todayStr={todayStr} />
                ))}
                {completedHabits.length > 0 && (
                  <>
                    {pendingHabits.length > 0 && (
                      <p className="text-brand-muted text-xs font-mono px-1 mt-2">Completados</p>
                    )}
                    {completedHabits.map(habit => (
                      <div key={habit.id} className="opacity-60">
                        <HabitItem habit={habit} todayStr={todayStr} />
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Sidebar desktop */}
          <div className="hidden md:flex md:flex-col md:gap-4 md:w-72 md:flex-shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-4 pt-3.5 pb-1">
                <p className="text-[10px] font-mono text-brand-muted uppercase tracking-wide">Hoy</p>
              </div>
              <div className="px-4 pb-4 flex items-end gap-3">
                <div>
                  <p className="text-4xl font-bold font-mono text-brand-dark leading-none">{pct}%</p>
                  <p className="text-xs font-mono text-brand-muted mt-1">{completedCount} de {totalCount} completados</p>
                </div>
                <CheckCircle2 size={32} className={`mb-1 ml-auto ${pct === 100 ? 'text-green-400' : 'text-brand-border'}`} />
              </div>
              {totalCount > 0 && (
                <div className="mx-4 mb-4 h-1.5 bg-brand-border/20 rounded-full overflow-hidden">
                  <div className="h-full bg-green-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
              )}
            </div>

            {topStreak > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3">
                <Flame size={20} className="text-orange-400 flex-shrink-0" />
                <div>
                  <p className="text-[10px] font-mono text-brand-muted uppercase tracking-wide">Mejor racha activa</p>
                  <p className="text-brand-dark font-bold font-mono text-lg leading-none mt-0.5">{topStreak} días</p>
                </div>
              </div>
            )}

            <HabitNewButton variant="sidebar" />
          </div>
        </div>
      </div>

      <HabitNewButton variant="fab" />
    </div>
  )
}
