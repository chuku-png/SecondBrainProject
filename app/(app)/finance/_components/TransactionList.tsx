'use client'

import { useState, useTransition } from 'react'
import { Trash2, TrendingUp, TrendingDown } from 'lucide-react'
import { deleteTransaction } from '@/app/_actions/finance'

interface Transaction {
  id: string
  type: 'income' | 'expense'
  amount: number
  category: string
  description: string | null
  date: string
}

const CATEGORY_COLORS: Record<string, string> = {
  Sueldo: '#22c55e', Freelance: '#6366f1', Inversiones: '#f59e0b',
  Comida: '#ef4444', Transporte: '#f97316', Vivienda: '#8b5cf6',
  Salud: '#ec4899', Entretenimiento: '#06b6d4', Ropa: '#84cc16',
  Educación: '#3b82f6', Servicios: '#64748b', Otro: '#C4A882',
}

type Filter = 'all' | 'income' | 'expense'

export default function TransactionList({ transactions }: { transactions: Transaction[] }) {
  const [filter, setFilter] = useState<Filter>('all')

  const filtered = transactions.filter(t =>
    filter === 'all' ? true : t.type === filter
  )

  // Agrupar por fecha
  const grouped = filtered.reduce<Record<string, Transaction[]>>((acc, t) => {
    if (!acc[t.date]) acc[t.date] = []
    acc[t.date].push(t)
    return acc
  }, {})

  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a))

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T12:00:00')
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (dateStr === today.toISOString().split('T')[0]) return 'Hoy'
    if (dateStr === yesterday.toISOString().split('T')[0]) return 'Ayer'
    return date.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
  }

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {(['all', 'income', 'expense'] as Filter[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors ${
              filter === f
                ? 'bg-brand-dark text-white'
                : 'bg-white border border-gray-100 text-brand-muted hover:text-brand-text'
            }`}
          >
            {f === 'all' ? 'Todos' : f === 'income' ? 'Ingresos' : 'Gastos'}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-brand-muted text-sm font-mono">Sin transacciones</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {sortedDates.map(date => (
            <div key={date}>
              <p className="text-brand-muted text-[10px] font-mono uppercase tracking-wider mb-2 capitalize">
                {formatDate(date)}
              </p>
              <div className="flex flex-col gap-2">
                {grouped[date].map(t => (
                  <TransactionItem key={t.id} transaction={t} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function TransactionItem({ transaction: t }: { transaction: Transaction }) {
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    if (!confirm('¿Eliminar esta transacción?')) return
    startTransition(async () => { await deleteTransaction(t.id) })
  }

  const color = CATEGORY_COLORS[t.category] ?? '#C4A882'
  const isIncome = t.type === 'income'

  return (
    <div className={`bg-white rounded-xl border border-gray-100 flex items-center gap-3 px-4 py-3 transition-opacity ${isPending ? 'opacity-50' : ''}`}>
      {/* Ícono */}
      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color + '20' }}>
        {isIncome
          ? <TrendingUp size={15} style={{ color }} />
          : <TrendingDown size={15} style={{ color }} />
        }
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-brand-text text-xs font-bold font-mono truncate">
          {t.description || t.category}
        </p>
        <p className="text-brand-muted text-[10px] font-mono">{t.category}</p>
      </div>

      {/* Monto */}
      <p className={`text-sm font-bold font-mono flex-shrink-0 ${isIncome ? 'text-green-600' : 'text-red-500'}`}>
        {isIncome ? '+' : '-'}${Number(t.amount).toLocaleString('es-AR')}
      </p>

      {/* Eliminar */}
      <button
        onClick={handleDelete}
        disabled={isPending}
        className="text-gray-300 hover:text-red-400 transition-colors p-1 disabled:opacity-50"
      >
        <Trash2 size={13} />
      </button>
    </div>
  )
}
