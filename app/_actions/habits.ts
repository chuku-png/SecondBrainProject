'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function getAuthUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw new Error('No autenticado')
  return { supabase, user }
}

export async function getHabitsData() {
  try {
    const { supabase, user } = await getAuthUser()

    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]

    // Monday of current week
    const dow = today.getDay()
    const monday = new Date(today)
    monday.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1))
    const mondayStr = monday.toISOString().split('T')[0]

    // 90 days for calendar + streak
    const fromDate = new Date()
    fromDate.setDate(fromDate.getDate() - 90)
    const fromStr = fromDate.toISOString().split('T')[0]

    const [habitsResult, logsResult] = await Promise.all([
      supabase
        .from('habits')
        .select('id, name, type, color, frequency, is_active, created_at')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: true }),
      supabase
        .from('habit_logs')
        .select('id, habit_id, date, completed')
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

      // Streak
      const completedDates = new Set(habitLogs.filter(l => l.completed).map(l => l.date))
      let streak = 0
      const check = new Date()
      if (!completedDates.has(todayStr)) check.setDate(check.getDate() - 1)
      for (let i = 0; i < 90; i++) {
        const d = check.toISOString().split('T')[0]
        if (completedDates.has(d)) { streak++; check.setDate(check.getDate() - 1) }
        else break
      }

      // Weekly count (Mon–today)
      const weeklyCount = habitLogs.filter(
        l => l.completed && l.date >= mondayStr && l.date <= todayStr
      ).length

      return {
        ...habit,
        logId: todayLog?.id ?? null,
        completed: todayLog?.completed ?? false,
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
        .select('id, name, color, frequency, type')
        .eq('id', id)
        .eq('user_id', user.id)
        .single(),
      supabase
        .from('habit_logs')
        .select('date, completed')
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
  payload: { name?: string; type?: 'daily' | 'weekly'; color?: string; frequency?: number }
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
  date: string
) {
  try {
    const { supabase, user } = await getAuthUser()

    if (logId) {
      const { error } = await supabase
        .from('habit_logs')
        .update({ completed: !currentCompleted })
        .eq('id', logId)
        .eq('user_id', user.id)
      if (error) return { error: error.message }
    } else {
      const { error } = await supabase
        .from('habit_logs')
        .insert({ habit_id: habitId, user_id: user.id, date, completed: true })
      if (error) return { error: error.message }
    }

    revalidatePath('/habits')
    revalidatePath('/dashboard')
    return { success: true }
  } catch {
    return { error: 'Error al registrar hábito' }
  }
}
