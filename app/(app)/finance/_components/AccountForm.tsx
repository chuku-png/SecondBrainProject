'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Landmark, Smartphone, Banknote } from 'lucide-react'
import { createAccount, updateAccount } from '@/app/_actions/finance'

const TYPES = [
  { value: 'bank',   label: 'Banco',            icon: Landmark },
  { value: 'wallet', label: 'Billetera virtual', icon: Smartphone },
  { value: 'cash',   label: 'Efectivo',          icon: Banknote },
] as const

const COLORS = [
  '#3D2010', '#E07B4F', '#4A7C59', '#5B8DB8',
  '#8B5E8B', '#C4624A', '#7A6B4A', '#4A6B7A',
]

type Props =
  | { mode?: 'create'; onSuccess?: () => void }
  | {
      mode: 'edit'
      id: string
      initial: { name: string; type: 'bank' | 'wallet' | 'cash'; initial_balance: number; color: string }
      onSuccess?: () => void
    }

export default function AccountForm(props: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const init = props.mode === 'edit' ? props.initial : null
  const [name, setName]                     = useState(init?.name ?? '')
  const [type, setType]                     = useState<'bank' | 'wallet' | 'cash'>(init?.type ?? 'bank')
  const [initialBalance, setInitialBalance] = useState(init ? String(init.initial_balance) : '')
  const [color, setColor]                   = useState(init?.color ?? COLORS[0])
  const [error, setError]                   = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    startTransition(async () => {
      const payload = {
        name, type,
        initial_balance: parseFloat(initialBalance.replace(',', '.')) || 0,
        color,
      }
      const result = props.mode === 'edit'
        ? await updateAccount(props.id, payload)
        : await createAccount(payload)

      if (result.error) { setError(result.error); return }
      router.refresh()
      const onSuccess = props.onSuccess
      if (onSuccess) onSuccess()
      else router.push('/finance')
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-brand-muted font-mono uppercase tracking-wide">Tipo</label>
        <div className="flex gap-3">
          {TYPES.map(t => {
            const Icon = t.icon
            return (
              <button key={t.value} type="button" onClick={() => setType(t.value)}
                className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-mono font-bold transition ${
                  type === t.value ? 'bg-brand-dark border-brand-dark text-white' : 'bg-brand-bg border-brand-border text-brand-muted hover:border-brand-dark'
                }`}>
                <Icon size={18} />
                {t.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-brand-muted font-mono uppercase tracking-wide">Nombre</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)}
          placeholder={type === 'bank' ? 'Ej: Santander' : type === 'wallet' ? 'Ej: Mercado Pago' : 'Efectivo'}
          required
          className="h-11 px-4 rounded-xl bg-brand-bg border border-brand-border text-brand-text placeholder-brand-border text-sm font-mono focus:outline-none focus:border-brand-dark transition"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-brand-muted font-mono uppercase tracking-wide">
          Saldo inicial <span className="normal-case">(opcional)</span>
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted font-mono text-sm">$</span>
          <input type="number" value={initialBalance} onChange={e => setInitialBalance(e.target.value)}
            placeholder="0" min="0" step="0.01"
            className="h-11 w-full pl-8 pr-4 rounded-xl bg-brand-bg border border-brand-border text-brand-text text-sm font-mono focus:outline-none focus:border-brand-dark transition"
          />
        </div>
      </div>

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

      <div className="sticky bottom-0 pt-3 pb-5 bg-white border-t border-gray-100 mt-2">
        <button type="submit" disabled={isPending || !name.trim()}
          className="w-full h-11 bg-brand-dark hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm font-mono transition">
          {isPending ? 'Guardando...' : props.mode === 'edit' ? 'Guardar cambios' : 'Crear cuenta'}
        </button>
      </div>
    </form>
  )
}
