'use client'

import { useOptimistic, useTransition } from 'react'
import { Trash2, Utensils, MapPin } from 'lucide-react'
import { toggleRoItem, deleteRoItem } from '@/app/_actions/ro'

interface RoItem {
  id: string
  type: string
  title: string
  notes: string | null
  done: boolean
  place_type: string | null
}

export default function RoItemCard({ item }: { item: RoItem }) {
  const [isPending, startTransition] = useTransition()
  const [optimisticDone, setOptimisticDone] = useOptimistic(
    item.done,
    (_: boolean, v: boolean) => v
  )

  function handleToggle() {
    startTransition(async () => {
      setOptimisticDone(!item.done)
      await toggleRoItem(item.id, item.done)
    })
  }

  function handleDelete() {
    if (!confirm(`¿Eliminar "${item.title}"?`)) return
    startTransition(async () => { await deleteRoItem(item.id) })
  }

  return (
    <div className={`flex items-start gap-3 px-4 py-3 bg-white rounded-xl border border-gray-100 transition-opacity ${isPending ? 'opacity-60' : ''}`}>
      <button
        onClick={handleToggle}
        disabled={isPending}
        className="flex-shrink-0 mt-0.5"
      >
        <div className={`w-5 h-5 border-2 rounded-sm flex items-center justify-center transition-colors ${
          optimisticDone
            ? 'bg-green-400 border-green-400'
            : 'border-brand-border hover:border-brand-muted'
        }`}>
          {optimisticDone && (
            <svg viewBox="0 0 16 16" className="w-3 h-3 text-white" fill="none">
              <path d="M3 8l3.5 3.5L13 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
      </button>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-mono transition-colors ${optimisticDone ? 'line-through text-gray-300' : 'text-brand-text'}`}>
          {item.title}
        </p>
        <div className="flex items-center gap-2 flex-wrap mt-0.5">
          {item.place_type && (
            <span className="inline-flex items-center gap-1 text-[10px] font-mono text-brand-muted bg-gray-100 px-1.5 py-0.5 rounded-full">
              {item.place_type === 'restaurant'
                ? <><Utensils size={9} /> Restaurante</>
                : <><MapPin size={9} /> Visitar</>
              }
            </span>
          )}
          {item.notes && (
            <p className="text-brand-muted text-[11px] font-mono truncate">{item.notes}</p>
          )}
        </div>
      </div>

      <button
        onClick={handleDelete}
        disabled={isPending}
        className="text-gray-300 hover:text-red-400 transition-colors p-1 flex-shrink-0"
      >
        <Trash2 size={13} />
      </button>
    </div>
  )
}
