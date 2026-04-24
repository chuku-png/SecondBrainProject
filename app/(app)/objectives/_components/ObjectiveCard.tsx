'use client'

import { useTransition } from 'react'
import Link from 'next/link'
import { Pencil, Trash2, Target } from 'lucide-react'
import { deleteObjective } from '@/app/_actions/objectives'

interface ObjectiveCardProps {
  objective: {
    id: string
    title: string
    description: string | null
    progress_manual: number
    target_date: string | null
    status: string
    color: string
  }
  milestonesTotal: number
  milestonesDone: number
}

export default function ObjectiveCard({ objective, milestonesTotal, milestonesDone }: ObjectiveCardProps) {
  const [isPending, startTransition] = useTransition()

  const progress = milestonesTotal > 0
    ? Math.round(milestonesDone / milestonesTotal * 100)
    : objective.progress_manual

  function handleDelete(e: React.MouseEvent) {
    e.preventDefault()
    if (!confirm(`¿Eliminar "${objective.title}"?`)) return
    startTransition(async () => { await deleteObjective(objective.id) })
  }

  const daysLeft = objective.target_date
    ? Math.ceil((new Date(objective.target_date + 'T12:00:00').getTime() - Date.now()) / 86400000)
    : null

  return (
    <Link
      href={`/objectives/${objective.id}`}
      className={`block bg-white rounded-2xl border border-gray-100 overflow-hidden transition-opacity hover:shadow-sm ${isPending ? 'opacity-60' : ''}`}
    >
      {/* Barra de color superior */}
      <div className="h-1.5 w-full" style={{ backgroundColor: objective.color }} />

      <div className="px-4 py-3.5 space-y-3">
        {/* Título + acciones */}
        <div className="flex items-start gap-2">
          <Target size={14} className="flex-shrink-0 mt-0.5" style={{ color: objective.color }} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold font-mono text-brand-text leading-snug">{objective.title}</p>
            {objective.description && (
              <p className="text-brand-muted text-[11px] font-mono mt-0.5 line-clamp-1">{objective.description}</p>
            )}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Link
              href={`/objectives/${objective.id}/edit`}
              onClick={e => e.stopPropagation()}
              className="text-gray-300 hover:text-brand-muted transition-colors p-1"
            >
              <Pencil size={12} />
            </Link>
            <button
              onClick={handleDelete}
              disabled={isPending}
              className="text-gray-300 hover:text-red-400 transition-colors p-1 disabled:opacity-50"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>

        {/* Barra de progreso */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[10px] font-mono text-brand-muted uppercase tracking-wide">
              {milestonesTotal > 0 ? `${milestonesDone}/${milestonesTotal} hitos` : 'Progreso'}
            </span>
            <span className="text-xs font-mono font-bold" style={{ color: objective.color }}>{progress}%</span>
          </div>
          <div className="h-2 bg-brand-border/20 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, backgroundColor: objective.color }}
            />
          </div>
        </div>

        {/* Fecha límite */}
        {daysLeft !== null && (
          <p className={`text-[10px] font-mono ${
            daysLeft < 0 ? 'text-gray-400 line-through' :
            daysLeft <= 7 ? 'text-red-400' :
            daysLeft <= 30 ? 'text-orange-400' :
            'text-brand-muted'
          }`}>
            {daysLeft < 0
              ? `Venció hace ${Math.abs(daysLeft)} día${Math.abs(daysLeft) !== 1 ? 's' : ''}`
              : daysLeft === 0
              ? 'Vence hoy'
              : `${daysLeft} día${daysLeft !== 1 ? 's' : ''} restante${daysLeft !== 1 ? 's' : ''}`}
          </p>
        )}
      </div>
    </Link>
  )
}
