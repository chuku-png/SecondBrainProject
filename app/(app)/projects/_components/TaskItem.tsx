'use client'

import { useOptimistic, useTransition } from 'react'
import { Trash2, CalendarDays } from 'lucide-react'
import { toggleTask, deleteTask } from '@/app/_actions/projects'
import { localDateStr } from '@/lib/timezone'

interface TaskItemProps {
  task: {
    id: string
    title: string
    status: 'pending' | 'done'
    notes: string | null
    due_date?: string | null
  }
}

function formatDueDate(dateStr: string) {
  const today = localDateStr()
  const tomorrow = localDateStr(new Date(Date.now() + 86400000))
  if (dateStr === today) return { label: 'Hoy', overdue: false, today: true }
  if (dateStr === tomorrow) return { label: 'Mañana', overdue: false, today: false }
  const d = new Date(dateStr + 'T12:00:00')
  const overdue = dateStr < today
  return {
    label: d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' }),
    overdue,
    today: false,
  }
}

export default function TaskItem({ task }: TaskItemProps) {
  const [isPending, startTransition] = useTransition()
  const [optimisticStatus, addOptimistic] = useOptimistic(
    task.status,
    (_: string, v: 'pending' | 'done') => v
  )

  function handleToggle() {
    startTransition(async () => {
      addOptimistic(task.status === 'pending' ? 'done' : 'pending')
      await toggleTask(task.id, task.status)
    })
  }

  function handleDelete() {
    if (!confirm(`¿Eliminar "${task.title}"?`)) return
    startTransition(async () => { await deleteTask(task.id) })
  }

  const isDone = optimisticStatus === 'done'
  const dueDateInfo = task.due_date && !isDone ? formatDueDate(task.due_date) : null

  return (
    <div className={`flex items-start gap-3 px-4 py-3 transition-opacity ${isPending ? 'opacity-60' : ''}`}>
      <button onClick={handleToggle} disabled={isPending} className="flex-shrink-0 mt-0.5">
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

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-mono transition-colors ${isDone ? 'line-through text-gray-300' : 'text-brand-text'}`}>
          {task.title}
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          {task.notes && (
            <p className="text-brand-muted text-[11px] font-mono truncate">{task.notes}</p>
          )}
          {dueDateInfo && (
            <span className={`inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
              dueDateInfo.today
                ? 'bg-orange-100 text-orange-600'
                : dueDateInfo.overdue
                ? 'bg-red-100 text-red-500'
                : 'bg-gray-100 text-brand-muted'
            }`}>
              <CalendarDays size={9} />
              {dueDateInfo.label}
            </span>
          )}
        </div>
      </div>

      <button
        onClick={handleDelete}
        disabled={isPending}
        className="text-gray-300 hover:text-red-400 transition-colors p-1 flex-shrink-0 disabled:opacity-50"
      >
        <Trash2 size={13} />
      </button>
    </div>
  )
}
