'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { localDateMinus } from '@/lib/timezone'

async function getAuthUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw new Error('No autenticado')
  return { supabase, user }
}

export async function getWorkouts(limit = 30) {
  try {
    const { supabase, user } = await getAuthUser()
    const { data, error } = await supabase
      .from('workouts')
      .select('id, date, type, duration_minutes, notes, created_at')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) return { error: error.message, data: null }
    return { data: data ?? [], error: null }
  } catch {
    return { error: 'Error al obtener entrenamientos', data: null }
  }
}

export async function getWorkoutsCalendar() {
  try {
    const { supabase, user } = await getAuthUser()
    const fromStr = localDateMinus(90)

    const { data, error } = await supabase
      .from('workouts')
      .select('date, type')
      .eq('user_id', user.id)
      .gte('date', fromStr)
      .order('date', { ascending: false })

    if (error) return { error: error.message, data: null }

    // date -> array of types (to show on calendar)
    const byDate: Record<string, string[]> = {}
    for (const w of data ?? []) {
      if (!byDate[w.date]) byDate[w.date] = []
      byDate[w.date].push(w.type)
    }
    return { data: byDate, error: null }
  } catch {
    return { error: 'Error al obtener calendario', data: null }
  }
}

export async function createWorkout(payload: {
  type: string
  duration_minutes: number | null
  notes: string
  date: string
}) {
  try {
    const { supabase, user } = await getAuthUser()
    if (!payload.type?.trim()) return { error: 'El tipo de entrenamiento es requerido' }

    const { error } = await supabase.from('workouts').insert({
      user_id: user.id,
      type: payload.type.trim(),
      duration_minutes: payload.duration_minutes ?? null,
      notes: payload.notes?.trim() || null,
      date: payload.date,
    })

    if (error) return { error: error.message }
    revalidatePath('/gym')
    revalidatePath('/habits')
    revalidatePath('/dashboard')
    return { success: true }
  } catch {
    return { error: 'Error al crear entrenamiento' }
  }
}

export async function deleteWorkout(id: string) {
  try {
    const { supabase, user } = await getAuthUser()
    const { error } = await supabase
      .from('workouts')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) return { error: error.message }
    revalidatePath('/gym')
    revalidatePath('/dashboard')
    return { success: true }
  } catch {
    return { error: 'Error al eliminar entrenamiento' }
  }
}
