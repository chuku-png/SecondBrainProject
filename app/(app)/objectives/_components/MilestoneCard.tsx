'use client'

import { useState, useTransition } from 'react'
import { Trash2, RefreshCw, CheckCircle2, XCircle, Clock } from 'lucide-react'
import { deleteMilestone, recalculateMilestone, updateMilestoneValue } from '@/app/_actions/objectives'

interface Milestone {
  id: string
  objective_id: string
  title: string
  period_start: string
  period_end: string
  target_value: number
  current_value: number
  source_type: string
  metric_formula: string
  status: string
}

const STATUS_CONFIG = {
  done:    { label: 'Completado', icon: CheckCircle2, color: 'text-green-500',  border: 'border-green-200', bg: 'bg-green-50' },
  failed:  { label: 'Fallido',    icon: XCircle,      color: 'text-red-400',    border: 'border-red-200',   bg: 'bg-red-50'   },
  pending: { label: 'En curso',   icon: Clock,        color: 'text-brand-muted',border: 'border-gray-100',  bg: 'bg-white'    },
}

function formatPeriod(start: string, end: string) {
  const fmt = (d: string) => new Date(d + 'T12:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
  return `${fmt(start)} → ${fmt(end)}`
}

function formatValue(value: number, formula: string) {
  if (formula === 'sum_distance')      return `${value.toFixed(1)} km`
  if (formula === 'sum_amount_income'  ||
      formula === 'sum_amount_expense' ||
      formula === 'sum_amount_saved')  return `$${value.toLocaleString('es-AR')}`
  if (formula === 'sum_hours')         return `${value.toFixed(1)}h`
  if (formula === 'percent_done')      return `${Math.round(value)}%`
  return String(Math.round(value))
}

export default function MilestoneCard({ milestone, objectiveColor }: { milestone: Milestone; objectiveColor: string }) {
  const [isPending, startTransition] = useTransition()
  const [localValue, setLocalValue]   = useState(milestone.current_value)
  const [localStatus, setLocalStatus] = useState(milestone.status)
  const [manualInput, setManualInput] = useState(String(milestone.current_value))
  const [error, setError] = useState('')

  const cfg = STATUS_CONFIG[localStatus as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pending
  const StatusIcon = cfg.icon
  const pct = milestone.target_value > 0
    ? Math.min(100, Math.round((localValue / milestone.target_value) * 100))
    : 0

  function handleDelete() {
    if (!confirm(`¿Eliminar "${milestone.title}"?`)) return
    startTransition(async () => { await deleteMilestone(milestone.id) })
  }

  function handleRecalculate() {
    setError('')
    startTransition(async () => {
      const result = await recalculateMilestone(milestone.id)
      if (result.error) { setError(result.error); return }
      if ('currentValue' in result && result.currentValue !== undefined) {
        setLocalValue(result.currentValue)
        setManualInput(String(result.currentValue))
      }
      if ('status' in result && result.status) setLocalStatus(result.status)
    })
  }

  function handleManualSave() {
    const val = parseFloat(manualInput) || 0
    startTransition(async () => {
      const result = await updateMilestoneValue(milestone.id, val)
      if (result.error) { setError(result.error); return }
      setLocalValue(val)
      const today = new Date().toISOString().split('T')[0]
      setLocalStatus(
        val >= milestone.target_value ? 'done' :
        milestone.period_end < today  ? 'failed' :
        'pending'
      )
    })
  }

  return (
    <div className={`rounded-2xl border ${cfg.border} ${cfg.bg} p-4 transition-opacity ${isPending ? 'opacity-60' : ''}`}>
      <div className="flex items-start gap-3">
        <StatusIcon size={15} className={`flex-shrink-0 mt-0.5 ${cfg.color}`} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold font-mono text-brand-text leading-snug">{milestone.title}</p>
          <p className="text-[10px] font-mono text-brand-muted mt-0.5">{formatPeriod(milestone.period_start, milestone.period_end)}</p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {milestone.source_type !== 'manual' && (
            <button
              onClick={handleRecalculate}
              disabled={isPending}
              title="Recalcular"
              className="text-gray-300 hover:text-brand-muted transition-colors p-1 disabled:opacity-50"
            >
              <RefreshCw size={12} className={isPending ? 'animate-spin' : ''} />
            </button>
          )}
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="text-gray-300 hover:text-red-400 transition-colors p-1 disabled:opacity-50"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Barra de progreso */}
      <div className="mt-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-mono text-brand-muted">
            {formatValue(localValue, milestone.metric_formula)} / {formatValue(milestone.target_value, milestone.metric_formula)}
          </span>
          <span className="text-[10px] font-mono font-bold" style={{ color: objectiveColor }}>{pct}%</span>
        </div>
        <div className="h-1.5 bg-white/60 rounded-full overflow-hidden border border-white/40">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, backgroundColor: localStatus === 'done' ? '#22c55e' : localStatus === 'failed' ? '#f87171' : objectiveColor }}
          />
        </div>
      </div>

      {/* Input manual */}
      {milestone.source_type === 'manual' && (
        <div className="mt-3 flex items-center gap-2">
          <input
            type="number"
            value={manualInput}
            onChange={e => setManualInput(e.target.value)}
            className="flex-1 h-8 px-3 rounded-lg bg-white border border-brand-border text-brand-text text-xs font-mono focus:outline-none focus:border-brand-dark transition"
            step="any"
            min="0"
          />
          <button
            onClick={handleManualSave}
            disabled={isPending}
            className="h-8 px-3 rounded-lg bg-brand-dark text-white text-xs font-mono font-bold hover:opacity-90 disabled:opacity-50 transition"
          >
            Guardar
          </button>
        </div>
      )}

      {/* Badge status */}
      <div className="mt-2 flex items-center justify-between">
        <span className={`text-[9px] font-mono uppercase tracking-wide ${cfg.color}`}>{cfg.label}</span>
        {error && <p className="text-red-500 text-[10px] font-mono">{error}</p>}
      </div>
    </div>
  )
}
