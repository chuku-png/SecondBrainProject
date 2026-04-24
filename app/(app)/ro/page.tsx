import { getRoDates, getRoItems } from '@/app/_actions/ro'
import RoHub from './_components/RoHub'
import { RoNewButton } from './_components/RoDateModal'

function getNextOccurrence(dateStr: string, recurring: boolean): { nextDate: string; daysUntil: number } {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const base = new Date(dateStr + 'T12:00:00')

  if (!recurring) {
    const diff = Math.ceil((base.getTime() - today.getTime()) / 86400000)
    return { nextDate: dateStr, daysUntil: diff }
  }

  const thisYear = new Date(today.getFullYear(), base.getMonth(), base.getDate())
  if (thisYear >= today) {
    const diff = Math.ceil((thisYear.getTime() - today.getTime()) / 86400000)
    const next = `${today.getFullYear()}-${String(base.getMonth() + 1).padStart(2, '0')}-${String(base.getDate()).padStart(2, '0')}`
    return { nextDate: next, daysUntil: diff }
  }

  const nextYear = new Date(today.getFullYear() + 1, base.getMonth(), base.getDate())
  const diff = Math.ceil((nextYear.getTime() - today.getTime()) / 86400000)
  const next = `${today.getFullYear() + 1}-${String(base.getMonth() + 1).padStart(2, '0')}-${String(base.getDate()).padStart(2, '0')}`
  return { nextDate: next, daysUntil: diff }
}

export default async function RoPage() {
  const [{ data: dates, error }, { data: items }] = await Promise.all([
    getRoDates(),
    getRoItems(),
  ])

  const enriched = (dates ?? []).map(item => ({
    ...item,
    ...getNextOccurrence(item.date, item.recurring),
  }))

  const upcoming  = enriched.filter(i => i.daysUntil >= 0).sort((a, b) => a.daysUntil - b.daysUntil)
  const past      = enriched.filter(i => i.daysUntil < 0).sort((a, b) => b.daysUntil - a.daysUntil)
  const nextEvent = upcoming.find(i => i.daysUntil > 0)

  return (
    <div className="min-h-screen bg-brand-bg dot-pattern">
      <header className="px-4 pt-6 pb-4 md:px-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-text font-mono">Ro 💕</h1>
          <p className="text-brand-muted text-sm font-mono mt-0.5">
            {upcoming.length > 0
              ? `${upcoming.length} fecha${upcoming.length !== 1 ? 's' : ''} próxima${upcoming.length !== 1 ? 's' : ''}`
              : 'Todo tranquilo por ahora'}
          </p>
        </div>
        <RoNewButton variant="header" />
      </header>

      <div className="px-4 pb-8 md:px-8 md:max-w-5xl">
        <div className="md:flex md:gap-6 md:items-start">

          {/* Columna principal */}
          <div className="flex-1 min-w-0">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
                <p className="text-red-700 text-sm font-mono">{error}</p>
              </div>
            )}

            {/* Próximo evento — mobile only */}
            {nextEvent && nextEvent.daysUntil <= 30 && (
              <div className="md:hidden bg-[#2A2118] rounded-2xl px-4 py-4 mb-4">
                <p className="text-[10px] font-mono text-[#C4A882] uppercase tracking-widest mb-1">Próximo</p>
                <p className="text-white font-bold font-mono text-base leading-snug">{nextEvent.title}</p>
                <p className="text-[#C4A882] font-mono text-sm mt-0.5">
                  {nextEvent.daysUntil === 1 ? 'Mañana' : `En ${nextEvent.daysUntil} días`}
                </p>
              </div>
            )}

            <RoHub dates={upcoming} items={items ?? []} />
          </div>

          {/* Sidebar desktop */}
          <div className="hidden md:flex md:flex-col md:gap-4 md:w-64 md:flex-shrink-0">
            {nextEvent && (
              <div className="bg-[#2A2118] rounded-2xl px-4 py-4">
                <p className="text-[10px] font-mono text-[#C4A882] uppercase tracking-widest mb-1">Próximo</p>
                <p className="text-white font-bold font-mono leading-snug">{nextEvent.title}</p>
                <p className="text-[#C4A882] font-mono text-sm mt-0.5">
                  {nextEvent.daysUntil === 1 ? 'Mañana' : `En ${nextEvent.daysUntil} días`}
                </p>
              </div>
            )}

            {past.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-4">
                <p className="text-[10px] font-mono text-brand-muted uppercase tracking-wide mb-3">Pasadas</p>
                <div className="flex flex-col gap-1 opacity-50">
                  {past.slice(0, 3).map(i => (
                    <p key={i.id} className="text-xs font-mono text-brand-text truncate py-1 border-b border-gray-50 last:border-0">
                      {i.title}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Resumen items */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <p className="text-[10px] font-mono text-brand-muted uppercase tracking-wide mb-3">Guardado</p>
              <div className="space-y-2">
                {[
                  { label: 'Regalos', type: 'gift',      emoji: '🎁' },
                  { label: 'Citas',   type: 'date_idea', emoji: '💕' },
                  { label: 'Lugares', type: 'place',     emoji: '📍' },
                  { label: 'Notas',   type: 'note',      emoji: '📝' },
                ].map(({ label, type, emoji }) => {
                  const count = (items ?? []).filter(i => i.type === type).length
                  const done  = (items ?? []).filter(i => i.type === type && i.done).length
                  return (
                    <div key={type} className="flex items-center justify-between">
                      <span className="text-xs font-mono text-brand-text">{emoji} {label}</span>
                      <span className="text-xs font-mono text-brand-muted">{done}/{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            <RoNewButton variant="sidebar" />
          </div>
        </div>
      </div>

      <RoNewButton variant="fab" />
    </div>
  )
}
