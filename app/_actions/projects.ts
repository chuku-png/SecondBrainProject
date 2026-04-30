'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { localDateStr } from '@/lib/timezone'

async function getAuthUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw new Error('No autenticado')
  return { supabase, user }
}

export async function getProjects() {
  try {
    const { supabase, user } = await getAuthUser()

    const projectsRes = await supabase
      .from('projects')
      .select('id, name, description, status, color, content, created_at')
      .eq('user_id', user.id)
      .neq('status', 'archived')
      .order('created_at', { ascending: false })

    if (projectsRes.error) return { error: projectsRes.error.message, data: null }

    const projects = projectsRes.data ?? []
    if (projects.length === 0) return { data: [], error: null }

    const projectIds = projects.map(p => p.id)
    const tasksRes = await supabase
      .from('project_tasks')
      .select('project_id, status')
      .in('project_id', projectIds)

    const tasks = tasksRes.data ?? []
    const data = projects.map(p => {
      const pt = tasks.filter(t => t.project_id === p.id)
      return {
        ...p,
        taskTotal: pt.length,
        taskDone: pt.filter(t => t.status === 'done').length,
      }
    })

    return { data, error: null }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error al obtener proyectos', data: null }
  }
}

export async function updateProjectContent(id: string, content: { blocks: unknown[] }) {
  try {
    const { supabase, user } = await getAuthUser()
    const { error } = await supabase
      .from('projects')
      .update({ content })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) return { error: error.message }
    return { success: true }
  } catch {
    return { error: 'Error al guardar contenido' }
  }
}

export async function getProjectWithTasks(id: string) {
  try {
    const { supabase, user } = await getAuthUser()
    const [projectRes, tasksRes] = await Promise.all([
      supabase
        .from('projects')
        .select('id, name, description, status, color, content')
        .eq('id', id)
        .eq('user_id', user.id)
        .single(),
      supabase
        .from('project_tasks')
        .select('id, title, status, notes, due_date, created_at')
        .eq('project_id', id)
        .order('created_at', { ascending: true }),
    ])

    if (projectRes.error) return { error: projectRes.error.message, data: null }
    if (!projectRes.data) return { error: 'Proyecto no encontrado', data: null }

    return {
      data: { project: projectRes.data, tasks: tasksRes.data ?? [] },
      error: null,
    }
  } catch {
    return { error: 'Error al obtener proyecto', data: null }
  }
}

export async function createProject(payload: {
  name: string
  description: string
  color: string
}) {
  try {
    const { supabase, user } = await getAuthUser()
    if (!payload.name?.trim()) return { error: 'El nombre es requerido' }

    const { error } = await supabase.from('projects').insert({
      user_id: user.id,
      name: payload.name.trim(),
      description: payload.description?.trim() || null,
      color: payload.color || '#3D2010',
      status: 'active',
    })

    if (error) return { error: error.message }
    revalidatePath('/projects')
    revalidatePath('/dashboard')
    return { success: true }
  } catch {
    return { error: 'Error al crear proyecto' }
  }
}

export async function getDashboardAgendaTasks(date: string) {
  try {
    const { supabase, user } = await getAuthUser()
    const { data, error } = await supabase
      .from('project_tasks')
      .select('id, title, project_id, projects!inner(name, color, user_id)')
      .eq('due_date', date)
      .eq('status', 'pending')
      .eq('projects.user_id', user.id)
    if (error) return { data: null, error: error.message }
    return { data: data ?? [], error: null }
  } catch {
    return { data: null, error: 'Error al obtener tareas' }
  }
}

export async function updateProjectStatus(id: string, status: 'active' | 'completed' | 'paused' | 'archived') {
  try {
    const { supabase, user } = await getAuthUser()
    const { error } = await supabase
      .from('projects')
      .update({ status })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) return { error: error.message }
    revalidatePath('/projects')
    revalidatePath(`/projects/${id}`)
    return { success: true }
  } catch {
    return { error: 'Error al actualizar proyecto' }
  }
}

