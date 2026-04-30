'use client'

import { useState, useTransition } from 'react'
import { MessageSquare, Check, Dumbbell } from 'lucide-react'
import { toggleHabitLog, saveHabitNote } from '@/app/_actions/habits'
import GymHabitForm from './GymHabitForm'

interface DayLog {
  id: string | null
  date: string
  completed: boolean
  note: string | null
}

const DAY_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

export default function WeekDayStrip({
  habitId,
  habitColor,
  linkedModule,
  weekDays,
  initialLogs,
  todayStr,
}: {
  habitId: string
  habitColor: string
  linkedModule?: string | null
  weekDays: string[]        // 7 dates Mon-Sun
  initialLogs: DayLog[]
  todayStr: string
}) {
  const [logs, setLogs]   = useState<DayLog[]>(() => {
    return weekDays.map(date => {
      const found = initialLogs.find(l => l.date === date)
      return found ?? { id: null, date, completed: false, note: null }
    })
  })

  const [activeNote, setActiveNote] = useState<string | null>(null)
  const [noteTexts, setNoteTexts]   = useState<Record<string, string>>(() =>
    Object.fromEntries(initialLogs.map(l => [l.date, l.note ?? '']))
  )
  const [gymDay, setGymDay]         = useState<string | null>(null)
  const [noteSaved, setNoteSaved]   = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleToggle(date: string) {
    const log = logs.find(l => l.date === date)
    if (!log) return
    startTransition(async () => {
      setLogs(prev => prev.map(l =>
        l.date === date ? { ...l, completed: !l.completed } : l
      ))
      const result = await toggleHabitLog(habitId, log.id, log.completed, date)
      if (result.success) {
        const newLogId = result.logId ?? log.id
        setLogs(prev => prev.map(l =>
          l.date === date ? { ...l, id: newLogId, completed: !log.completed } : l
        ))
        if (!log.completed && linkedModule === 'gym') {
          setGymDay(date)
        }
      } else {
        setLogs(prev => prev.map(l =>
          l.date === date ? { ...l, completed: log.completed } : l
        ))
      }
    })
  }

  function handleSaveNote(date: string) {
    const log = logs.find(l => l.date === date)
    if (!log?.id) return
    startTransition(async () => {
      await saveHabitNote(log.id!, noteTexts[date] ?? '')
      setNoteSaved(date)
      setTimeout(() => setNoteSaved(null), 2000)
    })
  }

  return (
    <div>
      <p className="text-[10px] font-mono text-brand-muted uppercase tracking-wide mb-2">Esta semana</p>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-7">
          {weekDays.map((date, i) => {
            const log       = logs.find(l => l.date === date)!
            const isFuture  = date > todayStr
            const isToday   = date === todayStr
            const dayLabel  = DAY_LABELS[i]
            const hasNote   = !!log.note || !!(noteTexts[date])

            return (
              <div key={date} className={`flex flex-col items-center py-3 gap-1.5 ${i < 6 ? 'border-r border-gray-50' : ''}`}>
                <span className={`text-[10px] font-mono font-bold uppercase ${isToday ? 'text-brand-dark' : 'text-brand-muted'}`}>
                  {dayLabel}
                </span>
                <button
                  onClick={() => !isFuture && handleToggle(date)}
                  disabled={isFuture || isPending}
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                    isFuture
                      ? 'border-gray-100 bg-gray-50 cursor-not-allowed'
                      : log.completed
                        ? 'border-transparent'
                        : isToday
                          ? 'border-brand-border hover:border-brand-dark'
                          : 'border-gray-100 hover:border-brand-border'
                  }`}
                  style={log.completed ? { backgroundColor: habitColor } : undefined}
                  aria-label={log.completed ? 'Marcar incompleto' : 'Marcar completo'}
                >
                  {log.completed && (
                    <svg viewBox="0 0 16 16" className="w-3 h-3 text-white" fill="none">
                      <path d="M3 8l3.5 3.5L13 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
                {/* Note button */}
                {log.completed && log.id && !isFuture && (
                  <button
                    onClick={() => setActiveNote(activeNote === date ? null : date)}
                    className={`transition-colors ${hasNote ? 'text-brand-dark' : 'text-gray-200 hover:text-brand-muted'}`}
                    aria-label="Nota"
                  >
                    <MessageSquare size={10} />
                  </button>
                )}
                {/* Gym button */}
                {log.completed && !isFuture && linkedModule === 'gym' && (
                  <button
                    onClick={() => setGymDay(gymDay === date ? null : date)}
                    className="text-gray-200 hover:text-brand-muted transition-colors"
                    aria-label="Registrar gym"
                  >
                    <Dumbbell size={10} />
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {/* Note expand area */}
        {activeNote && (
          <div className="border-t border-gray-50 px-4 py-3">
            <div className="flex gap-2">
              <textarea
                value={noteTexts[activeNote] ?? ''}
                onChange={e => setNoteTexts(prev => ({ ...prev, [activeNote]: e.target.value }))}
                placeholder="Agrega una nota para este día..."
                rows={2}
                className="flex-1 px-3 py-2 rounded-xl bg-brand-bg border border-brand-border text-brand-text text-xs font-mono focus:outline-none focus:border-brand-dark transition resize-none"
              />
              <button
                onClick={() => handleSaveNote(activeNote)}
                disabled={isPending}
                className="flex-shrink-0 h-9 w-9 flex items-center justify-center rounded-xl bg-brand-dark hover:opacity-90 disabled:opacity-50 text-white transition mt-0.5"
              >
                {noteSaved === activeNote ? <Check size={14} /> : <MessageSquare size={14} />}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Gym form */}
      {gymDay && (
        <div className="mt-2">
          <GymHabitForm date={gymDay} onClose={() => setGymDay(null)} />
        </div>
      )}
    </div>
  )
}
