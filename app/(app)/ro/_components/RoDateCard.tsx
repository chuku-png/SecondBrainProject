'use client'

import { useTransition } from 'react'
import Link from 'next/link'
import { Pencil, Trash2, Heart, Star, Calendar, Bell, Gift } from 'lucide-react'
import { deleteRoDate } from '@/app/_actions/ro'

const TYPE_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  aniversario: { label: 'Aniversario', icon: <Heart size={13} />, color: '#E07B4F' },
  cumpleaños:  { label: 'Cumpleaños',  icon: <Gift size={13} />,  color: '#8B5E8B' },
  especial:    { label: 'Especial',    icon: <Star size={13} />,  color: '#C4A882' },
  recordatorio:{ label: 'Recordatorio',icon: <Bell size={13} />,  color: '#5B8DB8' },
  otro:        { label: 'Otro',        icon: <Calendar size={13} />, color: '#4A7C59' },
}

interface RoDateCardProps {
  item: {
    id: string
    title: string
    date: string
    type: string
    notes: string | null
    recurring: boolean
  }
  daysUntil: number
  nextDate: string
}

export default function RoDateCard({ item, daysUntil, nextDate }: RoDateCardProps) {
  const [isPending, startTransition] = useTransition()
  const cfg = TYPE_CONFIG[item.type] ?? TYPE_CONFIG['otro']

  function handleDelete() {
    if (!confirm(`¿Eliminar "${item.title}"?`)) return
    startTransition(async () => { await deleteRoDate(item.id) })
  }

  const isToday = daysUntil === 0
  const isSoon  = daysUntil > 0 && daysUntil <= 7

  const formattedDate = new Date(nextDate + 'T12:00:00').toLocaleDateString('es-AR', {
    day: 'numeric', month: 'long',
  })

  return (
    <div className={`bg-white rounded-2xl border overflow-hidden flex transition-opacity ${
      isPending ? 'opacity-60' : ''
    } ${isToday ? 'border-orange-200' : 'border-gray-100'}`}>
      {/* Acento izquierdo */}
      <div className="w-1 flex-shrink-0" style={{ backgroundColor: cfg.color }} />

      <div className="flex-1 flex items-start gap-3 px-4 py-3.5">
        {/* Ícono tipo */}
        <div className="flex-shrink-0 mt-0.5" style={{ color: cfg.color }}>
          {cfg.icon}
        </div>

        {/* Contenido */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold font-mono text-brand-text leading-snug">{item.title}</p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-[10px] font-mono text-brand-muted">{formattedDate}</span>
            {item.recurring && (
              <span className="text-[9px] font-mono text-brand-muted uppercase tracking-wide bg-brand-border/20 px-1.5 py-0.5 rounded">
                Anual
              </span>
            )}
          </div>
          {item.notes && (
            <p className="text-brand-muted text-[11px] font-mono mt-1 truncate">{item.notes}</p>
          )}
        </div>

        {/* Días restantes + acciones */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <div className={`text-right ${isToday ? 'text-[#E07B4F]' : isSoon ? 'text-orange-400' : 'text-brand-muted'}`}>
            {isToday ? (
              <p className="text-xs font-bold font-mono">¡Hoy! 🎉</p>
            ) : daysUntil < 0 ? (
              <p className="text-[10px] font-mono">Pasado</p>
            ) : (
              <>
                <p className="text-lg font-bold font-mono leading-none">{daysUntil}</p>
                <p className="text-[9px] font-mono uppercase">días</p>
              </>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Link href={`/ro/${item.id}/edit`} className="text-gray-300 hover:text-brand-muted transition-colors p-1">
              <Pencil size={11} />
            </Link>
            <button
              onClick={handleDelete}
              disabled={isPending}
              className="text-gray-300 hover:text-red-400 transition-colors p-1 disabled:opacity-50"
            >
              <Trash2 size={11} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
