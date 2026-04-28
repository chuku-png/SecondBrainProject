'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TrendingUp, TrendingDown, Landmark, Smartphone, Banknote, Trash2, Pencil, Search, Download } from 'lucide-react'
import { deleteTransaction, deleteAccount } from '@/app/_actions/finance'
import { AccountNewButton } from './AccountModal'
import DebtsList from './DebtsList'
import type { Debt } from '@/app/_actions/debts'

function exportCSV(transactions: Transaction[]) {
  const header = 'Fecha,Tipo,Monto,Categoría,Descripción'
  const rows = transactions.map(t =>
    `${t.date},${t.type === 'income' ? 'Ingreso' : 'Gasto'},${t.amount},"${t.category}","${t.description ?? ''}"`
  )
  const csv = [header, ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `finanzas-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface Transaction {
  id: string
  type: 'income' | 'expense'
  amount: number
  category: string
  description: string | null
  date: string
  account_id: string | null
}

interface Account {
  id: string
  name: string
  type: 'bank' | 'wallet' | 'cash'
  initial_balance: number
  color: string
  balance: number
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  Sueldo: '#22c55e', Freelance: '#6366f1', Inversiones: '#f59e0b', Alquiler: '#06b6d4',
  Comida: '#ef4444', Transporte: '#f97316', Vivienda: '#8b5cf6',
  Salud: '#ec4899', Entretenimiento: '#06b6d4', Ropa: '#84cc16',
  Educación: '#3b82f6', Servicios: '#64748b', Otro: '#C4A882',
}

const ACCOUNT_ICONS = {
  bank:   Landmark,
  wallet: Smartphone,
  cash:   Banknote,
}

type Tab = 'movements' | 'expenses' | 'income'

// ─── Main component ───────────────────────────────────────────────────────────

export default function FinanceDashboard({
  transactions,
  accounts,
  income,
  expense,
  balance,
  netWorth,
  debts,
}: {
  transactions: Transaction[]
  accounts: Account[]
  income: number
  expense: number
  balance: number
  netWorth: number
  debts: Debt[]
}) {
  const [tab, setTab]       = useState<Tab>('movements')
  const [search, setSearch] = useState('')

  const filtered = search.trim()
    ? transactions.filter(t =>
        t.description?.toLowerCase().includes(search.toLowerCase()) ||
        t.category.toLowerCase().includes(search.toLowerCase())
      )
    : transactions

  const filteredIncome  = filtered.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
  const filteredExpense = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)

  const tabs: { key: Tab; label: string }[] = [
    { key: 'movements', label: 'Movimientos' },
    { key: 'expenses',  label: 'En qué gasté' },
    { key: 'income',    label: 'Qué ingresé' },
  ]

  return (
    <div className="space-y-4">
      {/* Balance cards — 2 columns */}
      <div className="grid grid-cols-2 gap-3">
        {/* Balance del mes */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden col-span-2 md:col-span-1">
          <div className="h-1 w-full" style={{ backgroundColor: balance >= 0 ? '#22c55e' : '#ef4444' }} />
          <div className="p-4 md:p-5">
            <p className="text-brand-muted text-[10px] font-mono uppercase tracking-wide mb-1">Balance del mes</p>
            <p className={`text-3xl font-bold font-mono leading-none ${balance >= 0 ? 'text-green-600' : 'text-red-500'}`}>
              {balance >= 0 ? '+' : '-'}${Math.abs(balance).toLocaleString('es-AR')}
            </p>

            {(income > 0 || expense > 0) && (
              <div className="mt-3">
                <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full bg-green-400 rounded-full transition-all"
                    style={{ width: `${income + expense > 0 ? (income / (income + expense)) * 100 : 0}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex gap-4 mt-3">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-full bg-green-50 flex items-center justify-center">
                  <TrendingUp size={12} className="text-green-500" />
                </div>
                <div>
                  <p className="text-[10px] text-brand-muted font-mono">Ingresos</p>
                  <p className="text-xs font-bold font-mono text-green-600">${income.toLocaleString('es-AR')}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-full bg-red-50 flex items-center justify-center">
                  <TrendingDown size={12} className="text-red-400" />
                </div>
                <div>
                  <p className="text-[10px] text-brand-muted font-mono">Gastos</p>
                  <p className="text-xs font-bold font-mono text-red-500">${expense.toLocaleString('es-AR')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Total en cuentas */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden col-span-2 md:col-span-1">
          <div className="h-1 w-full" style={{ backgroundColor: netWorth >= 0 ? '#6366f1' : '#ef4444' }} />
          <div className="p-4 md:p-5 flex flex-col justify-between h-full">
            <div>
              <p className="text-brand-muted text-[10px] font-mono uppercase tracking-wide mb-1">Total en cuentas</p>
              <p className={`text-3xl font-bold font-mono leading-none ${netWorth >= 0 ? 'text-indigo-600' : 'text-red-500'}`}>
                {netWorth >= 0 ? '' : '-'}${Math.abs(netWorth).toLocaleString('es-AR')}
              </p>
            </div>
            <p className="text-[10px] text-brand-muted font-mono mt-4 leading-relaxed">
              Saldo real entre todas tus cuentas
            </p>
          </div>
        </div>
      </div>

      {/* Cuentas */}
      <AccountsSection accounts={accounts} />

      {/* Deudas */}
      <DebtsList debts={debts} />

      {/* Search + Export */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por categoría o descripción..."
            className="w-full h-10 pl-9 pr-3 rounded-xl bg-white border border-gray-100 text-brand-text placeholder-brand-border text-xs font-mono focus:outline-none focus:border-brand-dark transition"
          />
        </div>
        <button
          onClick={() => exportCSV(transactions)}
          className="h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-gray-100 text-brand-muted hover:text-brand-text transition-colors flex-shrink-0"
          title="Exportar CSV"
        >
          <Download size={15} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors ${
              tab === t.key
                ? 'bg-brand-dark text-white'
                : 'bg-white border border-gray-100 text-brand-muted hover:text-brand-text'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {search && (
        <p className="text-[10px] font-mono text-brand-muted -mt-1">
          {filtered.length} resultado{filtered.length !== 1 ? 's' : ''} para &quot;{search}&quot;
        </p>
      )}

      {/* Tab content */}
      {tab === 'movements' && (
        <MovementsList transactions={filtered} accounts={accounts} />
      )}
      {tab === 'expenses' && (
        <Breakdown transactions={filtered.filter(t => t.type === 'expense')} type="expense" total={filteredExpense} />
      )}
      {tab === 'income' && (
        <Breakdown transactions={filtered.filter(t => t.type === 'income')} type="income" total={filteredIncome} />
      )}
    </div>
  )
}

// ─── Accounts section ─────────────────────────────────────────────────────────

function AccountsSection({ accounts }: { accounts: Account[] }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-mono text-brand-muted uppercase tracking-wide">Cuentas</p>
        <AccountNewButton variant="inline" />
      </div>

      {accounts.length === 0 ? (
        <AccountNewButton variant="card" />
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1">
          {accounts.map(acc => <AccountCard key={acc.id} account={acc} />)}
          <AccountNewButton variant="thumb" />
        </div>
      )}
    </div>
  )
}

function AccountCard({ account }: { account: Account }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const Icon = ACCOUNT_ICONS[account.type] ?? Landmark

  function handleDelete() {
    if (!confirm(`¿Eliminar cuenta "${account.name}"? Los movimientos asociados quedarán sin cuenta.`)) return
    startTransition(async () => {
      await deleteAccount(account.id)
      router.refresh()
    })
  }

  return (
    <div
      className={`flex-shrink-0 w-36 bg-white border border-gray-100 rounded-2xl overflow-hidden transition-opacity ${isPending ? 'opacity-50' : ''}`}
    >
      <div className="h-1 w-full" style={{ backgroundColor: account.color }} />
      <div className="p-3">
        <div className="flex items-start justify-between mb-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: account.color + '20' }}>
            <Icon size={14} style={{ color: account.color }} />
          </div>
          <div className="flex gap-0.5">
            <Link href={`/finance/accounts/${account.id}/edit`} className="text-gray-200 hover:text-brand-muted transition-colors p-0.5">
              <Pencil size={10} />
            </Link>
            <button
              onClick={handleDelete}
              disabled={isPending}
              className="text-gray-200 hover:text-red-400 transition-colors p-0.5"
            >
              <Trash2 size={10} />
            </button>
          </div>
        </div>
        <p className="text-[10px] font-mono text-brand-muted truncate">{account.name}</p>
        <p className={`text-sm font-bold font-mono leading-tight mt-0.5 ${account.balance >= 0 ? 'text-brand-dark' : 'text-red-500'}`}>
          {account.balance >= 0 ? '' : '-'}${Math.abs(account.balance).toLocaleString('es-AR')}
        </p>
      </div>
    </div>
  )
}

// ─── Movements list ───────────────────────────────────────────────────────────

function MovementsList({ transactions, accounts }: { transactions: Transaction[]; accounts: Account[] }) {
  const accountMap = new Map(accounts.map(a => [a.id, a]))

  const grouped = transactions.reduce<Record<string, Transaction[]>>((acc, t) => {
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

  if (transactions.length === 0) {
    return <div className="text-center py-10"><p className="text-brand-muted text-sm font-mono">Sin movimientos este mes</p></div>
  }

  return (
    <div className="flex flex-col gap-4">
      {sortedDates.map(date => (
        <div key={date}>
          <p className="text-brand-muted text-[10px] font-mono uppercase tracking-wider mb-2 capitalize">{formatDate(date)}</p>
          <div className="flex flex-col gap-2">
            {grouped[date].map(t => (
              <TransactionItem key={t.id} transaction={t} account={t.account_id ? accountMap.get(t.account_id) : undefined} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function TransactionItem({ transaction: t, account }: { transaction: Transaction; account?: Account }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleDelete() {
    if (!confirm('¿Eliminar esta transacción?')) return
    startTransition(async () => {
      await deleteTransaction(t.id)
      router.refresh()
    })
  }

  const color = CATEGORY_COLORS[t.category] ?? '#C4A882'
  const isIncome = t.type === 'income'

  return (
    <div className={`bg-white rounded-xl border border-gray-100 flex items-center gap-3 px-4 py-3 transition-opacity ${isPending ? 'opacity-50' : ''}`}>
      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color + '20' }}>
        {isIncome ? <TrendingUp size={15} style={{ color }} /> : <TrendingDown size={15} style={{ color }} />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-brand-text text-xs font-bold font-mono truncate">{t.description || t.category}</p>
        <div className="flex items-center gap-1.5">
          <p className="text-brand-muted text-[10px] font-mono">{t.category}</p>
          {account && (
            <>
              <span className="text-brand-border text-[10px]">·</span>
              <span className="text-[10px] font-mono" style={{ color: account.color }}>{account.name}</span>
            </>
          )}
        </div>
      </div>
      <p className={`text-sm font-bold font-mono flex-shrink-0 ${isIncome ? 'text-green-600' : 'text-red-500'}`}>
        {isIncome ? '+' : '-'}${Number(t.amount).toLocaleString('es-AR')}
      </p>
      <div className="flex items-center gap-0.5 flex-shrink-0">
        <Link href={`/finance/${t.id}/edit`} className="text-gray-300 hover:text-brand-muted transition-colors p-1">
          <Pencil size={12} />
        </Link>
        <button onClick={handleDelete} disabled={isPending} className="text-gray-300 hover:text-red-400 transition-colors p-1 disabled:opacity-50">
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  )
}

// ─── Breakdown ────────────────────────────────────────────────────────────────

function Breakdown({ transactions, type, total }: { transactions: Transaction[]; type: 'income' | 'expense'; total: number }) {
  const categoryTotals: Record<string, number> = {}
  for (const t of transactions) {
    categoryTotals[t.category] = (categoryTotals[t.category] ?? 0) + Number(t.amount)
  }
  const sorted = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])

  if (sorted.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-brand-muted text-sm font-mono">
          {type === 'expense' ? 'Sin gastos este mes' : 'Sin ingresos este mes'}
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="px-4 pt-4 pb-1">
        <p className="text-[10px] font-mono text-brand-muted uppercase tracking-wide">
          {type === 'expense' ? 'Gastos por categoría' : 'Ingresos por categoría'}
        </p>
      </div>
      <div className="px-4 pb-4 mt-3 space-y-3">
        {sorted.map(([cat, amount]) => {
          const color = CATEGORY_COLORS[cat] ?? '#C4A882'
          const pct = total > 0 ? (amount / total) * 100 : 0
          return (
            <div key={cat}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                  <span className="text-xs font-mono text-brand-text">{cat}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold font-mono text-brand-dark">
                    ${amount.toLocaleString('es-AR')}
                  </span>
                  <span className="text-[10px] font-mono text-brand-muted ml-1.5">{pct.toFixed(0)}%</span>
                </div>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${pct}%`, backgroundColor: color }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
