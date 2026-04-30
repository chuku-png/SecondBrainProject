'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function getAuthUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw new Error('No autenticado')
  return { supabase, user }
}

// ─── Transactions ─────────────────────────────────────────────────────────────

export async function getFinanceData(year: number, month: number) {
  try {
    const { supabase, user } = await getAuthUser()
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`
    const lastDay   = new Date(year, month, 0).getDate()
    const endDate   = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`

    const { data, error } = await supabase
      .from('transactions')
      .select('id, type, amount, category, description, date, account_id')
      .eq('user_id', user.id)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) return { error: error.message, data: null }
    return { data: data ?? [], error: null }
  } catch {
    return { error: 'Error al obtener finanzas', data: null }
  }
}

export async function getTransaction(id: string) {
  try {
    const { supabase, user } = await getAuthUser()
    const { data, error } = await supabase
      .from('transactions')
      .select('id, type, amount, category, description, date, account_id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) return { error: error.message, data: null }
    return { data, error: null }
  } catch {
    return { error: 'Error al obtener transacción', data: null }
  }
}

export async function createTransaction(payload: {
  type: 'income' | 'expense'
  amount: number
  category: string
  description: string
  date: string
  account_id?: string | null
}) {
  try {
    const { supabase, user } = await getAuthUser()
    if (!payload.amount || payload.amount <= 0) return { error: 'El monto debe ser mayor a 0' }
    if (!payload.category?.trim()) return { error: 'La categoría es requerida' }
    if (!payload.date) return { error: 'La fecha es requerida' }

    const { error } = await supabase.from('transactions').insert({
      user_id: user.id,
      type: payload.type,
      amount: payload.amount,
      category: payload.category,
      description: payload.description?.trim() || null,
      date: payload.date,
      account_id: payload.account_id || null,
    })

    if (error) return { error: error.message }
    revalidatePath('/finance')
    revalidatePath('/dashboard')
    return { success: true }
  } catch {
    return { error: 'Error al crear transacción' }
  }
}

export async function updateTransaction(id: string, payload: {
  type: 'income' | 'expense'
  amount: number
  category: string
  description: string
  date: string
  account_id?: string | null
}) {
  try {
    const { supabase, user } = await getAuthUser()
    if (!payload.amount || payload.amount <= 0) return { error: 'El monto debe ser mayor a 0' }
    if (!payload.category?.trim()) return { error: 'La categoría es requerida' }
    if (!payload.date) return { error: 'La fecha es requerida' }

    const { error } = await supabase
      .from('transactions')
      .update({
        type: payload.type,
        amount: payload.amount,
        category: payload.category,
        description: payload.description?.trim() || null,
        date: payload.date,
        account_id: payload.account_id || null,
      })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) return { error: error.message }
    revalidatePath('/finance')
    revalidatePath('/dashboard')
    return { success: true }
  } catch {
    return { error: 'Error al actualizar transacción' }
  }
}

export async function deleteTransaction(id: string) {
  try {
    const { supabase, user } = await getAuthUser()
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) return { error: error.message }
    revalidatePath('/finance')
    revalidatePath('/dashboard')
    return { success: true }
  } catch {
    return { error: 'Error al eliminar transacción' }
  }
}

// ─── Accounts ─────────────────────────────────────────────────────────────────

export async function getAccounts() {
  try {
    const { supabase, user } = await getAuthUser()

    const [accountsRes, txRes] = await Promise.all([
      supabase
        .from('accounts')
        .select('id, name, type, initial_balance, color')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true }),
      supabase
        .from('transactions')
        .select('account_id, type, amount')
        .eq('user_id', user.id),
    ])

    if (accountsRes.error) return { error: accountsRes.error.message, data: null }

    const txs = txRes.data ?? []
    const accounts = (accountsRes.data ?? []).map(acc => {
      const accTxs = txs.filter(t => t.account_id === acc.id)
      const income  = accTxs.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
      const expense = accTxs.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)
      return { ...acc, balance: Number(acc.initial_balance) + income - expense }
    })

    return { data: accounts, error: null }
  } catch {
    return { error: 'Error al obtener cuentas', data: null }
  }
}

