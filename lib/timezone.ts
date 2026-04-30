const TZ = 'America/Argentina/Buenos_Aires'

export function localDateStr(date?: Date): string {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: TZ }).format(date ?? new Date())
}

export function localMondayStr(date?: Date): string {
  const d = new Date(Intl.DateTimeFormat('sv-SE', { timeZone: TZ }).format(date ?? new Date()))
  const dow = d.getDay()
  d.setDate(d.getDate() - (dow === 0 ? 6 : dow - 1))
  return d.toISOString().split('T')[0]
}

export function localDateMinus(days: number): string {
  const now = new Date()
  now.setDate(now.getDate() - days)
  return new Intl.DateTimeFormat('sv-SE', { timeZone: TZ }).format(now)
}
