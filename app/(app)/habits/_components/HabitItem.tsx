'use client'

import { useOptimistic, useTransition } from 'react'
import Link from 'next/link'
import { Flame, Pencil, Archive } from 'lucide-react'
import { toggleHabitLog, archiveHabit } from '@/app/_actions/habits'

interface Habit {
  id: string
  name: string
  color: string
  streak: number
  logId: string | null
  completed: boolean
}

export default function HabitItem({
  habit,
  todayStr,
}: {
  habit: Habit
  todayStr: string
}) {
  const [isPending, startTransition] = useTransition()
  const [optimisticCompleted, addOptimistic] = useOptimistic(
    habit.completed,
    (_: boolean, v: boolean) => v
  )

  function handleToggle() {
    startTransition(async () => {
      addOptimistic(!habit.completed)
      await toggleHabitLog(habit.id, habit.logId, habit.completed, todayStr)
    })
  }

  function handleArchive() {
    startTransition(async () => { await archiveHabit(habit.id) })
  }

  return (
    <div
      className={`bg-white rounded-2xl border border-gray-100 overflow-hidden flex transition-opacity ${
        isPending ? 'opacity-60' : ''
      }`}
    >
      {/* Acento de color izquierdo */}
      <div className="w-1 flex-shrink-0" style={{ backgroundColor: habit.color }} />

      <div className="flex-1 flex items-center gap-3 px-4 py-3.5">
        {/* Checkbox */}
        <button
          onClick={handleToggle}
          disabled={isPending}
          className="flex-shrink-0"
          aria-label={optimisticCompleted ? 'Marcar incompleto' : 'Marcar completo'}
        >
          <div
            className={`w-5 h-5 border-2 rounded-sm transition-colors flex items-center justify-center ${
              optimisticCompleted
                ? 'bg-brand-dark border-brand-dark'
                : 'border-brand-border hover:border-brand-muted'
            }`}
          >
            {optimisticCompleted && (
              <svg viewBox="0 0 16 16" className="w-3 h-3 text-white" fill="none">
                <path
                  d="M3 8l3.5 3.5L13 4"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
        </button>

        {/* Nombre + streak */}
        <div className="flex-1 min-w-0">
          <p
            className={`text-sm font-mono truncate transition-colors ${
              optimisticCompleted
                ? 'line-through text-gray-300'
                : 'text-brand-text font-bold'
            }`}
          >
            {habit.name}
          </p>
          {habit.streak > 0 && (
            <div className="flex items-center gap-1 mt-0.5">
              <Flame size={11} className="text-orange-400" />
              <span className="text-orange-400 text-[10px] font-mono">
                {habit.streak} día{habit.streak !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <Link
            href={`/habits/${habit.id}/edit`}
            className="p-1.5 text-gray-300 hover:text-brand-muted transition-colors rounded-lg"
          >
            <Pencil size={14} />
          </Link>
          <button
            onClick={handleArchive}
            disabled={isPending}
            className="p-1.5 text-gray-300 hover:text-orange-400 transition-colors rounded-lg disabled:opacity-50"
            aria-label="Archivar hábito"
          >
            <Archive size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
