'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function getAuthUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw new Error('No autenticado')
  return { supabase, user }
}

// ─── Objectives ───────────────────────────────────────────────────────────────

export async function getObjectives() {
  try {
    const { supabase, user } = await getAuthUser()
    const { data, error } = await supabase
      .from('objectives')
      .select('id, title, description, progress_manual, target_date, status, color, created_at')
      .eq('user_id', user.id)
      .neq('status', 'archived')
      .order('created_at', { ascending: false })

    if (error) return { error: error.message, data: null }
    return { data: data ?? [], error: null }
  } catch {
    return { error: 'Error al obtener objetivos', data: null }
  }
}

export async function getObjective(id: string) {
  try {
    const { supabase, user } = await getAuthUser()
    const { data, error } = await supabase
      .from('objectives')
      .select('id, title, description, progress_manual, target_date, status, color')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) return { error: error.message, data: null }
    return { data, error: null }
  } catch {
    return { error: 'Error al obtener objetivo', data: null }
  }
}

export async function createObjective(payload: {
  title: string
  description: string
  target_date: string | null
  color: string
}) {
  try {
    const { supabase, user } = await getAuthUser()
    if (!payload.title?.trim()) return { error: 'El título es requerido' }

    const { data, error } = await supabase
      .from('objectives')
      .insert({
        user_id: user.id,
        title: payload.title.trim(),
        description: payload.description?.trim() || null,
        target_date: payload.target_date || null,
        color: payload.color || '#3D2010',
        progress_manual: 0,
        status: 'active',
      })
      .select('id')
      .single()

    if (error) return { error: error.message }
    revalidatePath('/objectives')
    revalidatePath('/dashboard')
    return { success: true, id: data.id }
  } catch {
    return { error: 'Error al crear objetivo' }
  }
}

export async function updateObjective(id: string, payload: {
  title: string
  description: string
  target_date: string | null
  color: string
  status?: string
}) {
  try {
    const { supabase, user } = await getAuthUser()
    if (!payload.title?.trim()) return { error: 'El título es requerido' }

    const { error } = await supabase
      .from('objectives')
      .update({
        title: payload.title.trim(),
        description: payload.description?.trim() || null,
        target_date: payload.target_date || null,
        color: payload.color,
        ...(payload.status ? { status: payload.status } : {}),
      })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) return { error: error.message }
    revalidatePath('/objectives')
    revalidatePath(`/objectives/${id}`)
    revalidatePath('/dashboard')
    return { success: true }
  } catch {
    return { error: 'Error al actualizar objetivo' }
  }
}

export async function updateObjectiveProgress(id: string, progress: number) {
  try {
    const { supabase, user } = await getAuthUser()
    const clamped = Math.min(100, Math.max(0, Math.round(progress)))

    const { error } = await supabase
      .from('objectives')
      .update({
        progress_manual: clamped,
        status: clamped >= 100 ? 'completed' : 'active',
      })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) return { error: error.message }
    revalidatePath('/objectives')
    revalidatePath(`/objectives/${id}`)
    revalidatePath('/dashboard')
    return { success: true }
  } catch {
    return { error: 'Error al actualizar progreso' }
  }
}

export async function deleteObjective(id: string) {
  try {
    const { supabase, user } = await getAuthUser()
    const { error } = await supabase
      .from('objectives')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) return { error: error.message }
    revalidatePath('/objectives')
    revalidatePath('/dashboard')
    return { success: true }
  } catch {
    return { error: 'Error al eliminar objetivo' }
  }
}

// ─── Milestones ───────────────────────────────────────────────────────────────

export async function getAllMilestones() {
  try {
    const { supabase, user } = await getAuthUser()
    const { data, error } = await supabase
      .from('objective_milestones')
      .select('id, objective_id, status')
      .eq('user_id', user.id)

    if (error) return { data: null, error: error.message }
    return { data: data ?? [], error: null }
  } catch {
    return { data: null, error: 'Error al obtener hitos' }
  }
}

export async function getMilestones(objectiveId: string) {
  try {
    const { supabase, user } = await getAuthUser()
    const { data, error } = await supabase
      .from('objective_milestones')
      .select('id, objective_id, title, period_start, period_end, target_value, current_value, source_type, source_id, metric_formula, entity_filter, status, created_at')
      .eq('objective_id', objectiveId)
      .eq('user_id', user.id)
      .order('period_start', { ascending: true })

    if (error) return { data: null, error: error.message }
    return { data: data ?? [], error: null }
  } catch {
    return { data: null, error: 'Error al obtener hitos' }
  }
}

