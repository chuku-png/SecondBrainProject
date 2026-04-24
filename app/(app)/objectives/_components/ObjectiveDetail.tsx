'use client'

import { useState, useOptimistic, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2, Archive, Plus, X, Briefcase, FolderOpen, Heart, DollarSign, Dumbbell } from 'lucide-react'
import { deleteObjective, updateObjective, createLink, deleteLink } from '@/app/_actions/objectives'
import MilestoneCard from './MilestoneCard'
import MilestoneForm from './MilestoneForm'

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

interface Link {
  id: string
  entity_type: string
  entity_id: string | null
  entity_label: string
  entity_filter: Record<string, string> | null
}

interface Habit   { id: string; name: string; color: string }
interface Project { id: string; name: string; color: string }

const ENTITY_TYPES = [
  { key: 'workouts',     label: 'Gym',       icon: Dumbbell   },
  { key: 'habit',        label: 'Hábito',    icon: Heart      },
  { key: 'project',      label: 'Proyecto',  icon: FolderOpen },
  { key: 'transactions', label: 'Finanzas',  icon: DollarSign },
  { key: 'work_items',   label: 'Trabajo',   icon: Briefcase  },
]

const ENTITY_EMOJIS: Record<string, string> = {
  workouts:     '🏃',
  habit:        '✅',
  project:      '📁',
  transactions: '💰',
  work_items:   '💼',
}

