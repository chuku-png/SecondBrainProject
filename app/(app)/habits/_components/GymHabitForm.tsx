'use client'

import { useState, useTransition } from 'react'
import { X, Dumbbell } from 'lucide-react'
import { createWorkout } from '@/app/_actions/gym'

const WORKOUT_TYPES = ['Fuerza', 'Cardio', 'Yoga', 'Natación', 'Ciclismo', 'Funcional', 'Boxeo', 'Pilates', 'Otro']

export default function GymHabitForm({
  date,
  onClose,
}: {
  date: string
  onClose: () => void
}) {
  const [isPending, startTransition] = useTransition()
  const [type, setType]       = useState('')
  const [duration, setDuration] = useState('')
  const [notes, setNotes]     = useState('')
  const [error, setError]     = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    startTransition(async () => {
      const result = await createWorkout({
        type,
        duration_minutes: duration ? parseInt(duration, 10) : null,
        notes,
        date,
      })
      if (result.error) { setError(result.error); return }
      onClose()
    })
  }

  return (
    <div className="mt-2 bg-brand-bg border border-brand-border rounded-xl p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Dumbbell size={13} className="text-brand-muted" />
          <span className="text-[11px] font-bold font-mono text-brand-muted uppercase tracking-wide">Registrar entrenamiento</span>
        </div>
        <button onClick={onClose} className="text-brand-muted hover:text-brand-text transition-colors p-0.5">
          <X size={14} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        {/* Tipo */}
        <div className="flex flex-wrap gap-1.5">
          {WORKOUT_TYPES.map(t => (
            <button key={t} type="button" onClick={() => setType(t)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition ${
                type === t ? 'bg-brand-dark text-white' : 'bg-white border border-brand-border text-brand-muted hover:border-brand-dark'
              }`}>
              {t}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="number"
            value={duration}
            onChange={e => setDuration(e.target.value)}
            placeholder="Duración (min)"
            min="1"
            step="5"
            className="flex-1 h-9 px-3 rounded-xl bg-white border border-brand-border text-brand-text text-xs font-mono focus:outline-none focus:border-brand-dark transition"
          />
        </div>

        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Notas, PR, series... (opcional)"
          rows={2}
          className="px-3 py-2 rounded-xl bg-white border border-brand-border text-brand-text text-xs font-mono focus:outline-none focus:border-brand-dark transition resize-none"
        />

        {error && <p className="text-red-600 text-[11px] font-mono">{error}</p>}

        <div className="flex gap-2">
          <button type="button" onClick={onClose}
            className="flex-1 h-9 rounded-xl border border-brand-border text-brand-muted text-xs font-mono font-bold transition hover:border-brand-dark">
            Omitir
          </button>
          <button type="submit" disabled={isPending || !type}
            className="flex-1 h-9 bg-brand-dark hover:opacity-90 disabled:opacity-50 text-white text-xs font-mono font-bold rounded-xl transition">
            {isPending ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  )
}
