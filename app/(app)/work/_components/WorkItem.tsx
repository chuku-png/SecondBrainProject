'use client'

import { useOptimistic, useTransition } from 'react'
import { Trash2, Clock } from 'lucide-react'
import { toggleWorkItem, deleteWorkItem } from '@/app/_actions/work'

interface WorkItemProps {
  item: {
    id: string
    title: string
    status: 'pending' | 'done'
    notes: string | null
    hours_worked: number | null
  }
}

export default function WorkItem({ item }: WorkItemProps) {
  const [isPending, startTransition] = useTransition()
  const [optimisticStatus, addOptimistic] = useOptimistic(
    item.status,
    (_: string, v: 'pending' | 'done') => v
  )

  function handleToggle() {
    startTransition(async () => {
      addOptimistic(item.status === 'pending' ? 'done' : 'pending')
      await toggleWorkItem(item.id, item.status)
    })
  }

  function handleDelete() {
    if (!confirm(`¿Eliminar "${item.title}"?`)) return
    startTransition(async () => { await deleteWorkItem(item.id) })
  }

  const isDone = optimisticStatus === 'done'

  return (
    <div className={`bg-white rounded-2xl border border-gray-100 overflow-hidden flex transition-opacity ${isPending ? 'opacity-60' : ''}`}>
      {/* Acento izquierdo */}
      <div className={`w-1 flex-shrink-0 transition-colors ${isDone ? 'bg-green-400' : 'bg-brand-dark'}`} />

      <div className="flex-1 flex items-start gap-3 px-4 py-3.5">
        {/* Checkbox */}
        <button
          onClick={handleToggle}
          disabled={isPending}
          className="flex-shrink-0 mt-0.5"
        >
          <div className={`w-5 h-5 border-2 rounded-sm transition-colors flex items-center justify-center ${
            isDone ? 'bg-green-400 border-green-400' : 'border-brand-border hover:border-brand-muted'
          }`}>
            {isDone && (
              <svg viewBox="0 0 16 16" className="w-3 h-3 text-white" fill="none">
                <path d="M3 8l3.5 3.5L13 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
        </button>

        {/* Contenido */}
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-bold font-mono transition-colors ${isDone ? 'line-through text-gray-300' : 'text-brand-text'}`}>
            {item.title}
          </p>
          {item.notes && (
            <p className="text-brand-muted text-[11px] font-mono mt-0.5 truncate">{item.notes}</p>
          )}
          {item.hours_worked && (
            <div className="flex items-center gap-1 mt-1">
              <Clock size={10} className="text-brand-muted" />
              <span className="text-[10px] font-mono text-brand-muted">{item.hours_worked}h</span>
            </div>
          )}
        </div>

        {/* Eliminar */}
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="text-gray-300 hover:text-red-400 transition-colors p-1 flex-shrink-0 disabled:opacity-50"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}
