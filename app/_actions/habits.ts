'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { localDateStr, localMondayStr, localDateMinus } from '@/lib/timezone'

async function getAuthUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw new Error('No autenticado')
  return { supabase, user }
}

export async function getHabitsData(dateParam?: string) {
  try {
    const { supabase, user } = await getAuthUser()

    const todayStr = dateParam ?? localDateStr()
    const mondayStr = localMondayStr()
    const fromStr = localDateMinus(90)

    const [habitsResult, logsResult] = await Promise.all([
      supabase
        .from('habits')
        .select('id, name, type, color, frequency, is_active, linked_module, created_at')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: true }),
      supabase
        .from('habit_logs')
        .select('id, habit_id, date, completed, note')
        .eq('user_id', user.id)
        .gte('date', fromStr)
        .order('date', { ascending: false }),
    ])

    if (habitsResult.error) return { error: habitsResult.error.message, data: null, calendarData: {} }

    const allLogs = logsResult.data ?? []
    const totalHabits = habitsResult.data.length

    const habits = habitsResult.data.map(habit => {
      const habitLogs = allLogs.filter(l => l.habit_id === habit.id)
      const todayLog = habitLogs.find(l => l.date === todayStr) ?? null

      // Streak (always based on real today)
      const realToday = localDateStr()
      const completedDates = new Set(habitLogs.filter(l => l.completed).map(l => l.date))
      let streak = 0
      const check = new Date(realToday)
      if (!completedDates.has(realToday)) check.setDate(check.getDate() - 1)
      for (let i = 0; i < 90; i++) {
        const d = check.toISOString().split('T')[0]
        if (completedDates.has(d)) { streak++; check.setDate(check.getDate() - 1) }
        else break
      }

      // Weekly count (Mon–today)
      const weeklyCount = habitLogs.filter(
        l => l.completed && l.date >= mondayStr && l.date <= realToday
      ).length

      return {
        ...habit,
        logId: todayLog?.id ?? null,
        completed: todayLog?.completed ?? false,
        note: todayLog?.note ?? null,
        streak,
        weeklyCount,
      }
    })

    // Global calendar: date -> { done, total } using current active habits count
    const calendarData: Record<string, { done: number; total: number }> = {}
    for (const log of allLogs) {
      if (!log.completed) continue
      if (!calendarData[log.date]) calendarData[log.date] = { done: 0, total: totalHabits }
      calendarData[log.date].done++
    }

    return { data: habits, calendarData, error: null }
  } catch {
    return { error: 'Error al obtener hábitos', data: null, calendarData: {} }
  }
}

export async function getHabitWithCalendar(id: string) {
  try {
    const { supabase, user } = await getAuthUser()

    const [habitRes, logsRes] = await Promise.all([
      supabase
        .from('habits')
        .select('id, name, color, frequency, type, linked_module')
        .eq('id', id)
        .eq('user_id', user.id)
        .single(),
      supabase
        .from('habit_logs')
        .select('date, completed, note')
        .eq('habit_id', id)
        .eq('user_id', user.id)
        .eq('completed', true),
    ])

    if (habitRes.error || !habitRes.data) return { error: 'Hábito no encontrado', data: null }

    const completedDates = (logsRes.data ?? []).map(l => l.date)
    return { data: { habit: habitRes.data, completedDates }, error: null }
  } catch {
    return { error: 'Error al obtener calendario', data: null }
  }
}

export async function getHabitWeekLogs(habitId: string) {
  try {
    const { supabase, user } = await getAuthUser()
    const mondayStr = localMondayStr()
    const todayStr = localDateStr()

    const { data, error } = await supabase
      .from('habit_logs')
      .select('id, date, completed, note')
      .eq('habit_id', habitId)
      .eq('user_id', user.id)
      .gte('date', mondayStr)
      .lte('date', todayStr)

    if (error) return { error: error.message, data: null }
    return { data: data ?? [], error: null }
  } catch {
    return { error: 'Error al obtener logs', data: null }
  }
}

export async function createHabit(payload: {
  name: string
  type: 'daily' | 'weekly'
  color: string
  frequency: number
}) {
  try {
    const { supabase, user } = await getAuthUser()
    if (!payload.name?.trim()) return { error: 'El nombre es requerido' }

    const { error } = await supabase.from('habits').insert({
      name: payload.name.trim(),
      type: payload.type,
      color: payload.color,
      frequency: payload.frequency,
      user_id: user.id,
      is_active: true,
      metric_type: null,
      metric_unit: null,
    })

    if (error) return { error: error.message }
    revalidatePath('/habits')
    revalidatePath('/dashboard')
    return { success: true }
  } catch {
    return { error: 'Error al crear hábito' }
  }
}

export async function updateHabit(
  id: string,
  payload: { name?: string; type?: 'daily' | 'weekly'; color?: string; frequency?: number; linked_module?: string | null }
) {
  try {
    const { supabase, user } = await getAuthUser()
    if (payload.name !== undefined && !payload.name.trim()) return { error: 'El nombre es requerido' }

    const data = payload.name ? { ...payload, name: payload.name.trim() } : payload

    const { error } = await supabase
      .from('habits')
      .update(data)
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) return { error: error.message }
    revalidatePath('/habits')
    revalidatePath('/dashboard')
    return { success: true }
  } catch {
    return { error: 'Error al actualizar hábito' }
  }
}

export async function archiveHabit(id: string) {
  try {
    const { supabase, user } = await getAuthUser()
    const { error } = await supabase
      .from('habits')
      .update({ is_active: false })
      .eq('id', id)
      .eq('user_id', user.id)
    if (error) return { error: error.message }
    revalidatePath('/habits')
    revalidatePath('/dashboard')
    return { success: true }
  } catch {
    return { error: 'Error al archivar hábito' }
  }
}

export async function deleteHabit(id: string) {
  try {
    const { supabase, user } = await getAuthUser()

    const { error } = await supabase
      .from('habits')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) return { error: error.message }
    revalidatePath('/habits')
    revalidatePath('/dashboard')
    return { success: true }
  } catch {
    return { error: 'Error al eliminar hábito' }
  }
}

export async function toggleHabitLog(
  habitId: string,
  logId: string | null,
  currentCompleted: boolean,
  date: string,
  note?: string
) {
  try {
    const { supabase, user } = await getAuthUser()

    if (logId) {
      const updateData: Record<string, unknown> = { completed: !currentCompleted }
      if (note !== undefined) updateData.note = note
      const { error } = await supabase
        .from('habit_logs')
        .update(updateData)
        .eq('id', logId)
        .eq('user_id', user.id)
      if (error) return { error: error.message }
      revalidatePath('/habits')
      revalidatePath('/dashboard')
      return { success: true, logId }
    } else {
      const { data, error } = await supabase
        .from('habit_logs')
        .insert({ habit_id: habitId, user_id: user.id, date, completed: true, note: note ?? null })
        .select('id')
        .single()
      if (error) return { error: error.message }
      revalidatePath('/habits')
      revalidatePath('/dashboard')
      return { success: true, logId: data?.id ?? null }
    }
  } catch {
    return { error: 'Error al registrar hábito' }
  }
}

export async function saveHabitNote(logId: string, note: string) {
  try {
    const { supabase, user } = await getAuthUser()
    const { error } = await supabase
      .from('habit_logs')
      .update({ note: note.trim() || null })
      .eq('id', logId)
      .eq('user_id', user.id)
    if (error) return { error: error.message }
    revalidatePath('/habits')
    return { success: true }
  } catch {
    return { error: 'Error al guardar nota' }
  }
}
