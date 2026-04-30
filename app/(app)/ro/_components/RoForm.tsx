'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, Star, Calendar, Bell, Gift } from 'lucide-react'
import { createRoDate, updateRoDate } from '@/app/_actions/ro'

const TYPES = [
  { value: 'aniversario',  label: 'Aniversario',  icon: <Heart size={14} /> },
  { value: 'cumpleaños',   label: 'Cumpleaños',   icon: <Gift size={14} /> },
  { value: 'especial',     label: 'Especial',      icon: <Star size={14} /> },
  { value: 'recordatorio', label: 'Recordatorio',  icon: <Bell size={14} /> },
  { value: 'otro',         label: 'Otro',          icon: <Calendar size={14} /> },
]

type RoFormProps =
  | { mode: 'create'; onSuccess?: () => void }
  | {
      mode: 'edit'
      id: string
      initial: {
        title: string
        date: string
        type: string
        notes: string | null
        recurring: boolean
      }
      onSuccess?: () => void
    }

export default function RoForm(props: RoFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const onSuccess = props.onSuccess

  const init = props.mode === 'edit' ? props.initial : null
  const [title, setTitle]       = useState(init?.title ?? '')
  const [date, setDate]         = useState(init?.date ?? '')
  const [type, setType]         = useState(init?.type ?? 'aniversario')
  const [notes, setNotes]       = useState(init?.notes ?? '')
  const [recurring, setRecurring] = useState(init?.recurring ?? true)
  const [error, setError]       = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    startTransition(async () => {
      const payload = { title, date, type, notes, recurring }
      const result = props.mode === 'edit'
        ? await updateRoDate(props.id, payload)
        : await createRoDate(payload)

      if (result.error) { setError(result.error); return }
      router.refresh()
      if (onSuccess) onSuccess()
      else router.push('/ro')
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Tipo */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-brand-muted font-mono uppercase tracking-wide">Tipo</label>
        <div className="flex flex-wrap gap-2">
          {TYPES.map(t => (
            <button
              key={t.value}
              type="button"
              onClick={() => setType(t.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                type === t.value
                  ? 'bg-brand-dark text-white'
                  : 'bg-brand-bg border border-brand-border text-brand-muted hover:border-brand-dark'
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Título */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-brand-muted font-mono uppercase tracking-wide">Título</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Ej: Aniversario con Ro"
          required
          className="h-11 px-4 rounded-xl bg-brand-bg border border-brand-border text-brand-text placeholder-brand-border text-sm font-mono focus:outline-none focus:border-brand-dark transition"
        />
      </div>

      {/* Fecha */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-brand-muted font-mono uppercase tracking-wide">Fecha</label>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          required
          className="h-11 px-4 rounded-xl bg-brand-bg border border-brand-border text-brand-text text-sm font-mono focus:outline-none focus:border-brand-dark transition"
        />
      </div>

      {/* Notas */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-brand-muted font-mono uppercase tracking-wide">
          Notas <span className="normal-case">(opcional)</span>
        </label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Detalles para recordar..."
          rows={2}
          className="px-4 py-3 rounded-xl bg-brand-bg border border-brand-border text-brand-text placeholder-brand-border text-sm font-mono focus:outline-none focus:border-brand-dark transition resize-none"
        />
      </div>

      {/* Recurrente */}
      <button
        type="button"
        onClick={() => setRecurring(r => !r)}
        className={`flex items-center gap-3 h-12 px-4 rounded-xl border text-sm font-mono font-bold transition ${
          recurring
            ? 'bg-brand-dark border-brand-dark text-white'
            : 'bg-brand-bg border-brand-border text-brand-muted'
        }`}
      >
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
          recurring ? 'border-white bg-white' : 'border-brand-border'
        }`}>
          {recurring && <div className="w-2.5 h-2.5 rounded-full bg-brand-dark" />}
        </div>
        Se repite cada año
      </button>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <p className="text-red-700 text-sm font-mono">{error}</p>
        </div>
      )}

      <div className="sticky bottom-0 -mx-5 px-5 pt-3 pb-6 bg-white border-t border-gray-100 mt-2">
        <button
          type="submit"
          disabled={isPending || !title.trim() || !date}
          className="w-full h-11 bg-brand-dark hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm font-mono transition"
        >
          {isPending
            ? 'Guardando...'
            : props.mode === 'edit' ? 'Guardar cambios' : 'Guardar fecha'}
        </button>
      </div>
    </form>
  )
}
