'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import Modal from '@/app/(app)/_components/Modal'
import AccountForm from './AccountForm'

export default function AccountModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal title="Nueva cuenta" onClose={onClose}>
      <AccountForm mode="create" onSuccess={onClose} />
    </Modal>
  )
}

export function AccountNewButton({ variant = 'inline' }: { variant?: 'inline' | 'card' | 'thumb' }) {
  const [open, setOpen] = useState(false)

  const cls =
    variant === 'card'
      ? 'flex items-center gap-3 bg-white border border-dashed border-brand-border rounded-2xl px-4 py-3.5 hover:border-brand-dark transition-colors w-full'
      : variant === 'thumb'
      ? 'flex-shrink-0 flex flex-col items-center justify-center w-28 h-24 bg-white border border-dashed border-brand-border rounded-2xl hover:border-brand-dark transition-colors gap-1'
      : 'text-xs font-mono text-brand-muted hover:text-brand-text transition-colors flex items-center gap-1'

  return (
    <>
      <button onClick={() => setOpen(true)} className={cls}>
        <Plus size={variant === 'thumb' || variant === 'card' ? 16 : 12} className="text-brand-muted" />
        {variant === 'card' && <span className="text-sm font-mono text-brand-muted">Agregar cuenta</span>}
        {variant === 'thumb' && <span className="text-[10px] font-mono text-brand-muted">Nueva</span>}
        {variant === 'inline' && <span>Agregar</span>}
      </button>
      {open && <AccountModal onClose={() => setOpen(false)} />}
    </>
  )
}
