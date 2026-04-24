import { getObjectives, getAllMilestones } from '@/app/_actions/objectives'
import { Target } from 'lucide-react'
import ObjectiveCard from './_components/ObjectiveCard'
import { ObjectiveNewButton } from './_components/NewObjectiveModal'

export default async function ObjectivesPage() {
  const [{ data: objectives, error }, { data: allMilestones }] = await Promise.all([
    getObjectives(),
    getAllMilestones(),
  ])

  const milestonesByObjective = (allMilestones ?? []).reduce<Record<string, { total: number; done: number }>>((acc, m) => {
    if (!acc[m.objective_id]) acc[m.objective_id] = { total: 0, done: 0 }
    acc[m.objective_id].total++
    if (m.status === 'done') acc[m.objective_id].done++
    return acc
  }, {})

  const getProgress = (o: { id: string; progress_manual: number }) => {
    const ms = milestonesByObjective[o.id]
    if (ms && ms.total > 0) return Math.round(ms.done / ms.total * 100)
    return o.progress_manual
  }

  const active    = objectives?.filter(o => o.status === 'active') ?? []
  const completed = objectives?.filter(o => o.status === 'completed') ?? []

  const avgProgress = active.length > 0
    ? Math.round(active.reduce((s, o) => s + getProgress(o), 0) / active.length)
    : 0

  return (
    <div className="min-h-screen bg-brand-bg dot-pattern">
      <header className="px-4 pt-6 pb-4 md:px-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-text font-mono">Objetivos</h1>
          <p className="text-brand-muted text-sm font-mono mt-0.5">{active.length} en progreso</p>
        </div>
        <ObjectiveNewButton variant="header" />
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

            {!objectives || objectives.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-4xl mb-3">🎯</p>
                <p className="text-brand-text font-bold font-mono">Sin objetivos</p>
                <p className="text-brand-muted text-sm font-mono mt-1">Definí hacia dónde vas</p>
                <ObjectiveNewButton variant="header" />
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                {active.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {active.map(o => (
                    <ObjectiveCard
                      key={o.id}
                      objective={o}
                      milestonesTotal={milestonesByObjective[o.id]?.total ?? 0}
                      milestonesDone={milestonesByObjective[o.id]?.done ?? 0}
                    />
                  ))}
                  </div>
                )}

                {completed.length > 0 && (
                  <div>
                    <p className="text-brand-muted text-xs font-mono px-1 mb-2 uppercase tracking-wide">Completados</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 opacity-60">
                      {completed.map(o => (
                        <ObjectiveCard
                          key={o.id}
                          objective={o}
                          milestonesTotal={milestonesByObjective[o.id]?.total ?? 0}
                          milestonesDone={milestonesByObjective[o.id]?.done ?? 0}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar desktop */}
          <div className="hidden md:flex md:flex-col md:gap-4 md:w-64 md:flex-shrink-0">
            {active.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
                <p className="text-[10px] font-mono text-brand-muted uppercase tracking-wide">Progreso promedio</p>
                <p className="text-4xl font-bold font-mono text-brand-dark leading-none">{avgProgress}%</p>
                <div className="h-1.5 bg-brand-border/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-dark rounded-full transition-all"
                    style={{ width: `${avgProgress}%` }}
                  />
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <Target size={12} className="text-brand-muted" />
                  <span className="text-xs font-mono text-brand-muted">{active.length} objetivo{active.length !== 1 ? 's' : ''} activo{active.length !== 1 ? 's' : ''}</span>
                </div>
              </div>
            )}

            <ObjectiveNewButton variant="sidebar" />
          </div>
        </div>
      </div>

      <ObjectiveNewButton variant="fab" />
    </div>
  )
}
