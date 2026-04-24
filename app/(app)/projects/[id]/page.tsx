import { getProjectWithTasks } from '@/app/_actions/projects'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { notFound } from 'next/navigation'
import TaskItem from '../_components/TaskItem'
import AddTaskForm from '../_components/AddTaskForm'
import ProjectActions from '../_components/ProjectActions'

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data, error } = await getProjectWithTasks(id)

  if (!data || error) notFound()

  const { project, tasks } = data
  const pending = tasks.filter(t => t.status === 'pending')
  const done = tasks.filter(t => t.status === 'done')
  const progress = tasks.length > 0 ? Math.round((done.length / tasks.length) * 100) : 0

  return (
    <div className="min-h-screen bg-brand-bg dot-pattern">
      <div className="max-w-lg mx-auto px-4 py-6 md:px-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/projects" className="text-brand-muted hover:text-brand-text transition-colors">
            <ChevronLeft size={24} />
          </Link>
          <h1 className="text-xl font-bold text-brand-text font-mono flex-1 truncate">{project.name}</h1>
        </div>

        {/* Info card */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-4">
          <div className="h-1 w-full" style={{ backgroundColor: project.color }} />
          <div className="px-4 py-3.5 space-y-3">
            {project.description && (
              <p className="text-brand-muted text-sm font-mono">{project.description}</p>
            )}

            {/* Progreso */}
            {tasks.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-mono text-brand-muted uppercase">Progreso</span>
                  <span className="text-[10px] font-mono text-brand-muted">{done.length}/{tasks.length}</span>
                </div>
                <div className="h-1.5 bg-brand-border/30 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${progress}%`, backgroundColor: project.color }}
                  />
                </div>
              </div>
            )}

            <ProjectActions id={project.id} status={project.status as 'active' | 'completed' | 'paused'} />
          </div>
        </div>

        {/* Tareas */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-4 pt-3.5 pb-2">
            <p className="text-xs font-mono text-brand-muted uppercase tracking-wide">
              Tareas · {pending.length} pendiente{pending.length !== 1 ? 's' : ''}
            </p>
          </div>

          {tasks.length === 0 ? (
            <p className="px-4 pb-4 text-sm font-mono text-brand-muted">Sin tareas todavía.</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {pending.map(t => <TaskItem key={t.id} task={t} />)}
              {done.map(t => (
                <div key={t.id} className="opacity-50">
                  <TaskItem task={t} />
                </div>
              ))}
            </div>
          )}

          <div className="border-t border-gray-50">
            <AddTaskForm projectId={id} />
          </div>
        </div>
      </div>
    </div>
  )
}
