'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import Modal from '@/app/(app)/_components/Modal'
import { createWorkout } from '@/app/_actions/gym'

const WORKOUT_TYPES = [
  'Fuerza', 'Cardio', 'Yoga', 'Natación',
  'Ciclismo', 'Funcional', 'Boxeo', 'Pilates', 'Otro',
]

const inputCls = 'h-11 px-4 rounded-xl bg-brand-bg border border-brand-border text-brand-text placeholder-brand-border text-sm font-mono focus:outline-none focus:border-brand-dark transition'

function WorkoutForm({ onSuccess }: { onSuccess: () => void }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [type, setType]       = useState('')
  const [duration, setDuration] = useState('')
  const [notes, setNotes]     = useState('')
  const [date, setDate]       = useState(new Date().toISOString().split('T')[0])
  const [error, setError]     = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    startTransition(async () => {
      const result = await createWorkout({
        type, duration_minutes: duration ? parseInt(duration, 10) : null, notes, date,
      })
      if (result.error) { setError(result.error); return }
      router.refresh()
      onSuccess()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-brand-muted font-mono uppercase tracking-wide">Tipo</label>
        <div className="flex flex-wrap gap-2">
          {WORKOUT_TYPES.map(t => (
            <button key={t} type="button" onClick={() => setType(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                type === t ? 'bg-brand-dark text-white' : 'bg-brand-bg border border-brand-border text-brand-muted hover:border-brand-dark'
              }`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <div className="flex flex-col gap-1.5 flex-1">
          <label className="text-xs text-brand-muted font-mono uppercase tracking-wide">Duración <span className="normal-case">(min)</span></label>
          <input type="number" value={duration} onChange={e => setDuration(e.target.value)}
            placeholder="60" min="1" step="5" className={inputCls} />
        </div>
        <div className="flex flex-col gap-1.5 flex-1">
          <label className="text-xs text-brand-muted font-mono uppercase tracking-wide">Fecha</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} required className={inputCls} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-brand-muted font-mono uppercase tracking-wide">Notas <span className="normal-case">(opcional)</span></label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)}
          placeholder="Ej: Series, pesos, sensaciones..." rows={3}
          className="px-4 py-3 rounded-xl bg-brand-bg border border-brand-border text-brand-text placeholder-brand-border text-sm font-mono focus:outline-none focus:border-brand-dark transition resize-none" />
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3"><p className="text-red-700 text-sm font-mono">{error}</p></div>}

      <div className="sticky bottom-0 -mx-5 px-5 pt-3 pb-6 bg-white border-t border-gray-100 mt-2">
        <button type="submit" disabled={isPending || !type}
          className="w-full h-11 bg-brand-dark hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm font-mono transition">
          {isPending ? 'Guardando...' : 'Guardar entrenamiento'}
        </button>
      </div>
    </form>
  )
}

export default function WorkoutModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal title="Nuevo entrenamiento" onClose={onClose}>
      <WorkoutForm onSuccess={onClose} />
    </Modal>
  )
}

export function GymNewButton({ variant = 'header' }: { variant?: 'header' | 'sidebar' | 'fab' }) {
  const [open, setOpen] = useState(false)
  const cls = {
    header:  'flex items-center gap-1.5 bg-brand-dark hover:opacity-90 text-white text-sm font-mono font-bold px-3 py-2 rounded-xl transition mt-1',
    sidebar: 'flex items-center justify-center gap-2 h-11 bg-brand-dark hover:opacity-90 text-white text-sm font-mono font-bold rounded-xl transition w-full',
    fab:     'md:hidden fixed bottom-8 right-6 w-12 h-12 rounded-full bg-[#E07B4F] hover:opacity-90 flex items-center justify-center text-white shadow-lg transition z-30',
  }[variant]

  return (
    <>
      <button onClick={() => setOpen(true)} className={cls}>
        <Plus size={variant === 'fab' ? 22 : 15} />
        {variant !== 'fab' && (variant === 'header' ? 'Nuevo' : 'Nuevo entrenamiento')}
      </button>
      {open && <WorkoutModal onClose={() => setOpen(false)} />}
    </>
  )
}
