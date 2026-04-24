'use client'

import { useState, useTransition, useOptimistic } from 'react'
import { Plus, X } from 'lucide-react'
import { createMilestone } from '@/app/_actions/objectives'

interface Habit   { id: string; name: string; color: string }
interface Project { id: string; name: string; color: string }

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

type SourceType = 'manual' | 'workouts' | 'habit_logs' | 'transactions' | 'project_tasks' | 'work_items'

const SOURCE_TABS: { key: SourceType; label: string }[] = [
  { key: 'manual',        label: 'Manual'    },
  { key: 'workouts',      label: 'Gym'       },
  { key: 'habit_logs',    label: 'Hábitos'   },
  { key: 'transactions',  label: 'Finanzas'  },
  { key: 'project_tasks', label: 'Proyecto'  },
  { key: 'work_items',    label: 'Trabajo'   },
]

const WORKOUT_SUBTYPES = ['running', 'cycling', 'swimming', 'walking', 'gym']

export default function MilestoneForm({
  objectiveId,
  habits,
  projects,
  onAdd,
  onCancel,
}: {
  objectiveId: string
  habits: Habit[]
  projects: Project[]
  onAdd: (m: Milestone) => void
  onCancel: () => void
}) {
  const [isPending, startTransition] = useTransition()
  const [title, setTitle]           = useState('')
  const [periodStart, setPeriodStart] = useState('')
  const [periodEnd, setPeriodEnd]   = useState('')
  const [targetValue, setTargetValue] = useState('')
  const [sourceType, setSourceType] = useState<SourceType>('manual')
  const [workoutSubtype, setWorkoutSubtype] = useState('any')
  const [workoutMetric, setWorkoutMetric] = useState<'sum_distance' | 'count_sessions'>('sum_distance')
  const [habitId, setHabitId]       = useState(habits[0]?.id ?? '')
  const [txType, setTxType]         = useState<'income' | 'expense' | 'saved'>('income')
  const [txCategory, setTxCategory] = useState('')
  const [projectId, setProjectId]   = useState(projects[0]?.id ?? '')
  const [error, setError]           = useState('')

  function getMetricFormula(): string {
    if (sourceType === 'manual')        return 'manual'
    if (sourceType === 'workouts')      return workoutMetric
    if (sourceType === 'habit_logs')    return 'count_completed'
    if (sourceType === 'transactions')  return txType === 'saved' ? 'sum_amount_saved' : txType === 'income' ? 'sum_amount_income' : 'sum_amount_expense'
    if (sourceType === 'project_tasks') return 'percent_done'
    if (sourceType === 'work_items')    return 'sum_hours'
    return 'manual'
  }

  function getEntityFilter(): Record<string, string> | null {
    if (sourceType === 'workouts' && workoutSubtype !== 'any') return { workout_subtype: workoutSubtype }
    if (sourceType === 'transactions' && txCategory) return { category: txCategory }
    return null
  }

  function getSourceId(): string | null {
    if (sourceType === 'habit_logs')    return habitId || null
    if (sourceType === 'project_tasks') return projectId || null
    return null
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!title.trim())      { setError('El título es requerido'); return }
    if (!periodStart)       { setError('La fecha de inicio es requerida'); return }
    if (!periodEnd)         { setError('La fecha de fin es requerida'); return }
    if (periodEnd < periodStart) { setError('La fecha fin debe ser posterior al inicio'); return }
    if (!targetValue || parseFloat(targetValue) <= 0) { setError('El valor objetivo debe ser mayor a 0'); return }

    startTransition(async () => {
      const result = await createMilestone({
        objective_id:   objectiveId,
        title,
        period_start:   periodStart,
        period_end:     periodEnd,
        target_value:   parseFloat(targetValue),
        source_type:    sourceType,
        source_id:      getSourceId(),
        metric_formula: getMetricFormula(),
        entity_filter:  getEntityFilter(),
      })

      if (result.error) { setError(result.error); return }
      if (result.data)  onAdd(result.data as Milestone)
    })
  }

  const inputCls = 'h-10 px-3 rounded-xl bg-brand-bg border border-brand-border text-brand-text text-sm font-mono focus:outline-none focus:border-brand-dark transition'

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold font-mono text-brand-text">Nuevo hito</p>
        <button type="button" onClick={onCancel} className="text-brand-muted hover:text-brand-text transition">
          <X size={16} />
        </button>
      </div>

      {/* Título */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-mono text-brand-muted uppercase tracking-wide">Título</label>
        <input type="text" value={title} onChange={e => setTitle(e.target.value)}
          placeholder="Ej: Correr 50km en mayo" className={inputCls} />
      </div>

      {/* Período */}
      <div className="flex gap-3">
        <div className="flex flex-col gap-1.5 flex-1">
          <label className="text-[10px] font-mono text-brand-muted uppercase tracking-wide">Inicio</label>
          <input type="date" value={periodStart} onChange={e => setPeriodStart(e.target.value)} className={inputCls} />
        </div>
        <div className="flex flex-col gap-1.5 flex-1">
          <label className="text-[10px] font-mono text-brand-muted uppercase tracking-wide">Fin</label>
          <input type="date" value={periodEnd} onChange={e => setPeriodEnd(e.target.value)} className={inputCls} />
        </div>
      </div>

      {/* Valor objetivo */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-mono text-brand-muted uppercase tracking-wide">Valor objetivo</label>
        <input type="number" value={targetValue} onChange={e => setTargetValue(e.target.value)}
          placeholder="Ej: 50" min="0" step="any" className={inputCls} />
      </div>

      {/* Source type */}
      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-mono text-brand-muted uppercase tracking-wide">Fuente de datos</label>
        <div className="flex gap-1.5 flex-wrap">
          {SOURCE_TABS.map(s => (
            <button key={s.key} type="button" onClick={() => setSourceType(s.key)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors ${
                sourceType === s.key ? 'bg-brand-dark text-white' : 'bg-gray-100 text-brand-muted hover:text-brand-text'
              }`}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Opciones por source_type */}
      {sourceType === 'workouts' && (
        <div className="flex flex-col gap-3 pl-2 border-l-2 border-brand-border/30">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono text-brand-muted uppercase tracking-wide">Tipo</label>
            <select value={workoutSubtype} onChange={e => setWorkoutSubtype(e.target.value)}
              className={inputCls}>
              <option value="any">Cualquiera</option>
              {WORKOUT_SUBTYPES.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            {([['sum_distance', 'Km totales'], ['count_sessions', 'Cant. sesiones']] as const).map(([val, label]) => (
              <button key={val} type="button" onClick={() => setWorkoutMetric(val)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors ${
                  workoutMetric === val ? 'bg-brand-dark text-white' : 'bg-gray-100 text-brand-muted'
                }`}>
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {sourceType === 'habit_logs' && (
        <div className="flex flex-col gap-1.5 pl-2 border-l-2 border-brand-border/30">
          <label className="text-[10px] font-mono text-brand-muted uppercase tracking-wide">Hábito</label>
          {habits.length === 0
            ? <p className="text-xs font-mono text-brand-muted">No tenés hábitos creados</p>
            : <select value={habitId} onChange={e => setHabitId(e.target.value)} className={inputCls}>
                {habits.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
              </select>
          }
        </div>
      )}

      {sourceType === 'transactions' && (
        <div className="flex flex-col gap-3 pl-2 border-l-2 border-brand-border/30">
          <div className="flex gap-2">
            {([['income', 'Ingresos'], ['expense', 'Gastos'], ['saved', 'Ahorro']] as const).map(([val, label]) => (
              <button key={val} type="button" onClick={() => setTxType(val)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors ${
                  txType === val ? 'bg-brand-dark text-white' : 'bg-gray-100 text-brand-muted'
                }`}>
                {label}
              </button>
            ))}
          </div>
          <input type="text" value={txCategory} onChange={e => setTxCategory(e.target.value)}
            placeholder="Categoría (opcional)" className={inputCls} />
        </div>
      )}

      {sourceType === 'project_tasks' && (
        <div className="flex flex-col gap-1.5 pl-2 border-l-2 border-brand-border/30">
          <label className="text-[10px] font-mono text-brand-muted uppercase tracking-wide">Proyecto</label>
          {projects.length === 0
            ? <p className="text-xs font-mono text-brand-muted">No tenés proyectos activos</p>
            : <select value={projectId} onChange={e => setProjectId(e.target.value)} className={inputCls}>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
          }
          <p className="text-[10px] font-mono text-brand-muted">Calcula % de tareas completadas en el proyecto</p>
        </div>
      )}

      {sourceType === 'work_items' && (
        <p className="text-[10px] font-mono text-brand-muted pl-2 border-l-2 border-brand-border/30">
          Suma las horas registradas como completadas en el período
        </p>
      )}

      {sourceType === 'manual' && (
        <p className="text-[10px] font-mono text-brand-muted pl-2 border-l-2 border-brand-border/30">
          Actualizás el valor manualmente desde la card del hito
        </p>
      )}

      {error && <p className="text-red-500 text-xs font-mono">{error}</p>}

      <button type="submit" disabled={isPending}
        className="h-11 bg-brand-dark hover:opacity-90 disabled:opacity-50 text-white font-bold rounded-xl text-sm font-mono transition flex items-center justify-center gap-2">
        <Plus size={15} />
        {isPending ? 'Creando...' : 'Agregar hito'}
      </button>
    </form>
  )
}
