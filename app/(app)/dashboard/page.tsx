import { createClient } from '@/lib/supabase/server'
import { getAuthUser } from '@/app/_actions/auth'
import { getTodayTodos } from '@/app/_actions/todos'
import { getDashboardAgendaTasks } from '@/app/_actions/projects'
import { localDateStr, localMondayStr } from '@/lib/timezone'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowUpRight, DollarSign, Dumbbell, FolderOpen, Briefcase, Heart, Crosshair } from 'lucide-react'
import HabitsDayCard from './_components/HabitsDayCard'
import DashboardRadar from './_components/DashboardRadar'
import TodoDay, { type AgendaItem } from './_components/TodoDay'
import DashboardSpeedDial from './_components/DashboardSpeedDial'

export default async function DashboardPage() {
  const user = await getAuthUser()
  if (!user) redirect('/login')

  const supabase = await createClient()

  const todayStr     = localDateStr()
  const mondayStr    = localMondayStr()
  const today        = new Date(todayStr + 'T12:00:00')
  const startOfMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`

  const [
    habitsResult,
    habitLogsResult,
    transactionsResult,
    workoutsResult,
    projectsResult,
    workItemsResult,
    objectivesResult,
    todosResult,
    agendaWorkResult,
    agendaProjectTasksResult,
    agendaRoResult,
    roItemsResult,
  ] = await Promise.all([
    supabase
      .from('habits')
      .select('id, name, color')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: true }),
    supabase
      .from('habit_logs')
      .select('id, habit_id, completed')
      .eq('user_id', user.id)
      .eq('date', todayStr),
    supabase
      .from('transactions')
      .select('type, amount')
      .eq('user_id', user.id)
      .gte('date', startOfMonth),
    supabase
      .from('workouts')
      .select('id')
      .eq('user_id', user.id)
      .gte('date', mondayStr),
    supabase
      .from('projects')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'active'),
    supabase
      .from('work_items')
      .select('id, status')
      .eq('user_id', user.id)
      .eq('date', todayStr),
    supabase
      .from('objectives')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'active'),
    getTodayTodos(),
    // Agenda: work items pending today
    supabase
      .from('work_items')
      .select('id, title')
      .eq('user_id', user.id)
      .eq('date', todayStr)
      .eq('status', 'pending'),
    // Agenda: project tasks due today (via server action — scoped to user)
    getDashboardAgendaTasks(todayStr),
    // Agenda: ro dates for today
    supabase
      .from('ro_dates')
      .select('id, title, date, recurring')
      .eq('user_id', user.id),
    // Ro items for radar score
    supabase
      .from('ro_items')
      .select('id, done')
      .eq('user_id', user.id),
  ])

  // Hábitos
  const habits = habitsResult.data ?? []
  const todayLogs = habitLogsResult.data ?? []
  const logsMap = new Map(todayLogs.map(l => [l.habit_id, l]))
  const habitsWithStatus = habits.map(h => ({
    ...h,
    logId: logsMap.get(h.id)?.id ?? null,
    completed: logsMap.get(h.id)?.completed ?? false,
  }))
  const completedCount = habitsWithStatus.filter(h => h.completed).length

  // Finanzas
  const txs = transactionsResult.data ?? []
  const income = txs.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
  const expense = txs.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)
  const balance = income - expense

  // Agenda del día
  const todayMonth = (today.getMonth() + 1).toString().padStart(2, '0')
  const todayDay = today.getDate().toString().padStart(2, '0')
  const roDatesToday = (agendaRoResult.data ?? []).filter(r => {
    if (r.date === todayStr) return true
    if (r.recurring) {
      const parts = r.date.split('-')
      return parts[1] === todayMonth && parts[2] === todayDay
    }
    return false
  })

  const agendaItems: AgendaItem[] = [
    ...(agendaWorkResult.data ?? []).map(w => ({
      id: w.id,
      title: w.title,
      source: 'work' as const,
      sourceLabel: 'Trabajo',
      href: '/work',
    })),
    ...(agendaProjectTasksResult.data ?? []).map((t) => {
      const proj = Array.isArray(t.projects) ? t.projects[0] : t.projects
      return {
        id: t.id,
        title: t.title,
        source: 'project' as const,
        sourceLabel: proj?.name ?? 'Proyecto',
        sourceColor: proj?.color,
        href: '/projects',
      }
    }),
    ...roDatesToday.map(r => ({
      id: r.id,
      title: r.title,
      source: 'ro' as const,
      sourceLabel: 'Ro',
      href: '/ro',
    })),
  ]

  // Stats
  const gymSessions    = workoutsResult.data?.length ?? 0
  const activeProjects = projectsResult.data?.length ?? 0
  const workItems      = workItemsResult.data ?? []
  const workPending    = workItems.filter(w => w.status === 'pending').length
  const activeObjectives = objectivesResult.data?.length ?? 0

  // Ro score real — % de ro_items completados
  const roItems = roItemsResult.data ?? []
  const roDone  = roItems.filter(r => r.done).length
  const roScore = roItems.length > 0 ? Math.round((roDone / roItems.length) * 100) : 0

  // Empty state: usuario sin datos aún
  const isNewUser = habits.length === 0 && gymSessions === 0 && txs.length === 0
    && activeProjects === 0 && activeObjectives === 0

  // Radar data
  const totalHabits = habits.length
  const radarData = [
    { subject: 'Hábitos',   score: totalHabits > 0 ? Math.round((completedCount / totalHabits) * 100) : 0 },
    { subject: 'Finanzas',  score: balance > 0 ? Math.min(100, Math.round((balance / 1000) * 10)) : 0 },
    { subject: 'Ro',        score: roScore },
    { subject: 'Gym',       score: Math.min(100, Math.round((gymSessions / 4) * 100)) },
    { subject: 'Objetivos', score: activeObjectives > 0 ? 60 : 0 },
    { subject: 'Trabajo',   score: workPending === 0 && workItems.length > 0 ? 100 : workItems.length > 0 ? 40 : 0 },
  ]

  const modules = [
    {
      href: '/finance',
      icon: DollarSign,
      label: 'Finanzas',
      subtitle: 'Balance y gastos',
    },
    {
      href: '/gym',
      icon: Dumbbell,
      label: 'Entrenamientos',
      subtitle: 'Sesiones y PRs',
    },
    {
      href: '/projects',
      icon: FolderOpen,
      label: 'Proyectos',
      subtitle: 'Kanban y deadlines',
    },
    {
      href: '/work',
      icon: Briefcase,
      label: 'Trabajo',
      subtitle: 'Tareas y reuniones',
    },
    {
      href: '/ro',
      icon: Heart,
      label: 'Ro',
      subtitle: 'Fechas y recuerdos',
    },
    {
      href: '/objectives',
      icon: Crosshair,
      label: 'Objetivos',
      subtitle: 'Metas y avance',
    },
  ]

  const dateLabel = today.toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <div className="min-h-screen bg-brand-bg dot-pattern">
      {/* Header */}
      <header className="px-4 pt-6 pb-4 md:px-8 flex items-center gap-3">
        <span className="text-2xl">🧠</span>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-brand-text font-mono leading-none">
            Second Brain
          </h1>
          <p className="text-brand-muted text-sm font-mono capitalize mt-0.5">
            {dateLabel}
          </p>
        </div>
      </header>

      {/* Empty state onboarding */}
      {isNewUser && (
        <div className="mx-4 md:mx-8 mb-2 bg-white border border-brand-border/30 rounded-2xl p-5 flex flex-col md:flex-row gap-4 md:items-center">
          <div className="text-3xl">👋</div>
          <div className="flex-1">
            <p className="text-brand-text font-bold font-mono text-sm">¡Bienvenido a tu Second Brain!</p>
            <p className="text-brand-muted text-xs font-mono mt-1">Empezá agregando hábitos, registrando un gasto o creando tu primer proyecto.</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {[
              { href: '/habits', label: '✅ Hábitos' },
              { href: '/finance', label: '💸 Finanzas' },
              { href: '/projects', label: '📁 Proyectos' },
            ].map(({ href, label }) => (
              <Link key={href} href={href}
                className="px-3 py-2 bg-brand-dark text-white text-xs font-mono font-bold rounded-xl hover:opacity-90 transition whitespace-nowrap">
                {label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Layout: contenido + panel derecho */}
      <div className="px-4 pb-8 md:px-8 flex gap-6 items-start md:max-w-6xl">
        {/* Columna principal */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Card hábitos */}
          <HabitsDayCard
            habits={habitsWithStatus}
            todayStr={todayStr}
            completedCount={completedCount}
            totalCount={habits.length}
          />

          {/* Grid de módulos 3 columnas */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {modules.map(({ href, icon: Icon, label, subtitle }) => (
              <Link
                key={href}
                href={href}
                className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col gap-4 hover:bg-gray-50 transition-colors active:scale-[0.98]"
              >
                <div className="flex items-start justify-between">
                  <Icon size={18} className="text-brand-muted" />
                  <ArrowUpRight size={14} className="text-gray-300" />
                </div>
                <div>
                  <p className="text-brand-text font-bold text-sm font-mono">{label}</p>
                  <p className="text-brand-muted text-xs font-mono mt-0.5">{subtitle}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* Radar Equilibrio de vida */}
          <DashboardRadar data={radarData} />
        </div>

        {/* Panel derecho — To-Do del día (solo desktop) */}
        <div className="hidden md:block w-64 flex-shrink-0">
          <TodoDay todos={todosResult} agendaItems={agendaItems} />
        </div>
      </div>

      <DashboardSpeedDial />
    </div>
  )
}
