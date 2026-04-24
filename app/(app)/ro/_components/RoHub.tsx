'use client'

import { useState, useTransition, useOptimistic } from 'react'
import { Plus, Gift, Heart, MapPin, FileText, CalendarDays, Utensils } from 'lucide-react'
import { createRoItem } from '@/app/_actions/ro'
import RoDateCard from './RoDateCard'
import RoItemCard from './RoItemCard'

interface RoDate {
  id: string
  title: string
  date: string
  type: string
  notes: string | null
  recurring: boolean
  daysUntil: number
  nextDate: string
}

interface RoItem {
  id: string
  type: string
  title: string
  notes: string | null
  done: boolean
  place_type: string | null
  created_at: string
}

type Tab = 'fechas' | 'gift' | 'date_idea' | 'place' | 'note'

const TABS: { key: Tab; label: string; icon: React.ReactNode; type?: string }[] = [
  { key: 'fechas',    label: 'Fechas',   icon: <CalendarDays size={13} /> },
  { key: 'gift',      label: 'Regalos',  icon: <Gift size={13} /> },
  { key: 'date_idea', label: 'Citas',    icon: <Heart size={13} /> },
  { key: 'place',     label: 'Lugares',  icon: <MapPin size={13} /> },
  { key: 'note',      label: 'Notas',    icon: <FileText size={13} /> },
]

// ─── Add form ────────────────────────────────────────────────────────────────

