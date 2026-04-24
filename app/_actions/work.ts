'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function getAuthUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw new Error('No autenticado')
  return { supabase, user }
}

export async function getWorkData(date: string) {
  try {
    const { supabase, user } = await getAuthUser()
    const { data, error } = await supabase
      .from('work_items')
      .select('id, title, status, notes, hours_worked, date')
      .eq('user_id', user.id)
      .eq('date', date)
      .order('created_at', { ascending: true })

    if (error) return { error: error.message, data: null }
    return { data: data ?? [], error: null }
  } catch {
    return { error: 'Error al obtener tareas', data: null }
  }
}

export async function createWorkItem(payload: {
  title: string
  notes: string
  hours_worked: number | null
  date: string
}) {
  try {
    const { supabase, user } = await getAuthUser()
    if (!payload.title?.trim()) return { error: 'El título es requerido' }

    const { error } = await supabase.from('work_items').insert({
      user_id: user.id,
      title: payload.title.trim(),
      notes: payload.notes?.trim() || null,
      hours_worked: payload.hours_worked ?? null,
      date: payload.date,
      status: 'pending',
    })

    if (error) return { error: error.message }
    revalidatePath('/work')
    revalidatePath('/dashboard')
    return { success: true }
  } catch {
    return { error: 'Error al crear tarea' }
  }
}

export async function toggleWorkItem(id: string, currentStatus: 'pending' | 'done') {
  try {
    const { supabase, user } = await getAuthUser()
    const { error } = await supabase
      .from('work_items')
      .update({ status: currentStatus === 'pending' ? 'done' : 'pending' })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) return { error: error.message }
    revalidatePath('/work')
    revalidatePath('/dashboard')
    return { success: true }
  } catch {
    return { error: 'Error al actualizar tarea' }
  }
}

export async function deleteWorkItem(id: string) {
  try {
    const { supabase, user } = await getAuthUser()
    const { error } = await supabase
      .from('work_items')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) return { error: error.message }
    revalidatePath('/work')
    revalidatePath('/dashboard')
    return { success: true }
  } catch {
    return { error: 'Error al eliminar tarea' }
  }
}