export async function getAccount(id: string) {
  try {
    const { supabase, user } = await getAuthUser()
    const { data, error } = await supabase
      .from('accounts')
      .select('id, name, type, initial_balance, color')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) return { error: error.message, data: null }
    return { data, error: null }
  } catch {
    return { error: 'Error al obtener cuenta', data: null }
  }
}

export async function createAccount(payload: {
  name: string
  type: 'bank' | 'wallet' | 'cash'
  initial_balance: number
  color: string
}) {
  try {
    const { supabase, user } = await getAuthUser()
    if (!payload.name?.trim()) return { error: 'El nombre es requerido' }

    const { error } = await supabase.from('accounts').insert({
      user_id: user.id,
      name: payload.name.trim(),
      type: payload.type,
      initial_balance: payload.initial_balance ?? 0,
      color: payload.color || '#3D2010',
    })

    if (error) return { error: error.message }
    revalidatePath('/finance')
    return { success: true }
  } catch {
    return { error: 'Error al crear cuenta' }
  }
}

export async function updateAccount(id: string, payload: {
  name: string
  type: 'bank' | 'wallet' | 'cash'
  initial_balance: number
  color: string
}) {
  try {
    const { supabase, user } = await getAuthUser()
    if (!payload.name?.trim()) return { error: 'El nombre es requerido' }

    const { error } = await supabase
      .from('accounts')
      .update({
        name: payload.name.trim(),
        type: payload.type,
        initial_balance: payload.initial_balance ?? 0,
        color: payload.color,
      })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) return { error: error.message }
    revalidatePath('/finance')
    return { success: true }
  } catch {
    return { error: 'Error al actualizar cuenta' }
  }
}

export async function deleteAccount(id: string) {
  try {
    const { supabase, user } = await getAuthUser()
    const { error } = await supabase
      .from('accounts')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) return { error: error.message }
    revalidatePath('/finance')
    return { success: true }
  } catch {
    return { error: 'Error al eliminar cuenta' }
  }
}

// ─── Categories ───────────────────────────────────────────────────────────────

export async function getCategories(type?: 'income' | 'expense') {
  try {
    const { supabase, user } = await getAuthUser()
    let query = supabase
      .from('categories')
      .select('id, name, type, color')
      .eq('user_id', user.id)
      .order('name', { ascending: true })

    if (type) query = query.eq('type', type)

    const { data, error } = await query
    if (error) return { error: error.message, data: null }
    return { data: data ?? [], error: null }
  } catch {
    return { error: 'Error al obtener categorías', data: null }
  }
}

export async function createCategory(payload: {
  name: string
  type: 'income' | 'expense'
  color: string
}) {
  try {
    const { supabase, user } = await getAuthUser()
    if (!payload.name?.trim()) return { error: 'El nombre es requerido' }

    const { error } = await supabase.from('categories').insert({
      user_id: user.id,
      name: payload.name.trim(),
      type: payload.type,
      color: payload.color || '#C4A882',
    })

    if (error) return { error: error.message }
    revalidatePath('/finance')
    revalidatePath('/finance/categories')
    return { success: true }
  } catch {
    return { error: 'Error al crear categoría' }
  }
}

export async function updateCategory(id: string, payload: {
  name: string
  color: string
}) {
  try {
    const { supabase, user } = await getAuthUser()
    if (!payload.name?.trim()) return { error: 'El nombre es requerido' }

    const { error } = await supabase
      .from('categories')
      .update({ name: payload.name.trim(), color: payload.color })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) return { error: error.message }
    revalidatePath('/finance')
    revalidatePath('/finance/categories')
    return { success: true }
  } catch {
    return { error: 'Error al actualizar categoría' }
  }
}

export async function deleteCategory(id: string) {
  try {
    const { supabase, user } = await getAuthUser()
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) return { error: error.message }
    revalidatePath('/finance')
    revalidatePath('/finance/categories')
    return { success: true }
  } catch {
    return { error: 'Error al eliminar categoría' }
  }
}
