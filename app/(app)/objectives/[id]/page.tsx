import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Target } from 'lucide-react'
import { getObjective, getMilestones, getLinks } from '@/app/_actions/objectives'
import { getHabitsData } from '@/app/_actions/habits'
import { getProjects } from '@/app/_actions/projects'
import ObjectiveDetail from '../_components/ObjectiveDetail'

function getDaysLeft(targetDate: string | null) {
  if (!targetDate) return null
  return Math.ceil((new Date(targetDate + 'T12:00:00').getTime() - Date.now()) / 86400000)
}

export default async function ObjectiveDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const [
    { data: objective, error },
    { data: milestones },
    { data: links },
    { data: habitsData },
    { data: projectsData },
  ] = await Promise.all([
    getObjective(id),
    getMilestones(id),
    getLinks(id),
    getHabitsData(),
    getProjects(),
  ])

  if (!objective || error) notFound()

  const daysLeft = getDaysLeft(objective.target_date)
  const habits   = (habitsData ?? []).map(h => ({ id: h.id, name: h.name, color: h.color }))
  const projects = (projectsData ?? [])
    .filter(p => p.status === 'active')
    .map(p => ({ id: p.id, name: p.name, color: p.color }))

  const ms = milestones ?? []
  const progress = ms.length > 0
    ? Math.round(ms.filter(m => m.status === 'done').length / ms.length * 100)
    : objective.progress_manual

  return (
    <div className="min-h-screen bg-brand-bg dot-pattern">
      {/* Cover */}
      <div className="h-24 relative" style={{ backgroundColor: objective.color }}>
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, white 1px, transparent 1px)', backgroundSize: '20px 20px' }}
        />
        <Link
          href="/objectives"
          className="absolute top-4 left-4 w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center text-white transition"
        >
          <ChevronLeft size={16} />
        </Link>
      </div>

      {/* Header */}
      <div className="px-4 pt-5 pb-4 md:px-8 border-b border-gray-100 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-start gap-3">
            <Target size={22} className="flex-shrink-0 mt-0.5" style={{ color: objective.color }} />
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-brand-text font-mono leading-tight">{objective.title}</h1>
              {objective.description && (
                <p className="text-brand-muted text-sm font-mono mt-1">{objective.description}</p>
              )}
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                {daysLeft !== null && (
                  <span className={`text-xs font-mono ${
                    daysLeft < 0 ? 'text-gray-400 line-through' :
                    daysLeft <= 7 ? 'text-red-400' :
                    daysLeft <= 30 ? 'text-orange-400' :
                    'text-green-500'
                  }`}>
                    {daysLeft < 0
                      ? `Venció hace ${Math.abs(daysLeft)} día${Math.abs(daysLeft) !== 1 ? 's' : ''}`
                      : daysLeft === 0 ? 'Vence hoy'
                      : `${daysLeft} día${daysLeft !== 1 ? 's' : ''} restante${daysLeft !== 1 ? 's' : ''}`}
                  </span>
                )}
                <span className={`text-[10px] font-mono uppercase tracking-wide px-2 py-0.5 rounded-full ${
                  objective.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-brand-muted'
                }`}>
                  {objective.status === 'completed' ? 'Completado' : 'Activo'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 md:px-8 max-w-3xl mx-auto pb-16">
        <ObjectiveDetail
          objective={{ id: objective.id, title: objective.title, color: objective.color, progress_manual: objective.progress_manual }}
          initialMilestones={ms.map(m => ({
            id: m.id, objective_id: m.objective_id, title: m.title,
            period_start: m.period_start, period_end: m.period_end,
            target_value: m.target_value, current_value: m.current_value,
            source_type: m.source_type, metric_formula: m.metric_formula, status: m.status,
          }))}
          initialLinks={(links ?? []).map(l => ({
            id: l.id, entity_type: l.entity_type, entity_id: l.entity_id,
            entity_label: l.entity_label, entity_filter: l.entity_filter,
          }))}
          habits={habits}
          projects={projects}
        />
      </div>
    </div>
  )
}
