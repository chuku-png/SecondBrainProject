'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function getAuthUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw new Error('No autenticado')
  return { supabase, user }
}

export async function getTodayTodos() {
  try {
    const { supabase, user } = await getAuthUser()
    const { data, error } = await supabase
      .from('global_todos')
      .select('id, title, completed, priority')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)
    if (error) return []
    return data ?? []
  } catch {
    return []
  }
}

export async function addTodo(title: string) {
  try {
    const { supabase, user } = await getAuthUser()
    if (!title.trim()) return { error: 'Título requerido' }
    const { error } = await supabase
      .from('global_todos')
      .insert({ user_id: user.id, title: title.trim() })
    if (error) return { error: error.message }
    revalidatePath('/dashboard')
    return { success: true }
  } catch {
    return { error: 'Error al agregar tarea' }
  }
}

export async function toggleTodo(id: string, completed: boolean) {
  try {
    const { supabase, user } = await getAuthUser()
    const { error } = await supabase
      .from('global_todos')
      .update({ completed: !completed })
      .eq('id', id)
      .eq('user_id', user.id)
    if (error) return { error: error.message }
    revalidatePath('/dashboard')
    return { success: true }
  } catch {
    return { error: 'Error al actualizar tarea' }
  }
}
