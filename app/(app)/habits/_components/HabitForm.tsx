'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createHabit, updateHabit } from '@/app/_actions/habits'

const COLORS = [
  '#6366f1',
  '#22c55e',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#06b6d4',
  '#ec4899',
  '#f97316',
  '#3D2010',
  '#84cc16',
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
  const [name, setName] = useState(defaultValues?.name ?? '')
  const [type, setType] = useState<'daily' | 'weekly'>(defaultValues?.type ?? 'daily')
  const [color, setColor] = useState(defaultValues?.color ?? COLORS[0])
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    startTransition(async () => {
      const payload = { name, type, color, frequency: 1 }

      const result =
        mode === 'create'
          ? await createHabit(payload)
          : await updateHabit(habitId!, payload)

      if (result.error) {
        setError(result.error)
        return
      }

      router.refresh()
      if (onSuccess) onSuccess()
      else router.push('/habits')
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Nombre */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-brand-muted font-mono uppercase tracking-wide">
          Nombre
        </label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Ej: Meditar 10 minutos"
          required
          className="h-11 px-4 rounded-xl bg-brand-bg border border-brand-border text-brand-text placeholder-brand-border text-sm font-mono focus:outline-none focus:border-brand-dark transition"
        />
      </div>

      {/* Tipo */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-brand-muted font-mono uppercase tracking-wide">
          Frecuencia
        </label>
        <div className="flex gap-3">
          {(['daily', 'weekly'] as const).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`flex-1 h-11 rounded-xl border text-sm font-mono font-bold transition ${
                type === t
                  ? 'bg-brand-dark border-brand-dark text-white'
                  : 'bg-brand-bg border-brand-border text-brand-muted hover:border-brand-dark'
              }`}
            >
              {t === 'daily' ? 'Diario' : 'Semanal'}
            </button>
          ))}
        </div>
      </div>

      {/* Color */}
      <div className="flex flex-col gap-2">
        <label className="text-xs text-brand-muted font-mono uppercase tracking-wide">
          Color
        </label>
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

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <p className="text-red-700 text-sm font-mono">{error}</p>
        </div>
      )}

      {/* Preview */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex">
        <div className="w-1 flex-shrink-0" style={{ backgroundColor: color }} />
        <div className="px-4 py-3">
          <p className="text-sm font-bold font-mono text-brand-text">
            {name || 'Nombre del hábito'}
          </p>
          <p className="text-[10px] font-mono text-brand-muted mt-0.5">
            {type === 'daily' ? 'Diario' : 'Semanal'} · Vista previa
          </p>
        </div>
      </div>

      <div className="sticky bottom-0 pt-3 pb-5 bg-white border-t border-gray-100 mt-2">
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
