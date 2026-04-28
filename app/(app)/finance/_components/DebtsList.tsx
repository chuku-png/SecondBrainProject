'use client'

import { useState, useOptimistic, useTransition } from 'react'
import { Plus, Trash2, Pencil, RefreshCw, CalendarClock } from 'lucide-react'
import Modal from '@/app/(app)/_components/Modal'
import { createDebt, updateDebt, deleteDebt, toggleDebtPaid, type Debt } from '@/app/_actions/debts'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function debtStatus(debt: Debt): 'paid' | 'overdue' | 'soon' | 'upcoming' {
  if (debt.paid) return 'paid'
  if (!debt.due_date) return 'upcoming'
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(debt.due_date + 'T00:00:00')
  const diff = Math.ceil((due.getTime() - today.getTime()) / 86400000)
  if (diff < 0)  return 'overdue'
  if (diff <= 7) return 'soon'
  return 'upcoming'
}

const STATUS_STYLES = {
  paid:     { bar: '#d1d5db', badge: 'bg-gray-100 text-gray-400',  label: 'Pagada' },
  overdue:  { bar: '#ef4444', badge: 'bg-red-50 text-red-500',     label: 'Vencida' },
  soon:     { bar: '#f97316', badge: 'bg-orange-50 text-orange-500', label: 'Próxima' },
  upcoming: { bar: '#6366f1', badge: 'bg-indigo-50 text-indigo-500', label: '' },
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
}

// ─── Form ─────────────────────────────────────────────────────────────────────

