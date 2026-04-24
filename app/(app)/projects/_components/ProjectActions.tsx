'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, CheckCircle, PauseCircle, PlayCircle, Archive } from 'lucide-react'
import { updateProjectStatus, deleteProject } from '@/app/_actions/projects'

interface ProjectActionsProps {
  id: string
  status: 'active' | 'completed' | 'paused' | 'archived'
}

export default function ProjectActions({ id, status }: ProjectActionsProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleDelete() {
    if (!confirm('¿Eliminar este proyecto y todas sus tareas?')) return
    startTransition(async () => {
      await deleteProject(id)
      router.push('/projects')
    })
  }

  function handleStatus(next: 'active' | 'completed' | 'paused' | 'archived') {
    startTransition(async () => {
      await updateProjectStatus(id, next)
      if (next === 'archived') router.push('/projects')
    })
  }

  return (
    <div className={`flex items-center gap-2 transition-opacity ${isPending ? 'opacity-60' : ''}`}>
      {status !== 'completed' && (
        <button
          onClick={() => handleStatus('completed')}
          disabled={isPending}
          className="flex items-center gap-1 text-[11px] font-mono text-green-600 hover:text-green-700 disabled:opacity-50 transition"
        >
          <CheckCircle size={13} />
          Completar
        </button>
      )}
      {status === 'active' && (
        <button
          onClick={() => handleStatus('paused')}
          disabled={isPending}
          className="flex items-center gap-1 text-[11px] font-mono text-brand-muted hover:text-brand-text disabled:opacity-50 transition"
        >
          <PauseCircle size={13} />
          Pausar
        </button>
      )}
      {status === 'paused' && (
        <button
          onClick={() => handleStatus('active')}
          disabled={isPending}
          className="flex items-center gap-1 text-[11px] font-mono text-brand-muted hover:text-brand-text disabled:opacity-50 transition"
        >
          <PlayCircle size={13} />
          Reanudar
        </button>
      )}
      <button
        onClick={() => handleStatus('archived')}
        disabled={isPending}
        className="flex items-center gap-1 text-[11px] font-mono text-brand-muted hover:text-orange-400 disabled:opacity-50 transition"
      >
        <Archive size={13} />
        Archivar
      </button>
      <button
        onClick={handleDelete}
        disabled={isPending}
        className="ml-auto text-gray-300 hover:text-red-400 transition-colors disabled:opacity-50 p-1"
      >
        <Trash2 size={14} />
      </button>
    </div>
  )
}
