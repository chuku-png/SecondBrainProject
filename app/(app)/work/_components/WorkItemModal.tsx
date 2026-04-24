'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import Modal from '@/app/(app)/_components/Modal'
import { createWorkItem } from '@/app/_actions/work'

const inputCls = 'h-11 px-4 rounded-xl bg-brand-bg border border-brand-border text-brand-text placeholder-brand-border text-sm font-mono focus:outline-none focus:border-brand-dark transition'

function WorkItemForm({ onSuccess }: { onSuccess: () => void }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [title, setTitle]   = useState('')
  const [notes, setNotes]   = useState('')
  const [hours, setHours]   = useState('')
  const [date, setDate]     = useState(new Date().toISOString().split('T')[0])
  const [error, setError]   = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    startTransition(async () => {
      const result = await createWorkItem({
        title, notes, hours_worked: hours ? parseFloat(hours) : null, date,
      })
      if (result.error) { setError(result.error); return }
      router.refresh()
      onSuccess()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-brand-muted font-mono uppercase tracking-wide">Título</label>
        <input type="text" value={title} onChange={e => setTitle(e.target.value)}
          placeholder="Ej: Revisar pull requests" required className={inputCls} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-brand-muted font-mono uppercase tracking-wide">Notas <span className="normal-case">(opcional)</span></label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)}
          placeholder="Detalles adicionales..." rows={3}
          className="px-4 py-3 rounded-xl bg-brand-bg border border-brand-border text-brand-text placeholder-brand-border text-sm font-mono focus:outline-none focus:border-brand-dark transition resize-none" />
      </div>

      <div className="flex gap-3">
        <div className="flex flex-col gap-1.5 flex-1">
          <label className="text-xs text-brand-muted font-mono uppercase tracking-wide">Horas <span className="normal-case">(opcional)</span></label>
          <input type="number" value={hours} onChange={e => setHours(e.target.value)}
            placeholder="0" min="0" step="0.5" className={inputCls} />
        </div>
        <div className="flex flex-col gap-1.5 flex-1">
          <label className="text-xs text-brand-muted font-mono uppercase tracking-wide">Fecha</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} required className={inputCls} />
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3"><p className="text-red-700 text-sm font-mono">{error}</p></div>}

      <div className="sticky bottom-0 -mx-5 px-5 pt-3 pb-6 bg-white border-t border-gray-100 mt-2">
        <button type="submit" disabled={isPending || !title.trim()}
          className="w-full h-11 bg-brand-dark hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm font-mono transition">
          {isPending ? 'Guardando...' : 'Guardar tarea'}
        </button>
      </div>
    </form>
  )
}

export default function WorkItemModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal title="Nueva tarea" onClose={onClose}>
      <WorkItemForm onSuccess={onClose} />
    </Modal>
  )
}

export function WorkNewButton({ variant = 'header' }: { variant?: 'header' | 'sidebar' | 'fab' }) {
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
        {variant !== 'fab' && (variant === 'header' ? 'Nueva' : 'Nueva tarea')}
      </button>
      {open && <WorkItemModal onClose={() => setOpen(false)} />}
    </>
  )
}
