'use client'

import { useState, useTransition } from 'react'
import { Plus, CalendarDays, X } from 'lucide-react'
import { createTask } from '@/app/_actions/projects'

export default function AddTaskForm({ projectId }: { projectId: string }) {
  const [isPending, startTransition] = useTransition()
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [showDate, setShowDate] = useState(false)
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setError('')

    startTransition(async () => {
      const result = await createTask({
        project_id: projectId,
        title,
        notes: '',
        due_date: dueDate || null,
      })
      if (result.error) {
        setError(result.error)
        return
      }
      setTitle('')
      setDueDate('')
      setShowDate(false)
    })
  }

  return (
    <div className="px-4 pb-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Nueva tarea..."
            className="flex-1 h-10 px-3 rounded-xl bg-brand-bg border border-brand-border text-brand-text placeholder-brand-border text-sm font-mono focus:outline-none focus:border-brand-dark transition"
          />
          <button
            type="button"
            onClick={() => setShowDate(v => !v)}
            className={`h-10 w-10 rounded-xl border transition flex items-center justify-center flex-shrink-0 ${
              showDate || dueDate
                ? 'bg-brand-dark border-brand-dark text-white'
                : 'border-brand-border text-brand-muted hover:border-brand-muted'
            }`}
          >
            <CalendarDays size={15} />
          </button>
          <button
            type="submit"
            disabled={isPending || !title.trim()}
            className="h-10 w-10 rounded-xl bg-brand-dark hover:opacity-90 disabled:opacity-40 text-white flex items-center justify-center transition flex-shrink-0"
          >
            <Plus size={16} />
          </button>
        </div>

        {showDate && (
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="flex-1 h-9 px-3 rounded-xl bg-brand-bg border border-brand-border text-brand-text text-sm font-mono focus:outline-none focus:border-brand-dark transition"
            />
            {dueDate && (
              <button
                type="button"
                onClick={() => setDueDate('')}
                className="text-brand-muted hover:text-brand-text transition"
              >
                <X size={14} />
              </button>
            )}
          </div>
        )}
      </form>
      {error && <p className="text-red-500 text-xs font-mono mt-1.5">{error}</p>}
    </div>
  )
}
