'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

interface ProjectCardProps {
  project: {
    id: string
    name: string
    description: string | null
    status: string
    color: string
  }
}

const STATUS_LABELS: Record<string, string> = {
  active: 'Activo',
  completed: 'Completado',
  paused: 'Pausado',
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link href={`/projects/${project.id}`} className="block">
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex hover:shadow-sm transition-shadow">
        <div className="w-1 flex-shrink-0" style={{ backgroundColor: project.color }} />
        <div className="flex-1 flex items-center gap-3 px-4 py-3.5">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold font-mono text-brand-text truncate">{project.name}</p>
            {project.description && (
              <p className="text-brand-muted text-[11px] font-mono mt-0.5 truncate">{project.description}</p>
            )}
            <span className="inline-block mt-1 text-[10px] font-mono text-brand-muted uppercase tracking-wide">
              {STATUS_LABELS[project.status] ?? project.status}
            </span>
          </div>
          <ChevronRight size={14} className="text-brand-muted flex-shrink-0" />
        </div>
      </div>
    </Link>
  )
}