export async function deleteProject(id: string) {
  try {
    const { supabase, user } = await getAuthUser()
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) return { error: error.message }
    revalidatePath('/projects')
    revalidatePath('/dashboard')
    return { success: true }
  } catch {
    return { error: 'Error al eliminar proyecto' }
  }
}

export async function createTask(payload: {
  project_id: string
  title: string
  notes: string
  due_date?: string | null
}) {
  try {
    const { supabase, user } = await getAuthUser()
    if (!payload.title?.trim()) return { error: 'El título es requerido' }

    const { data: project } = await supabase
      .from('projects')
      .select('id')
      .eq('id', payload.project_id)
      .eq('user_id', user.id)
      .single()

    if (!project) return { error: 'Proyecto no encontrado' }

    const { error } = await supabase.from('project_tasks').insert({
      project_id: payload.project_id,
      title: payload.title.trim(),
      notes: payload.notes?.trim() || null,
      due_date: payload.due_date || null,
      status: 'pending',
    })

    if (error) return { error: error.message }
    revalidatePath(`/projects/${payload.project_id}`)
    return { success: true }
  } catch {
    return { error: 'Error al crear tarea' }
  }
}

export async function toggleTask(id: string, currentStatus: 'pending' | 'done') {
  try {
    const { supabase, user } = await getAuthUser()

    const { data: task } = await supabase
      .from('project_tasks')
      .select('id, project_id, projects!inner(user_id)')
      .eq('id', id)
      .eq('projects.user_id', user.id)
      .single()

    if (!task) return { error: 'Tarea no encontrada' }

    const { error } = await supabase
      .from('project_tasks')
      .update({ status: currentStatus === 'pending' ? 'done' : 'pending' })
      .eq('id', id)
      .eq('project_id', task.project_id)

    if (error) return { error: error.message }

    // Auto-recalculate percent_done milestones linked to this project
    const { data: linkedMilestones } = await supabase
      .from('objective_milestones')
      .select('id, objective_id, target_value, period_end')
      .eq('source_type', 'project')
      .eq('source_id', task.project_id)
      .eq('metric_formula', 'percent_done')
      .eq('user_id', user.id)

    if (linkedMilestones?.length) {
      const [{ data: doneTasks }, { data: allTasks }] = await Promise.all([
        supabase.from('project_tasks').select('id').eq('project_id', task.project_id).eq('status', 'done'),
        supabase.from('project_tasks').select('id').eq('project_id', task.project_id),
      ])
      const pct = allTasks?.length ? Math.round(((doneTasks?.length ?? 0) / allTasks.length) * 100) : 0
      const today = localDateStr()
      await Promise.all(linkedMilestones.map(m => {
        const newStatus = pct >= m.target_value ? 'done' : m.period_end < today ? 'failed' : 'pending'
        return supabase.from('objective_milestones')
          .update({ current_value: pct, status: newStatus })
          .eq('id', m.id)
          .eq('user_id', user.id)
      }))
      for (const m of linkedMilestones) revalidatePath(`/objectives/${m.objective_id}`)
      revalidatePath('/objectives')
    }

    revalidatePath(`/projects/${task.project_id}`)
    revalidatePath('/projects')
    return { success: true, projectId: task.project_id }
  } catch {
    return { error: 'Error al actualizar tarea' }
  }
}

export async function deleteTask(id: string) {
  try {
    const { supabase, user } = await getAuthUser()

    const { data: task } = await supabase
      .from('project_tasks')
      .select('id, project_id, projects!inner(user_id)')
      .eq('id', id)
      .eq('projects.user_id', user.id)
      .single()

    if (!task) return { error: 'Tarea no encontrada' }

    const { error } = await supabase
      .from('project_tasks')
      .delete()
      .eq('id', id)
      .eq('project_id', task.project_id)

    if (error) return { error: error.message }
    revalidatePath(`/projects/${task.project_id}`)
    return { success: true }
  } catch {
    return { error: 'Error al eliminar tarea' }
  }
}
