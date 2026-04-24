'use client'

import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import Modal from '@/app/(app)/_components/Modal'
import NewTransactionForm from './NewTransactionForm'
import { getAccounts, getCategories } from '@/app/_actions/finance'

type Account  = { id: string; name: string; type: string; color: string; balance: number }
type Category = { id: string; name: string; type: 'income' | 'expense'; color: string }

function TransactionFormLoader({
  onClose,
  initialAccounts,
  initialCategories,
}: {
  onClose: () => void
  initialAccounts?: Account[]
  initialCategories?: Category[]
}) {
  const [accounts, setAccounts]     = useState<Account[]>(initialAccounts ?? [])
  const [categories, setCategories] = useState<Category[]>(initialCategories ?? [])
  const [loading, setLoading]       = useState(!initialAccounts || !initialCategories)

  useEffect(() => {
    if (initialAccounts && initialCategories) return
    Promise.all([getAccounts(), getCategories()]).then(([a, c]) => {
      setAccounts((a.data ?? []) as Account[])
      setCategories((c.data ?? []) as Category[])
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-brand-dark border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <NewTransactionForm
      accounts={accounts}
      categories={categories}
      onSuccess={onClose}
    />
  )
}

export default function TransactionModal({
  onClose,
  accounts,
  categories,
}: {
  onClose: () => void
  accounts?: Account[]
  categories?: Category[]
}) {
  return (
    <Modal title="Nueva transacción" onClose={onClose}>
      <TransactionFormLoader
        onClose={onClose}
        initialAccounts={accounts}
        initialCategories={categories}
      />
    </Modal>
  )
}

export function TransactionNewButton({
  variant = 'header',
  accounts,
  categories,
}: {
  variant?: 'header' | 'sidebar' | 'fab' | 'text'
  accounts?: Account[]
  categories?: Category[]
}) {
  const [open, setOpen] = useState(false)

  if (variant === 'text') {
    return (
      <>
        <button onClick={() => setOpen(true)} className="flex items-center gap-1.5 text-brand-muted hover:text-brand-text transition-colors text-xs font-mono">
          <Plus size={12} /> Nueva cuenta
        </button>
        {open && <TransactionModal onClose={() => setOpen(false)} accounts={accounts} categories={categories} />}
      </>
    )
  }

  const cls = {
    header:  'flex items-center gap-1.5 bg-brand-dark hover:opacity-90 text-white text-sm font-mono font-bold px-3 py-2 rounded-xl transition mt-1',
    sidebar: 'flex items-center justify-center gap-2 h-11 bg-brand-dark hover:opacity-90 text-white text-sm font-mono font-bold rounded-xl transition w-full',
    fab:     'fixed bottom-8 right-6 w-12 h-12 rounded-full bg-[#E07B4F] hover:opacity-90 flex items-center justify-center text-white shadow-lg transition z-30 md:bottom-6',
  }[variant as 'header' | 'sidebar' | 'fab']

  return (
    <>
      <button onClick={() => setOpen(true)} className={cls}>
        <Plus size={variant === 'fab' ? 22 : 15} />
        {variant !== 'fab' && (variant === 'header' ? 'Agregar' : 'Nueva transacción')}
      </button>
      {open && <TransactionModal onClose={() => setOpen(false)} accounts={accounts} categories={categories} />}
    </>
  )
}
