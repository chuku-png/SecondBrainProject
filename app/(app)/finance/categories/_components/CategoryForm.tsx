'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createCategory, updateCategory } from '@/app/_actions/finance'

const COLORS = [
  '#22c55e', '#6366f1', '#f59e0b', '#06b6d4', '#ef4444',
  '#f97316', '#8b5cf6', '#ec4899', '#84cc16', '#3b82f6',
  '#64748b', '#C4A882', '#3D2010', '#E07B4F', '#4A7C59',
]

type Props =
  | { mode?: 'create' }
  | {
      mode: 'edit'
      id: string
      initial: { name: string; type: 'income' | 'expense'; color: string }
    }

export default function CategoryForm(props: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const init = props.mode === 'edit' ? props.initial : null
  const [name, setName]   = useState(init?.name ?? '')
  const [type, setType]   = useState<'income' | 'expense'>(init?.type ?? 'expense')
  const [color, setColor] = useState(init?.color ?? COLORS[0])
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    startTransition(async () => {
      const result = props.mode === 'edit'
        ? await updateCategory(props.id, { name, color })
        : await createCategory({ name, type, color })

      if (result.error) { setError(result.error); return }
      router.push('/finance/categories')
      router.refresh()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Tipo — solo en create */}
      {props.mode !== 'edit' && (
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-brand-muted font-mono uppercase tracking-wide">Tipo</label>
          <div className="flex gap-3">
            <button type="button" onClick={() => setType('expense')}
              className={`flex-1 h-11 rounded-xl border text-sm font-mono font-bold transition ${
                type === 'expense' ? 'bg-red-500 border-red-500 text-white' : 'bg-brand-bg border-brand-border text-brand-muted hover:border-brand-dark'
              }`}>
              Gasto
            </button>
            <button type="button" onClick={() => setType('income')}
              className={`flex-1 h-11 rounded-xl border text-sm font-mono font-bold transition ${
                type === 'income' ? 'bg-green-500 border-green-500 text-white' : 'bg-brand-bg border-brand-border text-brand-muted hover:border-brand-dark'
              }`}>
              Ingreso
            </button>
          </div>
        </div>
      )}

      {/* Preview */}
      <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-4 py-3">
        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
        <span className="text-sm font-mono text-brand-text">{name || 'Nombre de la categoría'}</span>
      </div>

      {/* Nombre */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-brand-muted font-mono uppercase tracking-wide">Nombre</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)}
          placeholder="Ej: Comida" required
          className="h-11 px-4 rounded-xl bg-brand-bg border border-brand-border text-brand-text placeholder-brand-border text-sm font-mono focus:outline-none focus:border-brand-dark transition"
        />
      </div>

      {/* Color */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-brand-muted font-mono uppercase tracking-wide">Color</label>
        <div className="flex gap-2 flex-wrap">
          {COLORS.map(c => (
            <button key={c} type="button" onClick={() => setColor(c)}
              className={`w-8 h-8 rounded-full transition-transform ${color === c ? 'scale-125 ring-2 ring-offset-2 ring-brand-border' : ''}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <p className="text-red-700 text-sm font-mono">{error}</p>
        </div>
      )}

      <button type="submit" disabled={isPending || !name.trim()}
        className="h-11 bg-brand-dark hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm font-mono transition">
        {isPending ? 'Guardando...' : props.mode === 'edit' ? 'Guardar cambios' : 'Crear categoría'}
      </button>
    </form>
  )
}