function DebtForm({
  initial,
  onSuccess,
}: {
  initial?: Debt
  onSuccess: () => void
}) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    name:      initial?.name      ?? '',
    amount:    initial?.amount    ? String(initial.amount) : '',
    due_date:  initial?.due_date  ?? '',
    recurring: initial?.recurring ?? false,
    notes:     initial?.notes     ?? '',
  })

  function set<K extends keyof typeof form>(k: K, v: typeof form[K]) {
    setForm(f => ({ ...f, [k]: v }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const payload = {
      name:      form.name,
      amount:    parseFloat(form.amount),
      due_date:  form.due_date || null,
      recurring: form.recurring,
      notes:     form.notes || null,
    }
    startTransition(async () => {
      const result = initial
        ? await updateDebt(initial.id, payload)
        : await createDebt(payload)
      if ('error' in result && result.error) {
        setError(result.error)
      } else {
        onSuccess()
      }
    })
  }

  const inputCls = 'w-full h-11 px-3 rounded-xl border border-gray-200 text-brand-text text-sm font-mono focus:outline-none focus:border-brand-dark transition placeholder-brand-border bg-white'
  const labelCls = 'block text-[10px] font-mono text-brand-muted uppercase tracking-wide mb-1'

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pb-6">
      <div>
        <label className={labelCls}>Nombre *</label>
        <input
          className={inputCls}
          placeholder="Spotify, Netflix, Rubi..."
          value={form.name}
          onChange={e => set('name', e.target.value)}
          required
        />
      </div>

      <div>
        <label className={labelCls}>Monto *</label>
        <input
          className={inputCls}
          type="number"
          min="0.01"
          step="0.01"
          placeholder="0.00"
          value={form.amount}
          onChange={e => set('amount', e.target.value)}
          required
        />
      </div>

      <div>
        <label className={labelCls}>Fecha de vencimiento</label>
        <input
          className={inputCls}
          type="date"
          value={form.due_date}
          onChange={e => set('due_date', e.target.value)}
        />
      </div>

      <div>
        <label className={labelCls}>Notas</label>
        <input
          className={inputCls}
          placeholder="Detalles adicionales..."
          value={form.notes}
          onChange={e => set('notes', e.target.value)}
        />
      </div>

      <label className="flex items-center gap-3 cursor-pointer select-none">
        <div
          onClick={() => set('recurring', !form.recurring)}
          className={`w-11 h-6 rounded-full transition-colors flex items-center ${
            form.recurring ? 'bg-indigo-500' : 'bg-gray-200'
          }`}
        >
          <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform mx-0.5 ${
            form.recurring ? 'translate-x-5' : 'translate-x-0'
          }`} />
        </div>
        <span className="text-sm font-mono text-brand-text">Pago recurrente</span>
      </label>

      {error && (
        <p className="text-red-500 text-xs font-mono">{error}</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full h-11 bg-brand-dark text-white rounded-xl text-sm font-bold font-mono disabled:opacity-50 transition-opacity"
      >
        {isPending ? 'Guardando...' : initial ? 'Guardar cambios' : 'Agregar deuda'}
      </button>
    </form>
  )
}

// ─── Debt card ─────────────────────────────────────────────────────────────────

function DebtCard({
  debt,
  onEdit,
}: {
  debt: Debt
  onEdit: (debt: Debt) => void
}) {
  const [isPending, startTransition] = useTransition()
  const [optimisticPaid, setOptimisticPaid] = useOptimistic(debt.paid)

  const status = debtStatus({ ...debt, paid: optimisticPaid })
  const styles = STATUS_STYLES[status]

  function handleToggle() {
    startTransition(async () => {
      setOptimisticPaid(!optimisticPaid)
      await toggleDebtPaid(debt.id, !debt.paid)
    })
  }

  function handleDelete() {
    if (!confirm(`¿Eliminar "${debt.name}"?`)) return
    startTransition(async () => { await deleteDebt(debt.id) })
  }

  return (
    <div className={`bg-white rounded-xl border border-gray-100 overflow-hidden flex transition-opacity ${isPending ? 'opacity-50' : ''}`}>
      <div className="w-1 flex-shrink-0" style={{ backgroundColor: styles.bar }} />

      <div className="flex-1 flex items-start gap-3 px-3 py-3">
        {/* Checkbox */}
        <button
          onClick={handleToggle}
          disabled={isPending}
          aria-label={optimisticPaid ? 'Marcar como pendiente' : 'Marcar como pagada'}
          className="mt-0.5 flex-shrink-0"
        >
          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
            optimisticPaid
              ? 'bg-gray-300 border-gray-300'
              : status === 'overdue' ? 'border-red-400' : status === 'soon' ? 'border-orange-400' : 'border-indigo-400'
          }`}>
            {optimisticPaid && (
              <svg viewBox="0 0 16 16" className="w-3 h-3 text-white" fill="none">
                <path d="M3 8l3.5 3.5L13 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
        </button>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-bold font-mono leading-tight ${optimisticPaid ? 'line-through text-gray-300' : 'text-brand-text'}`}>
            {debt.name}
          </p>
          <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
            {debt.recurring && (
              <span className="inline-flex items-center gap-0.5 text-[9px] font-mono bg-indigo-50 text-indigo-400 px-1.5 py-0.5 rounded-full">
                <RefreshCw size={8} />
                Recurrente
              </span>
            )}
            {debt.due_date && (
              <span className={`inline-flex items-center gap-0.5 text-[9px] font-mono px-1.5 py-0.5 rounded-full ${styles.badge}`}>
                <CalendarClock size={8} />
                {formatDate(debt.due_date)}
                {styles.label ? ` · ${styles.label}` : ''}
              </span>
            )}
            {debt.notes && (
              <span className="text-[10px] font-mono text-brand-muted truncate max-w-[140px]">{debt.notes}</span>
            )}
          </div>
        </div>

        {/* Amount + actions */}
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <p className={`text-sm font-bold font-mono ${optimisticPaid ? 'text-gray-300 line-through' : 'text-brand-dark'}`}>
            ${Number(debt.amount).toLocaleString('es-AR')}
          </p>
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => onEdit(debt)}
              className="p-1 text-gray-300 hover:text-brand-muted transition-colors"
            >
              <Pencil size={11} />
            </button>
            <button
              onClick={handleDelete}
              disabled={isPending}
              className="p-1 text-gray-300 hover:text-red-400 transition-colors disabled:opacity-50"
            >
              <Trash2 size={11} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function DebtsList({ debts: initial }: { debts: Debt[] }) {
  const [debts]          = useState<Debt[]>(initial)
  const [modal, setModal] = useState<'new' | Debt | null>(null)

  const unpaid = debts.filter(d => !d.paid)
  const paid   = debts.filter(d => d.paid)
  const totalPending = unpaid.reduce((s, d) => s + Number(d.amount), 0)

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs font-mono text-brand-muted uppercase tracking-wide">Deudas y compromisos</p>
          {unpaid.length > 0 && (
            <p className="text-[10px] font-mono text-red-400 mt-0.5">
              {unpaid.length} pendiente{unpaid.length !== 1 ? 's' : ''} · ${totalPending.toLocaleString('es-AR')}
            </p>
          )}
        </div>
        <button
          onClick={() => setModal('new')}
          className="flex items-center gap-1.5 px-3 h-8 bg-brand-dark text-white rounded-xl text-xs font-bold font-mono hover:opacity-90 transition"
        >
          <Plus size={13} />
          Nueva
        </button>
      </div>

      {/* List */}
      {debts.length === 0 ? (
        <div
          onClick={() => setModal('new')}
          className="bg-white border border-dashed border-gray-200 rounded-2xl p-6 text-center cursor-pointer hover:border-brand-muted transition-colors"
        >
          <p className="text-brand-muted text-sm font-mono">Sin deudas registradas</p>
          <p className="text-[11px] font-mono text-brand-border mt-1">Tocá para agregar una</p>
        </div>
      ) : (
        <div className="space-y-2">
          {unpaid.map(d => (
            <DebtCard key={d.id} debt={d} onEdit={d => setModal(d)} />
          ))}
          {paid.length > 0 && (
            <>
              <p className="text-[10px] font-mono text-brand-muted uppercase tracking-wide pt-1">Pagadas</p>
              {paid.map(d => (
                <DebtCard key={d.id} debt={d} onEdit={d => setModal(d)} />
              ))}
            </>
          )}
        </div>
      )}

      {/* Modal */}
      {modal !== null && (
        <Modal
          title={modal === 'new' ? 'Nueva deuda' : 'Editar deuda'}
          onClose={() => setModal(null)}
        >
          <DebtForm
            initial={modal === 'new' ? undefined : modal}
            onSuccess={() => setModal(null)}
          />
        </Modal>
      )}
    </div>
  )
}
