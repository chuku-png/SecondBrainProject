'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function getAuthUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw new Error('No autenticado')
  return { supabase, user }
}

export async function getRoDates() {
  try {
    const { supabase, user } = await getAuthUser()
    const { data, error } = await supabase
      .from('ro_dates')
      .select('id, title, date, type, notes, recurring, created_at')
      .eq('user_id', user.id)
      .order('date', { ascending: true })

    if (error) return { error: error.message, data: null }
    return { data: data ?? [], error: null }
  } catch {
    return { error: 'Error al obtener fechas', data: null }
  }
}

export async function getRoDate(id: string) {
  try {
    const { supabase, user } = await getAuthUser()
    const { data, error } = await supabase
      .from('ro_dates')
      .select('id, title, date, type, notes, recurring')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) return { error: error.message, data: null }
    return { data, error: null }
  } catch {
    return { error: 'Error al obtener fecha', data: null }
  }
}

export async function createRoDate(payload: {
  title: string
  date: string
  type: string
  notes: string
  recurring: boolean
}) {
  try {
    const { supabase, user } = await getAuthUser()
    if (!payload.title?.trim()) return { error: 'El título es requerido' }
    if (!payload.date) return { error: 'La fecha es requerida' }

    const { error } = await supabase.from('ro_dates').insert({
      user_id: user.id,
      title: payload.title.trim(),
      date: payload.date,
      type: payload.type || 'otro',
      notes: payload.notes?.trim() || null,
      recurring: payload.recurring,
    })

    if (error) return { error: error.message }
    revalidatePath('/ro')
    revalidatePath('/dashboard')
    return { success: true }
  } catch {
    return { error: 'Error al crear fecha' }
  }
}

export async function updateRoDate(id: string, payload: {
  title: string
  date: string
  type: string
  notes: string
  recurring: boolean
}) {
  try {
    const { supabase, user } = await getAuthUser()
    if (!payload.title?.trim()) return { error: 'El título es requerido' }

    const { error } = await supabase
      .from('ro_dates')
      .update({
        title: payload.title.trim(),
        date: payload.date,
        type: payload.type,
        notes: payload.notes?.trim() || null,
        recurring: payload.recurring,
      })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) return { error: error.message }
    revalidatePath('/ro')
    revalidatePath('/dashboard')
    return { success: true }
  } catch {
    return { error: 'Error al actualizar fecha' }
  }
}

export async function deleteRoDate(id: string) {
  try {
    const { supabase, user } = await getAuthUser()
    const { error } = await supabase
      .from('ro_dates')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) return { error: error.message }
    revalidatePath('/ro')
    revalidatePath('/dashboard')
    return { success: true }
  } catch {
    return { error: 'Error al eliminar fecha' }
  }
}

// ─── Ro Items ─────────────────────────────────────────────────────────────────

export async function getRoItems() {
  try {
    const { supabase, user } = await getAuthUser()
    const { data, error } = await supabase
      .from('ro_items')
      .select('id, type, title, notes, done, place_type, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) return { error: error.message, data: null }
    return { data: data ?? [], error: null }
  } catch {
    return { error: 'Error al obtener items', data: null }
  }
}

export async function createRoItem(payload: {
  type: 'gift' | 'date_idea' | 'place' | 'note'
  title: string
  notes?: string
  place_type?: 'restaurant' | 'visit' | null
}) {
  try {
    const { supabase, user } = await getAuthUser()
    if (!payload.title?.trim()) return { error: 'El título es requerido' }

    const { data, error } = await supabase
      .from('ro_items')
      .insert({
        user_id: user.id,
        type: payload.type,
        title: payload.title.trim(),
        notes: payload.notes?.trim() || null,
        place_type: payload.place_type || null,
        done: false,
      })
      .select('id, type, title, notes, done, place_type, created_at')
      .single()

    if (error) return { error: error.message, data: null }
    revalidatePath('/ro')
    return { success: true, data }
  } catch {
    return { error: 'Error al crear item', data: null }
  }
}

export async function toggleRoItem(id: string, done: boolean) {
  try {
    const { supabase, user } = await getAuthUser()
    const { error } = await supabase
      .from('ro_items')
      .update({ done: !done })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) return { error: error.message }
    revalidatePath('/ro')
    return { success: true }
  } catch {
    return { error: 'Error al actualizar item' }
  }
}

export async function deleteRoItem(id: string) {
  try {
    const { supabase, user } = await getAuthUser()
    const { error } = await supabase
      .from('ro_items')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) return { error: error.message }
    revalidatePath('/ro')
    return { success: true }
  } catch {
    return { error: 'Error al eliminar item' }
  }
}