function LinkBadge({ link, onDelete }: { link: Link; onDelete: () => void }) {
  const [isPending, startTransition] = useTransition()
  const emoji = ENTITY_EMOJIS[link.entity_type] ?? '🔗'

  return (
    <div className={`flex items-center gap-2 bg-white rounded-xl border border-gray-100 px-3 py-2.5 transition-opacity ${isPending ? 'opacity-50' : ''}`}>
      <span className="text-base">{emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold font-mono text-brand-text truncate">{link.entity_label}</p>
        {link.entity_filter && Object.keys(link.entity_filter).length > 0 && (
          <p className="text-[10px] font-mono text-brand-muted truncate">
            {Object.entries(link.entity_filter).map(([k, v]) => `${k}: ${v}`).join(', ')}
          </p>
        )}
      </div>
      <button
        disabled={isPending}
        onClick={() => startTransition(async () => { await deleteLink(link.id); onDelete() })}
        className="text-gray-300 hover:text-red-400 transition-colors p-1 flex-shrink-0"
      >
        <X size={12} />
      </button>
    </div>
  )
}

export default function ObjectiveDetail({
  objective,
  initialMilestones,
  initialLinks,
  habits,
  projects,
}: {
  objective: { id: string; title: string; color: string; progress_manual: number }
  initialMilestones: Milestone[]
  initialLinks: Link[]
  habits: Habit[]
  projects: Project[]
}) {
  const router = useRouter()
  const [tab, setTab] = useState<'hitos' | 'vinculos'>('hitos')
  const [showMilestoneForm, setShowMilestoneForm] = useState(false)
  const [showLinkForm, setShowLinkForm] = useState(false)
  const [isPending, startTransition] = useTransition()

  const [optimisticMilestones, addOptimisticMilestone] = useOptimistic(
    initialMilestones,
    (cur: Milestone[], m: Milestone) => [...cur, m]
  )
  const [optimisticLinks, updateOptimisticLinks] = useOptimistic(
    initialLinks,
    (cur: Link[], action: { type: 'add'; link: Link } | { type: 'remove'; id: string }) =>
      action.type === 'add'
        ? [...cur, action.link]
        : cur.filter(l => l.id !== action.id)
  )

  // Link form state
  const [linkType, setLinkType]   = useState('workouts')
  const [linkLabel, setLinkLabel] = useState('')
  const [linkError, setLinkError] = useState('')

  function handleArchive() {
    startTransition(async () => {
      await updateObjective(objective.id, {
        title: objective.title, description: '', target_date: null,
        color: objective.color, status: 'archived',
      })
      router.push('/objectives')
    })
  }

  function handleDelete() {
    if (!confirm(`¿Eliminar "${objective.title}"? Esta acción no se puede deshacer.`)) return
    startTransition(async () => {
      await deleteObjective(objective.id)
      router.push('/objectives')
    })
  }

  async function handleAddLink(e: React.FormEvent) {
    e.preventDefault()
    setLinkError('')
    if (!linkLabel.trim()) { setLinkError('El nombre es requerido'); return }

    startTransition(async () => {
      const result = await createLink({
        objective_id: objective.id,
        entity_type: linkType,
        entity_label: linkLabel,
      })
      if (result.error) { setLinkError(result.error); return }
      if (result.data) updateOptimisticLinks({ type: 'add', link: result.data as Link })
      setLinkLabel('')
      setShowLinkForm(false)
    })
  }

  const progress = optimisticMilestones.length > 0
    ? Math.round(optimisticMilestones.filter(m => m.status === 'done').length / optimisticMilestones.length * 100)
    : objective.progress_manual

  const doneMilestones = optimisticMilestones.filter(m => m.status === 'done').length

  return (
    <div className={`transition-opacity ${isPending ? 'opacity-60' : ''}`}>
      {/* Barra de progreso grande */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono text-brand-muted uppercase tracking-wide">
            {optimisticMilestones.length > 0
              ? `${doneMilestones} de ${optimisticMilestones.length} hitos completados`
              : 'Sin hitos — progreso manual'}
          </span>
          <span className="text-sm font-bold font-mono" style={{ color: objective.color }}>{progress}%</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${progress}%`, backgroundColor: objective.color }}
          />
        </div>
      </div>

      {/* Acciones */}
      <div className="flex gap-2 mb-5 flex-wrap">
        <button
          onClick={() => router.push(`/objectives/${objective.id}/edit`)}
          className="flex items-center gap-1.5 h-11 px-3 rounded-xl bg-white border border-gray-100 text-brand-muted hover:text-brand-text text-xs font-mono font-bold transition-colors"
        >
          <Pencil size={12} /> Editar
        </button>
        <button
          onClick={handleArchive}
          disabled={isPending}
          className="flex items-center gap-1.5 h-11 px-3 rounded-xl bg-white border border-gray-100 text-brand-muted hover:text-orange-400 text-xs font-mono font-bold transition-colors disabled:opacity-50"
        >
          <Archive size={12} /> Archivar
        </button>
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="flex items-center gap-1.5 h-11 px-3 rounded-xl bg-white border border-gray-100 text-brand-muted hover:text-red-400 text-xs font-mono font-bold transition-colors disabled:opacity-50"
        >
          <Trash2 size={12} /> Eliminar
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 mb-4">
        {([['hitos', 'Hitos'], ['vinculos', 'Vínculos']] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-3 py-2 rounded-xl text-xs font-mono font-bold transition-colors ${
              tab === key ? 'bg-brand-dark text-white' : 'bg-white border border-gray-100 text-brand-muted hover:text-brand-text'
            }`}
          >
            {label} {key === 'hitos' ? `(${optimisticMilestones.length})` : `(${optimisticLinks.length})`}
          </button>
        ))}
      </div>

      {/* Tab: Hitos */}
      {tab === 'hitos' && (
        <div className="flex flex-col gap-3">
          {optimisticMilestones.length === 0 && !showMilestoneForm && (
            <div className="text-center py-10 bg-white rounded-2xl border border-gray-100">
              <p className="text-3xl mb-2">🎯</p>
              <p className="text-brand-text font-bold font-mono text-sm">Sin hitos</p>
              <p className="text-brand-muted text-xs font-mono mt-1">Dividí tu objetivo en períodos medibles</p>
            </div>
          )}

          {optimisticMilestones.map(m => (
            <MilestoneCard key={m.id} milestone={m} objectiveColor={objective.color} />
          ))}

          {showMilestoneForm ? (
            <MilestoneForm
              objectiveId={objective.id}
              habits={habits}
              projects={projects}
              onAdd={m => { addOptimisticMilestone(m); setShowMilestoneForm(false) }}
              onCancel={() => setShowMilestoneForm(false)}
            />
          ) : (
            <button
              onClick={() => setShowMilestoneForm(true)}
              className="flex items-center justify-center gap-2 h-11 bg-white border border-dashed border-brand-border rounded-2xl text-brand-muted hover:text-brand-text hover:border-brand-dark text-sm font-mono font-bold transition-colors"
            >
              <Plus size={15} /> Agregar hito
            </button>
          )}
        </div>
      )}

      {/* Tab: Vínculos */}
      {tab === 'vinculos' && (
        <div className="flex flex-col gap-3">
          {optimisticLinks.length === 0 && !showLinkForm && (
            <div className="text-center py-10 bg-white rounded-2xl border border-gray-100">
              <p className="text-3xl mb-2">🔗</p>
              <p className="text-brand-text font-bold font-mono text-sm">Sin vínculos</p>
              <p className="text-brand-muted text-xs font-mono mt-1">Conectá este objetivo con otros módulos</p>
            </div>
          )}

          {optimisticLinks.map(l => (
            <LinkBadge
              key={l.id}
              link={l}
              onDelete={() => updateOptimisticLinks({ type: 'remove', id: l.id })}
            />
          ))}

          {showLinkForm ? (
            <form onSubmit={handleAddLink} className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold font-mono text-brand-text">Nuevo vínculo</p>
                <button type="button" onClick={() => setShowLinkForm(false)} className="text-brand-muted hover:text-brand-text transition">
                  <X size={16} />
                </button>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {ENTITY_TYPES.map(({ key, label }) => (
                  <button key={key} type="button" onClick={() => setLinkType(key)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors ${
                      linkType === key ? 'bg-brand-dark text-white' : 'bg-gray-100 text-brand-muted hover:text-brand-text'
                    }`}>
                    {ENTITY_EMOJIS[key]} {label}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={linkLabel}
                onChange={e => setLinkLabel(e.target.value)}
                placeholder="Nombre descriptivo..."
                className="h-10 px-3 rounded-xl bg-brand-bg border border-brand-border text-brand-text text-sm font-mono focus:outline-none focus:border-brand-dark transition"
              />
              {linkError && <p className="text-red-500 text-xs font-mono">{linkError}</p>}
              <button type="submit" disabled={isPending}
                className="h-10 bg-brand-dark hover:opacity-90 disabled:opacity-50 text-white font-bold rounded-xl text-sm font-mono transition">
                {isPending ? 'Guardando...' : 'Agregar'}
              </button>
            </form>
          ) : (
            <button
              onClick={() => setShowLinkForm(true)}
              className="flex items-center justify-center gap-2 h-11 bg-white border border-dashed border-brand-border rounded-2xl text-brand-muted hover:text-brand-text hover:border-brand-dark text-sm font-mono font-bold transition-colors"
            >
              <Plus size={15} /> Agregar vínculo
            </button>
          )}
        </div>
      )}
    </div>
  )
}
