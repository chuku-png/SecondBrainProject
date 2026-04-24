'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import Modal from '@/app/(app)/_components/Modal'
import ObjectiveForm from './ObjectiveForm'

export default function NewObjectiveModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal title="Nuevo objetivo" onClose={onClose}>
      <ObjectiveForm mode="create" onSuccess={onClose} />
    </Modal>
  )
}

export function ObjectiveNewButton({ variant = 'header' }: { variant?: 'header' | 'sidebar' | 'fab' }) {
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
        {variant !== 'fab' && (variant === 'header' ? 'Nuevo' : 'Nuevo objetivo')}
      </button>
      {open && <NewObjectiveModal onClose={() => setOpen(false)} />}
    </>
  )
}
