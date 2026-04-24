'use client'

import { useTransition } from 'react'
import { Trash2, Clock, Dumbbell } from 'lucide-react'
import { deleteWorkout } from '@/app/_actions/gym'

const TYPE_COLORS: Record<string, string> = {
  Fuerza: 'bg-orange-400',
  Cardio: 'bg-blue-400',
  Yoga: 'bg-purple-400',
  Natación: 'bg-cyan-400',
  Ciclismo: 'bg-green-400',
  Funcional: 'bg-yellow-400',
  Boxeo: 'bg-red-400',
  Pilates: 'bg-pink-400',
  Otro: 'bg-brand-border',
}

interface WorkoutItemProps {
  item: {
    id: string
    type: string
    duration_minutes: number | null
    notes: string | null
    date: string
  }
  showDate?: boolean
}

export default function WorkoutItem({ item, showDate }: WorkoutItemProps) {
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    if (!confirm(`¿Eliminar entrenamiento "${item.type}"?`)) return
    startTransition(async () => { await deleteWorkout(item.id) })
  }

  const accentColor = TYPE_COLORS[item.type] ?? TYPE_COLORS['Otro']

  return (
    <div className={`bg-white rounded-2xl border border-gray-100 overflow-hidden flex transition-opacity ${isPending ? 'opacity-60' : ''}`}>
      {/* Acento izquierdo */}
      <div className={`w-1 flex-shrink-0 ${accentColor}`} />

      <div className="flex-1 flex items-start gap-3 px-4 py-3.5">
        {/* Ícono */}
        <div className="flex-shrink-0 mt-0.5">
          <Dumbbell size={16} className="text-brand-muted" />
        </div>

        {/* Contenido */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold font-mono text-brand-text">{item.type}</p>
          {item.notes && (
            <p className="text-brand-muted text-[11px] font-mono mt-0.5 truncate">{item.notes}</p>
          )}
          <div className="flex items-center gap-3 mt-1">
            {item.duration_minutes && (
              <div className="flex items-center gap-1">
                <Clock size={10} className="text-brand-muted" />
                <span className="text-[10px] font-mono text-brand-muted">{item.duration_minutes} min</span>
              </div>
            )}
            {showDate && (
              <span className="text-[10px] font-mono text-brand-muted">
                {new Date(item.date + 'T12:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
              </span>
            )}
          </div>
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
