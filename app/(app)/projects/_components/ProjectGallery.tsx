'use client'

import { useState, useTransition } from 'react'
import { Plus, FolderOpen } from 'lucide-react'
import Link from 'next/link'
import { getProjectWithTasks } from '@/app/_actions/projects'
import ProjectModal from './ProjectModal'
import type { Block } from './BlockEditor'

interface Project {
  id: string
  name: string
  description: string | null
  status: string
  color: string
  content: { blocks: Block[] } | null
  taskTotal: number
  taskDone: number
}

interface Task {
  id: string
  title: string
  status: 'pending' | 'done'
  notes: string | null
}

interface FullProject extends Project {
  tasks: Task[]
}

const STATUS_LABELS: Record<string, string> = {
  active: 'Activo',
  completed: 'Completado',
  paused: 'Pausado',
}

function GalleryCard({
  project,
  onClick,
  loading,
}: {
  project: Project
  onClick: () => void
  loading: boolean
}) {
  const progress = project.taskTotal > 0
    ? Math.round((project.taskDone / project.taskTotal) * 100)
    : 0

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`group w-full text-left bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ${loading ? 'opacity-60' : ''}`}
    >
      {/* Color cover */}
      <div className="h-[72px] relative flex-shrink-0" style={{ backgroundColor: project.color }}>
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle at 20% 80%, white 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-3">
        <div className="flex items-start gap-2 mb-1.5">
          <FolderOpen size={14} className="flex-shrink-0 mt-0.5" style={{ color: project.color }} />
          <p className="text-sm font-bold font-mono text-brand-text leading-tight line-clamp-2">
            {project.name}
          </p>
        </div>

        {project.description && (
          <p className="text-[11px] font-mono text-brand-muted line-clamp-2 mb-2 ml-5">
            {project.description}
          </p>
        )}

        <div className="ml-5">
          <span className="inline-block text-[9px] font-mono uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-gray-100 text-brand-muted mb-2">
            {STATUS_LABELS[project.status] ?? project.status}
          </span>

          {project.taskTotal > 0 && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] font-mono text-brand-muted">
                  {project.taskDone}/{project.taskTotal}
                </span>
                <span className="text-[9px] font-mono text-brand-muted">{progress}%</span>
              </div>
              <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${progress}%`, backgroundColor: project.color }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </button>
  )
}

function GallerySection({
  label,
  projects,
  loadingId,
  onCardClick,
  dim,
}: {
  label: string
  projects: Project[]
  loadingId: string | null
  onCardClick: (p: Project) => void
  dim?: boolean
}) {
  if (projects.length === 0) return null
  return (
    <div className={dim ? 'opacity-60' : ''}>
      <p className="text-brand-muted text-xs font-mono px-1 mb-3 uppercase tracking-wide">{label}</p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {projects.map(p => (
          <GalleryCard
            key={p.id}
            project={p}
            onClick={() => onCardClick(p)}
            loading={loadingId === p.id}
          />
        ))}
      </div>
    </div>
  )
}

export default function ProjectGallery({ projects }: { projects: Project[] }) {
  const [selectedProject, setSelectedProject] = useState<FullProject | null>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  const active    = projects.filter(p => p.status === 'active')
  const paused    = projects.filter(p => p.status === 'paused')
  const completed = projects.filter(p => p.status === 'completed')

  function handleCardClick(project: Project) {
    setLoadingId(project.id)
    startTransition(async () => {
      const { data } = await getProjectWithTasks(project.id)
      setLoadingId(null)
      if (!data) return
      const tasks = data.tasks as Task[]
      const fullProject: FullProject = {
        ...project,
        content: (data.project as any).content ?? null,
        tasks,
      }
      setSelectedProject(fullProject)
    })
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-4xl mb-3">📁</p>
        <p className="text-brand-text font-bold font-mono">Sin proyectos</p>
        <p className="text-brand-muted text-sm font-mono mt-1">Creá tu primer proyecto</p>
        <Link
          href="/projects/new"
          className="inline-flex mt-4 bg-brand-dark hover:opacity-90 text-white text-sm font-mono font-bold px-4 py-2.5 rounded-xl transition"
        >
          Crear proyecto
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-6">
        <GallerySection
          label="Activos"
          projects={active}
          loadingId={loadingId}
          onCardClick={handleCardClick}
        />
        <GallerySection
          label="Pausados"
          projects={paused}
          loadingId={loadingId}
          onCardClick={handleCardClick}
          dim
        />
        <GallerySection
          label="Completados"
          projects={completed}
          loadingId={loadingId}
          onCardClick={handleCardClick}
          dim
        />
      </div>

      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </>
  )
}
