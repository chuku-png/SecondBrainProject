'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function getAuthUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw new Error('No autenticado')
  return { supabase, user }
}

export interface Debt {
  id: string
  name: string
  amount: number
  due_date: string | null
  recurring: boolean
  paid: boolean
  notes: string | null
}

export async function getDebts() {
  try {
    const { supabase, user } = await getAuthUser()
    const { data, error } = await supabase
      .from('debts')
      .select('id, name, amount, due_date, recurring, paid, notes')
      .eq('user_id', user.id)
      .order('paid', { ascending: true })
      .order('due_date', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false })

    if (error) return { data: null, error: error.message }
    return { data: data as Debt[], error: null }
  } catch {
    return { data: null, error: 'Error al obtener deudas' }
  }
}

export async function createDebt(payload: {
  name: string
  amount: number
  due_date?: string | null
  recurring: boolean
  notes?: string | null
}) {
  try {
    const { supabase, user } = await getAuthUser()
    if (!payload.name?.trim()) return { error: 'El nombre es requerido' }
    if (!payload.amount || payload.amount <= 0) return { error: 'El monto debe ser mayor a 0' }

    const { error } = await supabase.from('debts').insert({
      user_id:   user.id,
      name:      payload.name.trim(),
      amount:    payload.amount,
      due_date:  payload.due_date || null,
      recurring: payload.recurring,
      notes:     payload.notes?.trim() || null,
      paid:      false,
    })

    if (error) return { error: error.message }
    revalidatePath('/finance')
    return { success: true }
  } catch {
    return { error: 'Error al crear deuda' }
  }
}

export async function updateDebt(id: string, payload: {
  name: string
  amount: number
  due_date?: string | null
  recurring: boolean
  notes?: string | null
}) {
  try {
    const { supabase, user } = await getAuthUser()
    if (!payload.name?.trim()) return { error: 'El nombre es requerido' }
    if (!payload.amount || payload.amount <= 0) return { error: 'El monto debe ser mayor a 0' }

    const { error } = await supabase
      .from('debts')
      .update({
        name:      payload.name.trim(),
        amount:    payload.amount,
        due_date:  payload.due_date || null,
        recurring: payload.recurring,
        notes:     payload.notes?.trim() || null,
      })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) return { error: error.message }
    revalidatePath('/finance')
    return { success: true }
  } catch {
    return { error: 'Error al actualizar deuda' }
  }
}

export async function toggleDebtPaid(id: string, paid: boolean) {
  try {
    const { supabase, user } = await getAuthUser()
    const { error } = await supabase
      .from('debts')
      .update({ paid })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) return { error: error.message }
    revalidatePath('/finance')
    return { success: true }
  } catch {
    return { error: 'Error al actualizar deuda' }
  }
}

export async function deleteDebt(id: string) {
  try {
    const { supabase, user } = await getAuthUser()
    const { error } = await supabase
      .from('debts')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) return { error: error.message }
    revalidatePath('/finance')
    return { success: true }
  } catch {
    return { error: 'Error al eliminar deuda' }
  }
}
