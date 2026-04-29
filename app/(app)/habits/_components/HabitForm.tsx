'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createHabit, updateHabit } from '@/app/_actions/habits'

const COLORS = [
  '#6366f1', '#22c55e', '#f59e0b', '#ef4444',
  '#8b5cf6', '#06b6d4', '#ec4899', '#f97316',
  '#3D2010', '#84cc16',
]

interface HabitFormProps {
  mode: 'create' | 'edit'
  habitId?: string
  defaultValues?: {
    name: string
    type: 'daily' | 'weekly'
    color: string
    frequency: number
  }
  onSuccess?: () => void
}

export default function HabitForm({ mode, habitId, defaultValues, onSuccess }: HabitFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [name, setName]         = useState(defaultValues?.name ?? '')
  const [color, setColor]       = useState(defaultValues?.color ?? COLORS[0])
  const [frequency, setFrequency] = useState(defaultValues?.frequency ?? 7)
  const [error, setError]       = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const type = frequency === 7 ? 'daily' : 'weekly'
    startTransition(async () => {
      const result =
        mode === 'create'
          ? await createHabit({ name, type, color, frequency })
          : await updateHabit(habitId!, { name, type, color, frequency })
      if (result.error) { setError(result.error); return }
      router.refresh()
      if (onSuccess) onSuccess()
      else router.push('/habits')
    })
  }

  const freqLabel = frequency === 7
    ? 'Todos los días'
    : `${frequency}x por semana`

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Preview */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex">
        <div className="w-1 flex-shrink-0" style={{ backgroundColor: color }} />
        <div className="px-4 py-2.5">
          <p className="text-sm font-bold font-mono text-brand-text">{name || 'Nombre del hábito'}</p>
          <p className="text-[10px] font-mono text-brand-muted mt-0.5">{freqLabel}</p>
        </div>
      </div>

      {/* Nombre */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-brand-muted font-mono uppercase tracking-wide">Nombre</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Ej: Meditar 10 minutos"
          required
          className="h-11 px-4 rounded-xl bg-brand-bg border border-brand-border text-brand-text placeholder-brand-border text-sm font-mono focus:outline-none focus:border-brand-dark transition"
        />
      </div>

      {/* Frecuencia semanal */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-xs text-brand-muted font-mono uppercase tracking-wide">Frecuencia semanal</label>
          <span className="text-xs font-bold font-mono text-brand-dark">{freqLabel}</span>
        </div>
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5, 6, 7].map(n => (
            <button
              key={n}
              type="button"
              onClick={() => setFrequency(n)}
              className={`flex-1 h-10 rounded-xl text-sm font-bold font-mono transition-colors ${
                frequency === n
                  ? 'text-white'
                  : 'bg-brand-bg border border-brand-border text-brand-muted hover:border-brand-dark'
              }`}
              style={frequency === n ? { backgroundColor: color } : undefined}
            >
              {n === 7 ? '✓' : n}
            </button>
          ))}
        </div>
        <p className="text-[10px] font-mono text-brand-muted">
          {frequency === 7 ? 'El hábito se trackea todos los días' : `Meta: ${frequency} veces de 7 posibles esta semana`}
        </p>
      </div>

      {/* Color */}
      <div className="flex flex-col gap-2">
        <label className="text-xs text-brand-muted font-mono uppercase tracking-wide">Color</label>
        <div className="flex gap-2.5 flex-wrap">
          {COLORS.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`w-8 h-8 rounded-full transition-transform ${
                color === c ? 'ring-2 ring-offset-2 ring-offset-brand-bg ring-brand-dark scale-110' : 'hover:scale-105'
              }`}
              style={{ backgroundColor: c }}
              aria-label={`Color ${c}`}
            />
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <p className="text-red-700 text-sm font-mono">{error}</p>
        </div>
      )}

      <div className="sticky bottom-0 -mx-5 px-5 pt-3 pb-6 bg-white border-t border-gray-100 mt-2">
        <button
          type="submit"
          disabled={isPending || !name.trim()}
          className="w-full h-11 bg-brand-dark hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm font-mono transition"
        >
          {isPending
            ? mode === 'create' ? 'Creando...' : 'Guardando...'
            : mode === 'create' ? 'Crear hábito' : 'Guardar cambios'}
        </button>
      </div>
    </form>
  )
}