function AddItemForm({
  type,
  onAdd,
}: {
  type: 'gift' | 'date_idea' | 'place' | 'note'
  onAdd: (item: RoItem) => void
}) {
  const [isPending, startTransition] = useTransition()
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const [placeType, setPlaceType] = useState<'restaurant' | 'visit'>('restaurant')
  const [showNotes, setShowNotes] = useState(false)
  const [error, setError] = useState('')

  const placeholder =
    type === 'gift'      ? 'Idea de regalo...' :
    type === 'date_idea' ? 'Idea de cita...' :
    type === 'place'     ? 'Nombre del lugar...' :
    'Anotación...'

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setError('')

    startTransition(async () => {
      const result = await createRoItem({
        type,
        title,
        notes: notes || undefined,
        place_type: type === 'place' ? placeType : null,
      })

      if (result.error) { setError(result.error); return }
      if (result.data) onAdd(result.data as RoItem)
      setTitle('')
      setNotes('')
      setShowNotes(false)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 pt-3 border-t border-gray-100">
      {type === 'place' && (
        <div className="flex gap-2">
          {(['restaurant', 'visit'] as const).map(pt => (
            <button
              key={pt}
              type="button"
              onClick={() => setPlaceType(pt)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors ${
                placeType === pt
                  ? 'bg-brand-dark text-white'
                  : 'bg-gray-100 text-brand-muted hover:text-brand-text'
              }`}
            >
              {pt === 'restaurant' ? <Utensils size={11} /> : <MapPin size={11} />}
              {pt === 'restaurant' ? 'Restaurante' : 'Visitar'}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        {type === 'note' ? (
          <textarea
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder={placeholder}
            rows={2}
            className="flex-1 px-3 py-2.5 rounded-xl bg-brand-bg border border-brand-border text-brand-text placeholder-brand-border text-sm font-mono focus:outline-none focus:border-brand-dark transition resize-none"
          />
        ) : (
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder={placeholder}
            className="flex-1 h-10 px-3 rounded-xl bg-brand-bg border border-brand-border text-brand-text placeholder-brand-border text-sm font-mono focus:outline-none focus:border-brand-dark transition"
          />
        )}
        {type !== 'note' && (
          <button
            type="button"
            onClick={() => setShowNotes(v => !v)}
            className={`h-10 px-2.5 rounded-xl border text-xs font-mono transition ${
              showNotes ? 'bg-brand-dark text-white border-brand-dark' : 'border-brand-border text-brand-muted'
            }`}
          >
            + nota
          </button>
        )}
        <button
          type="submit"
          disabled={isPending || !title.trim()}
          className="h-10 w-10 rounded-xl bg-brand-dark hover:opacity-90 disabled:opacity-40 text-white flex items-center justify-center transition flex-shrink-0"
        >
          <Plus size={16} />
        </button>
      </div>

      {showNotes && type !== 'note' && (
        <input
          type="text"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Nota adicional..."
          className="h-9 px-3 rounded-xl bg-brand-bg border border-brand-border text-brand-text placeholder-brand-border text-xs font-mono focus:outline-none focus:border-brand-dark transition"
        />
      )}

      {error && <p className="text-red-500 text-xs font-mono">{error}</p>}
    </form>
  )
}

// ─── Item section ─────────────────────────────────────────────────────────────

function ItemSection({
  type,
  initialItems,
}: {
  type: 'gift' | 'date_idea' | 'place' | 'note'
  initialItems: RoItem[]
}) {
  const [optimisticItems, addOptimistic] = useOptimistic(
    initialItems,
    (current: RoItem[], newItem: RoItem) => [newItem, ...current]
  )

  const pending = optimisticItems.filter(i => !i.done)
  const done    = optimisticItems.filter(i => i.done)

  const emptyLabel =
    type === 'gift'      ? 'Sin ideas de regalos' :
    type === 'date_idea' ? 'Sin ideas de citas' :
    type === 'place'     ? 'Sin lugares guardados' :
    'Sin anotaciones'

  return (
    <div className="flex flex-col gap-2">
      {pending.length === 0 && done.length === 0 && (
        <p className="text-brand-muted text-sm font-mono text-center py-6">{emptyLabel}</p>
      )}

      {pending.map(item => <RoItemCard key={item.id} item={item} />)}

      {done.length > 0 && (
        <div className="flex flex-col gap-2 opacity-50 mt-1">
          {done.map(item => <RoItemCard key={item.id} item={item} />)}
        </div>
      )}

      <AddItemForm type={type} onAdd={item => addOptimistic(item)} />
    </div>
  )
}

// ─── RoHub ────────────────────────────────────────────────────────────────────

export default function RoHub({
  dates,
  items,
}: {
  dates: RoDate[]
  items: RoItem[]
}) {
  const [activeTab, setActiveTab] = useState<Tab>('fechas')

  const todayEvents = dates.filter(d => d.daysUntil === 0)
  const upcoming    = dates.filter(d => d.daysUntil > 0)

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 mb-4 -mx-1 px-1">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-colors flex-shrink-0 ${
              activeTab === tab.key
                ? 'bg-brand-dark text-white'
                : 'bg-white border border-gray-100 text-brand-muted hover:text-brand-text'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'fechas' && (
        <div className="flex flex-col gap-2.5">
          {dates.length === 0 ? (
            <p className="text-brand-muted text-sm font-mono text-center py-6">Sin fechas guardadas</p>
          ) : (
            <>
              {todayEvents.length > 0 && (
                <div>
                  <p className="text-brand-muted text-xs font-mono px-1 mb-2 uppercase tracking-wide">Hoy 🎉</p>
                  <div className="flex flex-col gap-2.5">
                    {todayEvents.map(d => <RoDateCard key={d.id} item={d} daysUntil={d.daysUntil} nextDate={d.nextDate} />)}
                  </div>
                </div>
              )}
              {upcoming.length > 0 && (
                <div>
                  {todayEvents.length > 0 && <p className="text-brand-muted text-xs font-mono px-1 mb-2 uppercase tracking-wide mt-2">Próximas</p>}
                  <div className="flex flex-col gap-2.5">
                    {upcoming.map(d => <RoDateCard key={d.id} item={d} daysUntil={d.daysUntil} nextDate={d.nextDate} />)}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {activeTab === 'gift' && (
        <ItemSection type="gift" initialItems={items.filter(i => i.type === 'gift')} />
      )}
      {activeTab === 'date_idea' && (
        <ItemSection type="date_idea" initialItems={items.filter(i => i.type === 'date_idea')} />
      )}
      {activeTab === 'place' && (
        <ItemSection type="place" initialItems={items.filter(i => i.type === 'place')} />
      )}
      {activeTab === 'note' && (
        <ItemSection type="note" initialItems={items.filter(i => i.type === 'note')} />
      )}
    </div>
  )
}
