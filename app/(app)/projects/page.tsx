import { getProjects } from '@/app/_actions/projects'
import { FolderOpen, CheckCircle2 } from 'lucide-react'
import ProjectGallery from './_components/ProjectGallery'
import { ProjectNewButton } from './_components/NewProjectModal'

export default async function ProjectsPage() {
  const { data: projects, error } = await getProjects()

  const active    = projects?.filter(p => p.status === 'active') ?? []
  const completed = projects?.filter(p => p.status === 'completed') ?? []

  return (
    <div className="min-h-screen bg-brand-bg dot-pattern">
      <header className="px-4 pt-6 pb-4 md:px-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-text font-mono">Proyectos</h1>
          <p className="text-brand-muted text-sm font-mono mt-0.5">
            {active.length} activo{active.length !== 1 ? 's' : ''}
          </p>
        </div>
        <ProjectNewButton variant="header" />
      </header>

      <div className="px-4 pb-8 md:px-8">
        <div className="md:flex md:gap-6 md:items-start">

          {/* Gallery */}
          <div className="flex-1 min-w-0">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
                <p className="text-red-700 text-sm font-mono">{error}</p>
              </div>
            )}
            <ProjectGallery projects={projects ?? []} />
          </div>

          {/* Sidebar desktop */}
          <div className="hidden md:flex md:flex-col md:gap-4 md:w-56 md:flex-shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
              <p className="text-[10px] font-mono text-brand-muted uppercase tracking-wide">Resumen</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FolderOpen size={12} className="text-brand-muted" />
                    <span className="text-xs font-mono text-brand-text">Activos</span>
                  </div>
                  <span className="text-sm font-bold font-mono text-brand-dark">{active.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={12} className="text-green-400" />
                    <span className="text-xs font-mono text-brand-text">Completados</span>
                  </div>
                  <span className="text-sm font-bold font-mono text-green-500">{completed.length}</span>
                </div>
              </div>
            </div>

            <ProjectNewButton variant="sidebar" />
          </div>
        </div>
      </div>

      <ProjectNewButton variant="fab" />
    </div>
  )
}
