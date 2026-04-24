// Roles y estados
export type UserRole = 'admin' | 'usuario_base'
export type UserStatus = 'pendiente' | 'activo' | 'inactivo'
export type HabitType = 'daily' | 'weekly'
export type ProjectStatus = 'active' | 'paused' | 'done' | 'archived'
export type ProjectType = 'personal' | 'work'
export type ObjectiveStatus = 'active' | 'done' | 'paused'
export type TransactionType = 'income' | 'expense'
export type WorkItemStatus = 'pending' | 'done'
export type Priority = 'low' | 'medium' | 'high'

// Entidades
export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: UserRole
  status: UserStatus
  created_at: string
  updated_at: string
}

export interface Habit {
  id: string
  user_id: string
  name: string
  type: HabitType
  frequency: number
  metric_type: string | null
  metric_unit: string | null
  color: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface HabitLog {
  id: string
  habit_id: string
  user_id: string
  date: string
  completed: boolean
  metric_value: number | null
  note: string | null
  created_at: string
}

export interface Project {
  id: string
  user_id: string
  name: string
  description: string | null
  status: ProjectStatus
  type: ProjectType
  start_date: string | null
  deadline: string | null
  created_at: string
  updated_at: string
}

export interface ProjectTask {
  id: string
  project_id: string
  user_id: string
  title: string
  completed: boolean
  priority: Priority
  due_date: string | null
  created_at: string
  updated_at: string
}

export interface WorkItem {
  id: string
  user_id: string
  title: string
  status: WorkItemStatus
  notes: string | null
  hours_worked: number | null
  date: string
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  user_id: string
  type: TransactionType
  amount: number
  category: string
  description: string | null
  date: string
  created_at: string
  updated_at: string
}

export interface Workout {
  id: string
  user_id: string
  date: string
  type: string | null
  duration_minutes: number | null
  notes: string | null
  created_at: string
}

export interface Objective {
  id: string
  user_id: string
  title: string
  description: string | null
  progress_manual: number
  status: ObjectiveStatus
  deadline: string | null
  created_at: string
  updated_at: string
}

export interface RODate {
  id: string
  user_id: string
  name: string
  date: string
  is_recurring: boolean
  category: string
  notes: string | null
  created_at: string
  updated_at: string
}

export interface GlobalTodo {
  id: string
  user_id: string
  title: string
  completed: boolean
  priority: Priority
  created_at: string
  updated_at: string
}

export interface AuditLog {
  id: string
  user_id: string | null
  table_name: string
  record_id: string | null
  operation: 'INSERT' | 'UPDATE' | 'DELETE'
  old_data: Record<string, any> | null
  new_data: Record<string, any> | null
  ip_address: string | null
  changed_at: string
}

// Payloads para Server Actions
export type HabitPayload = Omit<Habit, 'id' | 'user_id' | 'created_at' | 'updated_at'>
export type ProjectPayload = Omit<Project, 'id' | 'user_id' | 'created_at' | 'updated_at'>
export type TransactionPayload = Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>
export type WorkoutPayload = Omit<Workout, 'id' | 'user_id' | 'created_at'>
export type ObjectivePayload = Omit<Objective, 'id' | 'user_id' | 'created_at' | 'updated_at'>
