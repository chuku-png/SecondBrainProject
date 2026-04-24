import { getWorkData } from '@/app/_actions/work'
import { Clock, CheckCircle2, Circle } from 'lucide-react'
import WorkItem from './_components/WorkItem'
import { WorkNewButton } from './_components/WorkItemModal'

export default async function WorkPage() {
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  const dateLabel = today.toLocaleDateString('es-AR', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  const { data: items, error } = await getWorkData(todayStr)

  const pending = items?.filter(i => i.status === 'pending') ?? []
  const done    = items?.filter(i => i.status === 'done') ?? []
  const totalHours = items?.reduce((s, i) => s + (Number(i.hours_worked) || 0), 0) ?? 0

  return (
    <div className="min-h-screen bg-brand-bg dot-pattern">
      <header className="px-4 pt-6 pb-4 md:px-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-text font-mono">Trabajo</h1>
          <p className="text-brand-muted text-sm font-mono capitalize mt-0.5">{dateLabel}</p>
        </div>
        <WorkNewButton variant="header" />
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
            {(items?.length ?? 0) > 0 && (
              <div className="md:hidden bg-white rounded-2xl border border-gray-100 px-4 py-3 flex items-center justify-between">
                <div className="flex gap-4">
                  <div>
                    <p className="text-[10px] text-brand-muted font-mono uppercase">Pendientes</p>
                    <p className="text-brand-dark font-bold font-mono text-lg leading-none">{pending.length}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-brand-muted font-mono uppercase">Completadas</p>
                    <p className="text-green-500 font-bold font-mono text-lg leading-none">{done.length}</p>
                  </div>
                </div>
                {totalHours > 0 && (
                  <div className="text-right">
                    <p className="text-[10px] text-brand-muted font-mono uppercase">Horas</p>
                    <p className="text-brand-dark font-bold font-mono text-lg leading-none">{totalHours}h</p>
                  </div>
                )}
              </div>
            )}

            {!items || items.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-4xl mb-3">💼</p>
                <p className="text-brand-text font-bold font-mono">Sin tareas por hoy</p>
                <p className="text-brand-muted text-sm font-mono mt-1">Agregá tu primera tarea del día</p>
                <WorkNewButton variant="header" />
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {pending.map(item => <WorkItem key={item.id} item={item} />)}
                {done.length > 0 && (
                  <>
                    {pending.length > 0 && (
                      <p className="text-brand-muted text-xs font-mono px-1 mt-2">Completadas</p>
                    )}
                    {done.map(item => (
                      <div key={item.id} className="opacity-60">
                        <WorkItem item={item} />
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Sidebar desktop */}
          <div className="hidden md:flex md:flex-col md:gap-4 md:w-72 md:flex-shrink-0">
            {/* Stats del día */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
              <p className="text-[10px] font-mono text-brand-muted uppercase tracking-wide">Hoy</p>
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <Circle size={10} className="text-brand-dark" />
                    <p className="text-[10px] font-mono text-brand-muted uppercase">Pendientes</p>
                  </div>
                  <p className="text-2xl font-bold font-mono text-brand-dark">{pending.length}</p>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <CheckCircle2 size={10} className="text-green-500" />
                    <p className="text-[10px] font-mono text-brand-muted uppercase">Listas</p>
                  </div>
                  <p className="text-2xl font-bold font-mono text-green-500">{done.length}</p>
                </div>
              </div>
              {totalHours > 0 && (
                <div className="flex items-center gap-2 pt-2 border-t border-gray-50">
                  <Clock size={13} className="text-brand-muted" />
                  <span className="text-sm font-mono text-brand-muted">{totalHours}h registradas hoy</span>
                </div>
              )}
              {(items?.length ?? 0) > 0 && (
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-400 rounded-full transition-all"
                    style={{ width: `${(items?.length ?? 0) > 0 ? (done.length / (items?.length ?? 1)) * 100 : 0}%` }}
                  />
                </div>
              )}
            </div>

            <WorkNewButton variant="sidebar" />
          </div>
        </div>
      </div>

      <WorkNewButton variant="fab" />
    </div>
  )
}
