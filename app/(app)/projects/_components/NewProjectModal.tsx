'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import Modal from '@/app/(app)/_components/Modal'
import { createProject } from '@/app/_actions/projects'

const COLORS = [
  '#3D2010', '#E07B4F', '#C4A882', '#4A7C59',
  '#5B8DB8', '#8B5E8B', '#C4624A', '#7A6B4A',
  '#4A6B7A', '#B85B8D',
]

const inputCls = 'h-11 px-4 rounded-xl bg-brand-bg border border-brand-border text-brand-text placeholder-brand-border text-sm font-mono focus:outline-none focus:border-brand-dark transition'

function NewProjectForm({ onSuccess }: { onSuccess: () => void }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [name, setName]           = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor]         = useState(COLORS[0])
  const [error, setError]         = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    startTransition(async () => {
      const result = await createProject({ name, description, color })
      if (result.error) { setError(result.error); return }
      router.refresh()
      onSuccess()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex">
        <div className="w-1 flex-shrink-0 transition-colors" style={{ backgroundColor: color }} />
        <div className="px-4 py-3.5">
          <p className="text-sm font-bold font-mono text-brand-text">{name || 'Nombre del proyecto'}</p>
          {description && <p className="text-brand-muted text-[11px] font-mono mt-0.5">{description}</p>}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-brand-muted font-mono uppercase tracking-wide">Nombre</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)}
          placeholder="Ej: Rediseño web" required className={inputCls} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-brand-muted font-mono uppercase tracking-wide">Descripción <span className="normal-case">(opcional)</span></label>
        <textarea value={description} onChange={e => setDescription(e.target.value)}
          placeholder="De qué trata este proyecto..." rows={2}
          className="px-4 py-3 rounded-xl bg-brand-bg border border-brand-border text-brand-text placeholder-brand-border text-sm font-mono focus:outline-none focus:border-brand-dark transition resize-none" />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-brand-muted font-mono uppercase tracking-wide">Color</label>
        <div className="flex gap-2 flex-wrap">
          {COLORS.map(c => (
            <button key={c} type="button" onClick={() => setColor(c)}
              className={`w-8 h-8 rounded-full transition-transform ${color === c ? 'scale-125 ring-2 ring-offset-2 ring-brand-border' : ''}`}
              style={{ backgroundColor: c }} />
          ))}
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3"><p className="text-red-700 text-sm font-mono">{error}</p></div>}

      <div className="sticky bottom-0 -mx-5 px-5 pt-3 pb-6 bg-white border-t border-gray-100 mt-2">
        <button type="submit" disabled={isPending || !name.trim()}
          className="w-full h-11 bg-brand-dark hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm font-mono transition">
          {isPending ? 'Creando...' : 'Crear proyecto'}
        </button>
      </div>
    </form>
  )
}

export default function NewProjectModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal title="Nuevo proyecto" onClose={onClose}>
      <NewProjectForm onSuccess={onClose} />
    </Modal>
  )
}

export function ProjectNewButton({ variant = 'header' }: { variant?: 'header' | 'sidebar' | 'fab' }) {
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
        {variant !== 'fab' && (variant === 'header' ? 'Nuevo' : 'Nuevo proyecto')}
      </button>
      {open && <NewProjectModal onClose={() => setOpen(false)} />}
    </>
  )
}