export async function createMilestone(payload: {
  objective_id: string
  title: string
  period_start: string
  period_end: string
  target_value: number
  source_type: string
  source_id?: string | null
  metric_formula: string
  entity_filter?: Record<string, string> | null
}) {
  try {
    const { supabase, user } = await getAuthUser()
    if (!payload.title?.trim()) return { error: 'El título es requerido' }
    if (!payload.period_start || !payload.period_end) return { error: 'Las fechas son requeridas' }
    if (payload.period_end < payload.period_start) return { error: 'La fecha fin debe ser posterior al inicio' }
    if (!payload.target_value || payload.target_value <= 0) return { error: 'El valor objetivo debe ser mayor a 0' }

    const { data, error } = await supabase
      .from('objective_milestones')
      .insert({
        user_id: user.id,
        objective_id: payload.objective_id,
        title: payload.title.trim(),
        period_start: payload.period_start,
        period_end: payload.period_end,
        target_value: payload.target_value,
        current_value: 0,
        source_type: payload.source_type,
        source_id: payload.source_id || null,
        metric_formula: payload.metric_formula,
        entity_filter: payload.entity_filter || null,
        status: 'pending',
      })
      .select('id, objective_id, title, period_start, period_end, target_value, current_value, source_type, source_id, metric_formula, entity_filter, status, created_at')
      .single()

    if (error) return { error: error.message, data: null }
    revalidatePath('/objectives')
    revalidatePath(`/objectives/${payload.objective_id}`)
    return { success: true, data }
  } catch {
    return { error: 'Error al crear hito', data: null }
  }
}

export async function deleteMilestone(id: string) {
  try {
    const { supabase, user } = await getAuthUser()

    const { data: milestone } = await supabase
      .from('objective_milestones')
      .select('objective_id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    const { error } = await supabase
      .from('objective_milestones')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) return { error: error.message }
    revalidatePath('/objectives')
    if (milestone) revalidatePath(`/objectives/${milestone.objective_id}`)
    return { success: true }
  } catch {
    return { error: 'Error al eliminar hito' }
  }
}

export async function updateMilestoneValue(id: string, value: number) {
  try {
    const { supabase, user } = await getAuthUser()

    const { data: milestone } = await supabase
      .from('objective_milestones')
      .select('objective_id, target_value, period_end')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!milestone) return { error: 'Hito no encontrado' }

    const today = new Date().toISOString().split('T')[0]
    const newStatus =
      value >= milestone.target_value ? 'done' :
      milestone.period_end < today   ? 'failed' :
      'pending'

    const { error } = await supabase
      .from('objective_milestones')
      .update({ current_value: value, status: newStatus })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) return { error: error.message }
    revalidatePath('/objectives')
    revalidatePath(`/objectives/${milestone.objective_id}`)
    return { success: true }
  } catch {
    return { error: 'Error al actualizar hito' }
  }
}

