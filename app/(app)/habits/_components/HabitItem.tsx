'use client'

import { useState, useOptimistic, useTransition } from 'react'
import Link from 'next/link'
import { Flame, Pencil, Archive, CalendarDays, MessageSquare, Check } from 'lucide-react'
import { toggleHabitLog, archiveHabit, saveHabitNote } from '@/app/_actions/habits'
import GymHabitForm from './GymHabitForm'

interface Habit {
  id: string
  name: string
  color: string
  streak: number
  frequency: number
  weeklyCount: number
  logId: string | null
  completed: boolean
  note: string | null
  linked_module?: string | null
}

export default function HabitItem({
  habit,
  dateStr,
}: {
  habit: Habit
  dateStr: string
}) {
  const [isPending, startTransition] = useTransition()
  const [optimisticCompleted, addOptimistic] = useOptimistic(
    habit.completed,
    (_: boolean, v: boolean) => v
  )

  const [currentLogId, setCurrentLogId] = useState(habit.logId)
  const [noteText, setNoteText]         = useState(habit.note ?? '')
  const [showNote, setShowNote]         = useState(false)
  const [showGym, setShowGym]           = useState(false)
  const [noteSaved, setNoteSaved]       = useState(false)

  function handleToggle() {
    const wasCompleted = habit.completed
    startTransition(async () => {
      addOptimistic(!wasCompleted)
      const result = await toggleHabitLog(habit.id, currentLogId, wasCompleted, dateStr)
      if (result.success) {
        if (result.logId && !currentLogId) setCurrentLogId(result.logId)
        if (!wasCompleted && habit.linked_module === 'gym') {
          setShowGym(true)
        }
      }
    })
  }

  function handleArchive() {
    startTransition(async () => { await archiveHabit(habit.id) })
  }

  function handleSaveNote() {
    if (!currentLogId) return
    startTransition(async () => {
      await saveHabitNote(currentLogId, noteText)
      setNoteSaved(true)
      setTimeout(() => setNoteSaved(false), 2000)
    })
  }

  const weekDone  = habit.weeklyCount
  const weekTotal = habit.frequency
  const weekPct   = weekTotal > 0 ? Math.min(1, weekDone / weekTotal) : 0
  const weekMet   = weekDone >= weekTotal

  return (
    <div className={`bg-white rounded-2xl border border-gray-100 overflow-hidden transition-opacity ${isPending ? 'opacity-60' : ''}`}>
      <div className="flex">
        <div className="w-1 flex-shrink-0" style={{ backgroundColor: habit.color }} />

        <div className="flex-1 flex items-center gap-3 px-4 py-3">
          {/* Checkbox */}
          <button
            onClick={handleToggle}
            disabled={isPending}
            className="flex-shrink-0"
            aria-label={optimisticCompleted ? 'Marcar incompleto' : 'Marcar completo'}
          >
            <div className={`w-5 h-5 border-2 rounded-sm transition-colors flex items-center justify-center ${
              optimisticCompleted ? 'bg-brand-dark border-brand-dark' : 'border-brand-border hover:border-brand-muted'
            }`}>
              {optimisticCompleted && (
                <svg viewBox="0 0 16 16" className="w-3 h-3 text-white" fill="none">
                  <path d="M3 8l3.5 3.5L13 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
          </button>

          {/* Nombre + streak + progreso semanal */}
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-mono truncate transition-colors ${
              optimisticCompleted ? 'line-through text-gray-300' : 'text-brand-text font-bold'
            }`}>
              {habit.name}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              {habit.streak > 0 && (
                <div className="flex items-center gap-0.5">
                  <Flame size={10} className="text-orange-400" />
                  <span className="text-orange-400 text-[10px] font-mono">{habit.streak}d</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <div className="w-12 h-1 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${weekPct * 100}%`, backgroundColor: weekMet ? '#22c55e' : habit.color }} />
                </div>
                <span className={`text-[10px] font-mono font-bold ${weekMet ? 'text-green-500' : 'text-brand-muted'}`}>
                  {weekDone}/{weekTotal}
                </span>
              </div>
              {habit.note && !showNote && (
                <span className="text-[10px] font-mono text-brand-muted italic truncate max-w-[80px]">{habit.note}</span>
              )}
            </div>
          </div>

          {/* Acciones */}
          <div className="flex items-center gap-0.5 flex-shrink-0">
            {habit.completed && currentLogId && (
              <button
                onClick={() => setShowNote(v => !v)}
                className={`p-1.5 rounded-lg transition-colors ${showNote ? 'text-brand-dark' : 'text-gray-300 hover:text-brand-muted'}`}
                aria-label="Agregar nota"
              >
                <MessageSquare size={13} />
              </button>
            )}
            <Link href={`/habits/${habit.id}`}
              className="p-1.5 text-gray-300 hover:text-brand-muted transition-colors rounded-lg"
              aria-label="Ver calendario">
              <CalendarDays size={13} />
            </Link>
            <Link href={`/habits/${habit.id}/edit`}
              className="p-1.5 text-gray-300 hover:text-brand-muted transition-colors rounded-lg">
              <Pencil size={13} />
            </Link>
            <button onClick={handleArchive} disabled={isPending}
              className="p-1.5 text-gray-300 hover:text-orange-400 transition-colors rounded-lg disabled:opacity-50"
              aria-label="Archivar hábito">
              <Archive size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Nota inline */}
      {showNote && habit.completed && currentLogId && (
        <div className="px-4 pb-3 pt-0 border-t border-gray-50">
          <div className="flex gap-2 mt-2">
            <textarea
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              placeholder="Agrega una nota a este hábito..."
              rows={2}
              className="flex-1 px-3 py-2 rounded-xl bg-brand-bg border border-brand-border text-brand-text text-xs font-mono focus:outline-none focus:border-brand-dark transition resize-none"
            />
            <button
              onClick={handleSaveNote}
              disabled={isPending}
              className="flex-shrink-0 h-9 w-9 flex items-center justify-center rounded-xl bg-brand-dark hover:opacity-90 disabled:opacity-50 text-white transition mt-0.5"
              aria-label="Guardar nota"
            >
              {noteSaved ? <Check size={14} /> : <MessageSquare size={14} />}
            </button>
          </div>
        </div>
      )}

      {/* Gym form inline */}
      {showGym && (
        <div className="px-4 pb-3">
          <GymHabitForm date={dateStr} onClose={() => setShowGym(false)} />
        </div>
      )}
    </div>
  )
}
