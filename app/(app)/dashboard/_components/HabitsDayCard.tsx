'use client'

import { useOptimistic, useTransition } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { toggleHabitLog } from '@/app/_actions/habits'

interface Habit {
  id: string
  name: string
  color: string
  logId: string | null
  completed: boolean
}

interface Props {
  habits: Habit[]
  todayStr: string
  completedCount: number
  totalCount: number
}

export default function HabitsDayCard({
  habits,
  todayStr,
  completedCount,
  totalCount,
}: Props) {
  const pending = totalCount - completedCount

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {/* Acento izquierdo */}
      <div className="flex">
        <div className="w-1 bg-brand-dark flex-shrink-0" />
        <div className="flex-1 p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-brand-muted text-xs font-mono uppercase tracking-wide">
              Hábitos de hoy
            </span>
            <Link
              href="/habits"
              className="flex items-center gap-1 text-brand-muted text-xs font-mono hover:text-brand-text transition-colors"
            >
              Ver <ArrowRight size={11} />
            </Link>
          </div>

          {/* Contador */}
          <div className="mb-3">
            <p className="text-3xl font-bold text-brand-dark font-mono leading-none">
              {completedCount}
              <span className="text-gray-300"> / {totalCount}</span>
            </p>
            <p className="text-brand-muted text-xs font-mono mt-1">
              {totalCount === 0
                ? 'Configurá tus hábitos'
                : pending === 0
                ? '¡Todo completado! 🎉'
                : `${pending} pendiente${pending !== 1 ? 's' : ''}`}
            </p>
          </div>

          {/* Lista */}
          {habits.length > 0 && (
            <div className="flex flex-col gap-2 pt-3 border-t border-gray-100">
              {habits.slice(0, 5).map(habit => (
                <HabitRow key={habit.id} habit={habit} todayStr={todayStr} />
              ))}
              {habits.length > 5 && (
                <Link
                  href="/habits"
                  className="text-brand-muted text-xs font-mono text-center mt-1 hover:text-brand-text transition-colors"
                >
                  +{habits.length - 5} más →
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function HabitRow({ habit, todayStr }: { habit: Habit; todayStr: string }) {
  const [isPending, startTransition] = useTransition()
  const [optimisticCompleted, addOptimistic] = useOptimistic(
    habit.completed,
    (_: boolean, newValue: boolean) => newValue
  )

  function handleToggle() {
    startTransition(async () => {
      addOptimistic(!habit.completed)
      await toggleHabitLog(habit.id, habit.logId, habit.completed, todayStr)
    })
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className="flex items-center gap-3 text-left w-full group disabled:opacity-60 transition-opacity"
    >
      {/* Checkbox cuadrado */}
      <div
        className={`w-4 h-4 flex-shrink-0 border-2 rounded-sm transition-colors ${
          optimisticCompleted
            ? 'bg-brand-dark border-brand-dark'
            : 'border-brand-border bg-transparent group-hover:border-brand-muted'
        }`}
      >
        {optimisticCompleted && (
          <svg viewBox="0 0 16 16" className="w-full h-full text-white" fill="none">
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

      <span
        className={`text-xs font-mono flex-1 transition-colors ${
          optimisticCompleted ? 'line-through text-gray-300' : 'text-brand-text'
        }`}
      >
        {habit.name}
      </span>

      <div
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ backgroundColor: habit.color }}
      />
    </button>
  )
}
