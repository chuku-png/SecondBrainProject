'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createObjective, updateObjective } from '@/app/_actions/objectives'

const COLORS = [
  '#3D2010', '#E07B4F', '#C4A882', '#4A7C59',
  '#5B8DB8', '#8B5E8B', '#C4624A', '#7A6B4A',
  '#4A6B7A', '#B85B8D',
]

type ObjectiveFormProps =
  | { mode: 'create'; redirectTo?: string; onSuccess?: () => void }
  | {
      mode: 'edit'
      id: string
      initial: {
        title: string
        description: string | null
        target_date: string | null
        color: string
        status: string
      }
      redirectTo?: string
      onSuccess?: () => void
    }

export default function ObjectiveForm(props: ObjectiveFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const initial = props.mode === 'edit' ? props.initial : null
  const [title, setTitle] = useState(initial?.title ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [targetDate, setTargetDate] = useState(initial?.target_date ?? '')
  const [color, setColor] = useState(initial?.color ?? COLORS[0])
  const [status, setStatus] = useState(initial?.status ?? 'active')
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    startTransition(async () => {
      const payload = {
        title,
        description,
        target_date: targetDate || null,
        color,
      }

      if (props.mode === 'edit') {
        const result = await updateObjective(props.id, { ...payload, status })
        if (result.error) { setError(result.error); return }
        router.refresh()
        if (props.onSuccess) props.onSuccess()
        else router.push(props.redirectTo ?? `/objectives/${props.id}`)
      } else {
        const result = await createObjective(payload)
        if (result.error) { setError(result.error); return }
        router.refresh()
        if (props.onSuccess) props.onSuccess()
        else {
          const created = result as { success?: boolean; id?: string }
          router.push(created.id ? `/objectives/${created.id}` : '/objectives')
        }
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Preview */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex">
        <div className="w-1 flex-shrink-0 transition-colors" style={{ backgroundColor: color }} />
        <div className="px-4 py-2.5">
          <p className="text-sm font-bold font-mono text-brand-text">{title || 'Título del objetivo'}</p>
          {description && (
            <p className="text-brand-muted text-[11px] font-mono mt-0.5">{description}</p>
          )}
        </div>
      </div>

      {/* Título */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-brand-muted font-mono uppercase tracking-wide">Título</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Ej: Correr 5k en menos de 25 min"
          required
          className="h-11 px-4 rounded-xl bg-brand-bg border border-brand-border text-brand-text placeholder-brand-border text-sm font-mono focus:outline-none focus:border-brand-dark transition"
        />
      </div>

      {/* Descripción */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-brand-muted font-mono uppercase tracking-wide">
          Descripción <span className="normal-case">(opcional)</span>
        </label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Por qué es importante este objetivo..."
          rows={2}
          className="px-4 py-3 rounded-xl bg-brand-bg border border-brand-border text-brand-text placeholder-brand-border text-sm font-mono focus:outline-none focus:border-brand-dark transition resize-none"
        />
      </div>

      {/* Fecha límite */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-brand-muted font-mono uppercase tracking-wide">
          Fecha límite <span className="normal-case">(opcional)</span>
        </label>
        <input
          type="date"
          value={targetDate}
          onChange={e => setTargetDate(e.target.value)}
          className="h-11 px-4 rounded-xl bg-brand-bg border border-brand-border text-brand-text text-sm font-mono focus:outline-none focus:border-brand-dark transition"
        />
      </div>

      {/* Color */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-brand-muted font-mono uppercase tracking-wide">Color</label>
        <div className="flex gap-2 flex-wrap">
          {COLORS.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`w-8 h-8 rounded-full transition-transform ${color === c ? 'scale-125 ring-2 ring-offset-2 ring-brand-border' : ''}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      {/* Estado (solo en edición) */}
      {props.mode === 'edit' && (
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-brand-muted font-mono uppercase tracking-wide">Estado</label>
          <div className="flex gap-2">
            {([['active', 'Activo'], ['completed', 'Completado']] as const).map(([val, label]) => (
              <button
                key={val}
                type="button"
                onClick={() => setStatus(val)}
                className={`flex-1 h-10 rounded-xl text-sm font-mono font-bold transition-colors ${
                  status === val ? 'bg-brand-dark text-white' : 'bg-gray-100 text-brand-muted hover:text-brand-text'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <p className="text-red-700 text-sm font-mono">{error}</p>
        </div>
      )}

      <div className="sticky bottom-0 -mx-5 px-5 pt-3 pb-6 bg-white border-t border-gray-100 mt-2">
        <button
          type="submit"
          disabled={isPending || !title.trim()}
          className="w-full h-11 bg-brand-dark hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm font-mono transition"
        >
          {isPending
            ? props.mode === 'edit' ? 'Guardando...' : 'Creando...'
            : props.mode === 'edit' ? 'Guardar cambios' : 'Crear objetivo'}
        </button>
      </div>
    </form>
  )
}
