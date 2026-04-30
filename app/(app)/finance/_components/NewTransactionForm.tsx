'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Landmark, Smartphone, Banknote } from 'lucide-react'
import { createTransaction, updateTransaction } from '@/app/_actions/finance'
import { localDateStr } from '@/lib/timezone'

const ACCOUNT_ICONS: Record<string, React.ElementType> = {
  bank:   Landmark,
  wallet: Smartphone,
  cash:   Banknote,
}

interface Account {
  id: string
  name: string
  type: string
  color: string
  balance: number
}

interface Category {
  id: string
  name: string
  type: 'income' | 'expense'
  color: string
}

type Props =
  | {
      mode?: 'create'
      accounts: Account[]
      categories: Category[]
      onSuccess?: () => void
    }
  | {
      mode: 'edit'
      id: string
      accounts: Account[]
      categories: Category[]
      onSuccess?: () => void
      initial: {
        type: 'income' | 'expense'
        amount: number
        category: string
        description: string | null
        date: string
        account_id: string | null
      }
    }

export default function NewTransactionForm(props: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const init = props.mode === 'edit' ? props.initial : null
  const [type, setType]           = useState<'income' | 'expense'>(init?.type ?? 'expense')
  const [amount, setAmount]       = useState(init ? String(init.amount) : '')
  const [category, setCategory]   = useState(init?.category ?? '')
  const [description, setDescription] = useState(init?.description ?? '')
  const [date, setDate]           = useState(init?.date ?? localDateStr())
  const [accountId, setAccountId] = useState<string>(init?.account_id ?? '')
  const [error, setError]         = useState('')

  const filteredCategories = props.categories.filter(c => c.type === type)

  function handleTypeChange(t: 'income' | 'expense') {
    setType(t)
    setCategory('')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const amountNum = parseFloat(amount.replace(',', '.'))
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Ingresá un monto válido mayor a 0')
      return
    }

    startTransition(async () => {
      const payload = {
        type, amount: amountNum, category,
        description, date, account_id: accountId || null,
      }
      const result = props.mode === 'edit'
        ? await updateTransaction(props.id, payload)
        : await createTransaction(payload)

      if (result.error) { setError(result.error); return }
      router.refresh()
      if (props.onSuccess) props.onSuccess()
      else router.push('/finance')
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Tipo */}
      <div className="flex gap-3">
        <button type="button" onClick={() => handleTypeChange('expense')}
          className={`flex-1 h-11 rounded-xl border text-sm font-mono font-bold transition ${
            type === 'expense' ? 'bg-red-500 border-red-500 text-white' : 'bg-brand-bg border-brand-border text-brand-muted hover:border-brand-dark'
          }`}>
          Gasto
        </button>
        <button type="button" onClick={() => handleTypeChange('income')}
          className={`flex-1 h-11 rounded-xl border text-sm font-mono font-bold transition ${
            type === 'income' ? 'bg-green-500 border-green-500 text-white' : 'bg-brand-bg border-brand-border text-brand-muted hover:border-brand-dark'
          }`}>
          Ingreso
        </button>
      </div>

      {/* Monto */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-brand-muted font-mono uppercase tracking-wide">Monto</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted font-mono text-sm">$</span>
          <input
            type="number" value={amount} onChange={e => setAmount(e.target.value)}
            placeholder="0.00" required min="0.01" step="0.01"
            className="h-11 w-full pl-8 pr-4 rounded-xl bg-brand-bg border border-brand-border text-brand-text text-sm font-mono focus:outline-none focus:border-brand-dark transition"
          />
        </div>
      </div>

      {/* Cuenta */}
      {props.accounts.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-brand-muted font-mono uppercase tracking-wide">
            Cuenta <span className="normal-case">(opcional)</span>
          </label>
          <div className="flex gap-2 flex-wrap">
            <button type="button" onClick={() => setAccountId('')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                accountId === '' ? 'bg-brand-dark text-white' : 'bg-brand-bg border border-brand-border text-brand-muted hover:border-brand-dark'
              }`}>
              Sin asignar
            </button>
            {props.accounts.map(acc => {
              const Icon = ACCOUNT_ICONS[acc.type] ?? Landmark
              return (
                <button key={acc.id} type="button" onClick={() => setAccountId(acc.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                    accountId === acc.id ? 'text-white' : 'bg-brand-bg border border-brand-border text-brand-muted hover:border-brand-dark'
                  }`}
                  style={accountId === acc.id ? { backgroundColor: acc.color } : {}}>
                  <Icon size={11} />
                  {acc.name}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Categoría */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs text-brand-muted font-mono uppercase tracking-wide">Categoría</label>
          <a href="/finance/categories" className="text-[10px] font-mono text-brand-muted hover:text-brand-text transition-colors">
            Gestionar
          </a>
        </div>
        {filteredCategories.length === 0 ? (
          <p className="text-xs font-mono text-brand-muted">
            Sin categorías de {type === 'expense' ? 'gastos' : 'ingresos'}.{' '}
            <a href="/finance/categories/new" className="underline">Agregar</a>
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {filteredCategories.map(cat => (
              <button key={cat.id} type="button" onClick={() => setCategory(cat.name)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                  category === cat.name ? 'text-white' : 'bg-brand-bg border border-brand-border text-brand-muted hover:border-brand-dark'
                }`}
                style={category === cat.name ? { backgroundColor: cat.color } : {}}>
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: category === cat.name ? 'white' : cat.color }} />
                {cat.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Descripción */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-brand-muted font-mono uppercase tracking-wide">
          Descripción <span className="normal-case">(opcional)</span>
        </label>
        <input type="text" value={description} onChange={e => setDescription(e.target.value)}
          placeholder="Ej: Almuerzo con cliente"
          className="h-11 px-4 rounded-xl bg-brand-bg border border-brand-border text-brand-text placeholder-brand-border text-sm font-mono focus:outline-none focus:border-brand-dark transition"
        />
      </div>

      {/* Fecha */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-brand-muted font-mono uppercase tracking-wide">Fecha</label>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} required
          className="h-11 px-4 rounded-xl bg-brand-bg border border-brand-border text-brand-text text-sm font-mono focus:outline-none focus:border-brand-dark transition"
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <p className="text-red-700 text-sm font-mono">{error}</p>
        </div>
      )}

      <div className="sticky bottom-0 -mx-5 px-5 pt-3 pb-6 bg-white border-t border-gray-100 mt-2">
        <button type="submit" disabled={isPending || !amount || !category}
          className="w-full h-11 bg-brand-dark hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm font-mono transition">
          {isPending ? 'Guardando...' : props.mode === 'edit' ? 'Guardar cambios' : 'Guardar transacción'}
        </button>
      </div>
    </form>
  )
}