export async function recalculateMilestone(id: string) {
  try {
    const { supabase, user } = await getAuthUser()

    const { data: m } = await supabase
      .from('objective_milestones')
      .select('id, objective_id, metric_formula, source_id, source_type, entity_filter, period_start, period_end, target_value')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!m) return { error: 'Hito no encontrado' }
    if (m.metric_formula === 'manual') return { success: true }

    const filter = (m.entity_filter ?? {}) as Record<string, string>
    let currentValue = 0

    if (m.metric_formula === 'sum_distance') {
      let q = supabase.from('workouts').select('distance_km')
        .eq('user_id', user.id).gte('date', m.period_start).lte('date', m.period_end)
      if (filter.workout_subtype) q = q.eq('workout_subtype', filter.workout_subtype)
      const { data } = await q
      currentValue = (data ?? []).reduce((s, r) => s + (Number(r.distance_km) || 0), 0)
    }

    else if (m.metric_formula === 'count_sessions') {
      let q = supabase.from('workouts').select('id')
        .eq('user_id', user.id).gte('date', m.period_start).lte('date', m.period_end)
      if (filter.workout_subtype) q = q.eq('workout_subtype', filter.workout_subtype)
      const { data } = await q
      currentValue = (data ?? []).length
    }

    else if (m.metric_formula === 'count_completed') {
      const { data } = await supabase.from('habit_logs').select('id')
        .eq('user_id', user.id).eq('habit_id', m.source_id).eq('completed', true)
        .gte('date', m.period_start).lte('date', m.period_end)
      currentValue = (data ?? []).length
    }

    else if (m.metric_formula === 'sum_amount_income') {
      let q = supabase.from('transactions').select('amount')
        .eq('user_id', user.id).eq('type', 'income')
        .gte('date', m.period_start).lte('date', m.period_end)
      if (filter.category)   q = q.eq('category', filter.category)
      if (filter.account_id) q = q.eq('account_id', filter.account_id)
      const { data } = await q
      currentValue = (data ?? []).reduce((s, r) => s + Number(r.amount), 0)
    }

    else if (m.metric_formula === 'sum_amount_expense') {
      let q = supabase.from('transactions').select('amount')
        .eq('user_id', user.id).eq('type', 'expense')
        .gte('date', m.period_start).lte('date', m.period_end)
      if (filter.category)   q = q.eq('category', filter.category)
      if (filter.account_id) q = q.eq('account_id', filter.account_id)
      const { data } = await q
      currentValue = (data ?? []).reduce((s, r) => s + Number(r.amount), 0)
    }

    else if (m.metric_formula === 'sum_amount_saved') {
      let qi = supabase.from('transactions').select('amount')
        .eq('user_id', user.id).eq('type', 'income')
        .gte('date', m.period_start).lte('date', m.period_end)
      let qe = supabase.from('transactions').select('amount')
        .eq('user_id', user.id).eq('type', 'expense')
        .gte('date', m.period_start).lte('date', m.period_end)
      if (filter.account_id) { qi = qi.eq('account_id', filter.account_id); qe = qe.eq('account_id', filter.account_id) }
      const [{ data: di }, { data: de }] = await Promise.all([qi, qe])
      const income  = (di ?? []).reduce((s, r) => s + Number(r.amount), 0)
      const expense = (de ?? []).reduce((s, r) => s + Number(r.amount), 0)
      currentValue = Math.max(0, income - expense)
    }

    else if (m.metric_formula === 'percent_done') {
      // Verify project ownership before querying tasks
      const { data: ownedProject } = await supabase
        .from('projects').select('id').eq('id', m.source_id).eq('user_id', user.id).single()
      if (!ownedProject) return { error: 'Proyecto no encontrado' }

      const [{ data: done }, { data: total }] = await Promise.all([
        supabase.from('project_tasks').select('id').eq('project_id', m.source_id).eq('status', 'done'),
        supabase.from('project_tasks').select('id').eq('project_id', m.source_id),
      ])
      currentValue = total?.length ? Math.round(((done?.length ?? 0) / total.length) * 100) : 0
    }

    else if (m.metric_formula === 'sum_hours') {
      const { data } = await supabase.from('work_items').select('hours_worked')
        .eq('user_id', user.id).eq('status', 'done')
        .gte('date', m.period_start).lte('date', m.period_end)
      currentValue = (data ?? []).reduce((s, r) => s + (Number(r.hours_worked) || 0), 0)
    }

    const today = new Date().toISOString().split('T')[0]
    const newStatus =
      currentValue >= m.target_value ? 'done' :
      m.period_end < today           ? 'failed' :
      'pending'

    const { error } = await supabase
      .from('objective_milestones')
      .update({ current_value: currentValue, status: newStatus })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) return { error: error.message }
    revalidatePath('/objectives')
    revalidatePath(`/objectives/${m.objective_id}`)
    return { success: true, currentValue, status: newStatus }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error al recalcular' }
  }
}

// ─── Links ────────────────────────────────────────────────────────────────────

export async function getLinks(objectiveId: string) {
  try {
    const { supabase, user } = await getAuthUser()
    const { data, error } = await supabase
      .from('objective_links')
      .select('id, entity_type, entity_id, entity_label, entity_filter, created_at')
      .eq('objective_id', objectiveId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })

    if (error) return { data: null, error: error.message }
    return { data: data ?? [], error: null }
  } catch {
    return { data: null, error: 'Error al obtener vínculos' }
  }
}

export async function createLink(payload: {
  objective_id: string
  entity_type: string
  entity_id?: string | null
  entity_label: string
  entity_filter?: Record<string, string> | null
}) {
  try {
    const { supabase, user } = await getAuthUser()
    if (!payload.entity_label?.trim()) return { error: 'El nombre es requerido', data: null }

    const { data, error } = await supabase
      .from('objective_links')
      .insert({
        user_id: user.id,
        objective_id: payload.objective_id,
        entity_type: payload.entity_type,
        entity_id: payload.entity_id || null,
        entity_label: payload.entity_label.trim(),
        entity_filter: payload.entity_filter || null,
      })
      .select('id, entity_type, entity_id, entity_label, entity_filter, created_at')
      .single()

    if (error) return { error: error.message, data: null }
    revalidatePath(`/objectives/${payload.objective_id}`)
    return { success: true, data }
  } catch {
    return { error: 'Error al crear vínculo', data: null }
  }
}

export async function deleteLink(id: string) {
  try {
    const { supabase, user } = await getAuthUser()

    const { data: link } = await supabase
      .from('objective_links')
      .select('objective_id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    const { error } = await supabase
      .from('objective_links')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) return { error: error.message }
    if (link) revalidatePath(`/objectives/${link.objective_id}`)
    return { success: true }
  } catch {
    return { error: 'Error al eliminar vínculo' }
  }
}
