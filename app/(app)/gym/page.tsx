import { getWorkouts, getWorkoutsCalendar } from '@/app/_actions/gym'
import { localDateStr, localMondayStr } from '@/lib/timezone'
import { Dumbbell } from 'lucide-react'
import WorkoutItem from './_components/WorkoutItem'
import { GymNewButton } from './_components/WorkoutModal'
import GymCalendar from './_components/GymCalendar'

export default async function GymPage() {
  const todayStr   = localDateStr()
  const mondayStr  = localMondayStr()

  const [{ data: workouts, error }, { data: calendarData }] = await Promise.all([
    getWorkouts(60),
    getWorkoutsCalendar(),
  ])

  const todayWorkouts = workouts?.filter(w => w.date === todayStr) ?? []
  const weekWorkouts  = workouts?.filter(w => w.date >= mondayStr && w.date <= todayStr) ?? []
  const pastWorkouts  = workouts?.filter(w => w.date !== todayStr) ?? []

  const totalMinutes = workouts?.reduce((s, w) => s + (w.duration_minutes ?? 0), 0) ?? 0
  const weekMinutes  = weekWorkouts.reduce((s, w) => s + (w.duration_minutes ?? 0), 0)

  const typeCount: Record<string, number> = {}
  for (const w of workouts ?? []) {
    typeCount[w.type] = (typeCount[w.type] ?? 0) + 1
  }
  const topTypes = Object.entries(typeCount).sort((a, b) => b[1] - a[1]).slice(0, 4)

  const grouped: Record<string, typeof pastWorkouts> = {}
  for (const w of pastWorkouts) {
    if (!grouped[w.date]) grouped[w.date] = []
    grouped[w.date].push(w)
  }
  const groupedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a))

  const fmt = (min: number) => {
    const h = Math.floor(min / 60)
    const m = min % 60
    return h > 0 ? `${h}h ${m}m` : `${m}m`
  }

  return (
    <div className="min-h-screen bg-brand-bg dot-pattern">
      <header className="px-4 pt-6 pb-4 md:px-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-text font-mono">Gym</h1>
          <p className="text-brand-muted text-sm font-mono mt-0.5">Últimos 60 registros</p>
        </div>
        <GymNewButton variant="header" />
      </header>

      <div className="px-4 pb-8 md:px-8 md:max-w-5xl">
        <div className="md:flex md:gap-6 md:items-start">

          {/* Columna principal */}
          <div className="flex-1 min-w-0 space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <p className="text-red-700 text-sm font-mono">{error}</p>
              </div>
            )}

            {/* Resumen mobile */}
            {(workouts?.length ?? 0) > 0 && (
              <div className="md:hidden bg-white rounded-2xl border border-gray-100 px-4 py-3 flex items-center justify-between">
                <div className="flex gap-4">
                  <div>
                    <p className="text-[10px] text-brand-muted font-mono uppercase">Sesiones</p>
                    <p className="text-brand-dark font-bold font-mono text-lg leading-none">{workouts?.length}</p>
                  </div>
                  {totalMinutes > 0 && (
                    <div>
                      <p className="text-[10px] text-brand-muted font-mono uppercase">Tiempo total</p>
                      <p className="text-brand-dark font-bold font-mono text-lg leading-none">{fmt(totalMinutes)}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Calendario mobile */}
            <div className="md:hidden">
              <p className="text-[10px] font-mono text-brand-muted uppercase tracking-wide mb-2">Calendario</p>
              <GymCalendar calendarData={calendarData ?? {}} todayStr={todayStr} />
            </div>

            {!workouts || workouts.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-4xl mb-3">🏋️</p>
                <p className="text-brand-text font-bold font-mono">Sin entrenamientos</p>
                <p className="text-brand-muted text-sm font-mono mt-1">Registrá tu primera sesión</p>
                <GymNewButton variant="header" />
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {todayWorkouts.length > 0 && (
                  <div>
                    <p className="text-brand-muted text-xs font-mono px-1 mb-2 uppercase tracking-wide">Hoy</p>
                    <div className="flex flex-col gap-2.5">
                      {todayWorkouts.map(w => <WorkoutItem key={w.id} item={w} />)}
                    </div>
                  </div>
                )}
                {groupedDates.map(date => {
                  const label = new Date(date + 'T12:00:00').toLocaleDateString('es-AR', {
                    weekday: 'long', day: 'numeric', month: 'long',
                  })
                  return (
                    <div key={date}>
                      <p className="text-brand-muted text-xs font-mono px-1 mb-2 capitalize">{label}</p>
                      <div className="flex flex-col gap-2.5">
                        {grouped[date].map(w => <WorkoutItem key={w.id} item={w} />)}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Sidebar desktop */}
          <div className="hidden md:flex md:flex-col md:gap-4 md:w-72 md:flex-shrink-0">
            {/* Esta semana */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
              <p className="text-[10px] font-mono text-brand-muted uppercase tracking-wide">Esta semana</p>
              <div className="flex gap-4">
                <div>
                  <p className="text-3xl font-bold font-mono text-brand-dark leading-none">{weekWorkouts.length}</p>
                  <p className="text-[10px] font-mono text-brand-muted mt-0.5">sesiones</p>
                </div>
                {weekMinutes > 0 && (
                  <div>
                    <p className="text-3xl font-bold font-mono text-brand-dark leading-none">{fmt(weekMinutes)}</p>
                    <p className="text-[10px] font-mono text-brand-muted mt-0.5">entrenando</p>
                  </div>
                )}
              </div>
            </div>

            {/* Calendario */}
            <div>
              <p className="text-[10px] font-mono text-brand-muted uppercase tracking-wide mb-2">Calendario</p>
              <GymCalendar calendarData={calendarData ?? {}} todayStr={todayStr} />
            </div>

            {/* Tipos favoritos */}
            {topTypes.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-4">
                <p className="text-[10px] font-mono text-brand-muted uppercase tracking-wide mb-3">Más frecuentes</p>
                <div className="space-y-2">
                  {topTypes.map(([type, count]) => (
                    <div key={type} className="flex items-center gap-2">
                      <Dumbbell size={11} className="text-brand-muted flex-shrink-0" />
                      <span className="text-xs font-mono text-brand-text flex-1">{type}</span>
                      <span className="text-xs font-mono font-bold text-brand-dark">{count}x</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <GymNewButton variant="sidebar" />
          </div>
        </div>
      </div>

      <GymNewButton variant="fab" />
    </div>
  )
}
