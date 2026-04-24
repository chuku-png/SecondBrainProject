-- ========================================
-- SECOND BRAIN V2 — SQL COMPLETO SUPABASE
-- ========================================
-- COPIAR Y PEGAR EN: SQL Editor → New Query → Run
-- Ejecutar este archivo COMPLETO de una vez

-- 1. EXTENSIONES NECESARIAS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TABLA: profiles (extiende auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'usuario_base' CHECK (role IN ('admin', 'usuario_base')),
  status TEXT NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'activo', 'inactivo')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- 3. TABLA: habits
CREATE TABLE IF NOT EXISTS habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'daily' CHECK (type IN ('daily', 'weekly')),
  frequency INTEGER NOT NULL DEFAULT 1 CHECK (frequency > 0),
  metric_type TEXT,
  metric_unit TEXT,
  color TEXT DEFAULT '#6366f1',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_habits_user ON habits(user_id);
CREATE INDEX IF NOT EXISTS idx_habits_user_active ON habits(user_id, is_active);

-- 4. TABLA: habit_logs
CREATE TABLE IF NOT EXISTS habit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  metric_value NUMERIC CHECK (metric_value >= 0),
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(habit_id, date)
);

CREATE INDEX IF NOT EXISTS idx_habit_logs_habit ON habit_logs(habit_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_user_date ON habit_logs(user_id, date);

-- 5. TABLA: projects
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'done', 'archived')),
  type TEXT NOT NULL DEFAULT 'personal' CHECK (type IN ('personal', 'work')),
  start_date DATE,
  deadline DATE,
  CHECK (deadline IS NULL OR start_date IS NULL OR deadline >= start_date),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_projects_user ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_user_status ON projects(user_id, status);

-- 6. TABLA: project_tasks
CREATE TABLE IF NOT EXISTS project_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_tasks_project ON project_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_user ON project_tasks(user_id);

-- 7. TABLA: work_items
CREATE TABLE IF NOT EXISTS work_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'done')),
  notes TEXT,
  hours_worked NUMERIC CHECK (hours_worked >= 0),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_work_items_user ON work_items(user_id);
CREATE INDEX IF NOT EXISTS idx_work_items_user_date ON work_items(user_id, date);

-- 8. TABLA: transactions
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  category TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, date);
CREATE INDEX IF NOT EXISTS idx_transactions_user_type ON transactions(user_id, type);

-- 9. TABLA: workouts
CREATE TABLE IF NOT EXISTS workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  type TEXT,
  duration_minutes INTEGER CHECK (duration_minutes > 0),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_workouts_user ON workouts(user_id);
CREATE INDEX IF NOT EXISTS idx_workouts_user_date ON workouts(user_id, date);

-- 10. TABLA: objectives
CREATE TABLE IF NOT EXISTS objectives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  progress_manual INTEGER NOT NULL DEFAULT 0 CHECK (progress_manual >= 0 AND progress_manual <= 100),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'done', 'paused')),
  deadline DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_objectives_user ON objectives(user_id);
CREATE INDEX IF NOT EXISTS idx_objectives_user_status ON objectives(user_id, status);

-- 11. TABLA: ro_dates (fechas importantes)
CREATE TABLE IF NOT EXISTS ro_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  date DATE NOT NULL,
  is_recurring BOOLEAN NOT NULL DEFAULT false,
  category TEXT DEFAULT 'general',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ro_dates_user ON ro_dates(user_id);
CREATE INDEX IF NOT EXISTS idx_ro_dates_user_date ON ro_dates(user_id, date);

-- 12. TABLA: global_todos
CREATE TABLE IF NOT EXISTS global_todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_global_todos_user ON global_todos(user_id);
CREATE INDEX IF NOT EXISTS idx_global_todos_user_completed ON global_todos(user_id, completed);

-- 13. TABLA: audit_logs (CRÍTICO)
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  operation TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_changed_at ON audit_logs(changed_at);

-- 14. TRIGGERS: updated_at automático
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER IF NOT EXISTS trigger_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS trigger_habits_updated_at
  BEFORE UPDATE ON habits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS trigger_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS trigger_project_tasks_updated_at
  BEFORE UPDATE ON project_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS trigger_work_items_updated_at
  BEFORE UPDATE ON work_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS trigger_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS trigger_objectives_updated_at
  BEFORE UPDATE ON objectives
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS trigger_ro_dates_updated_at
  BEFORE UPDATE ON ro_dates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS trigger_global_todos_updated_at
  BEFORE UPDATE ON global_todos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 15. TRIGGER: crear profile automáticamente al registrarse
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ========================================
-- RLS: ROW LEVEL SECURITY
-- ========================================

-- Habilitar RLS en todas las tablas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE ro_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS: profiles
DROP POLICY IF EXISTS "usuario ve su perfil" ON profiles;
CREATE POLICY "usuario ve su perfil" ON profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "usuario edita su perfil" ON profiles;
CREATE POLICY "usuario edita su perfil" ON profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "admin ve todos los perfiles" ON profiles;
CREATE POLICY "admin ve todos los perfiles" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "admin aprueba usuarios" ON profiles;
CREATE POLICY "admin aprueba usuarios" ON profiles
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- MACRO: Función para crear políticas RLS (SELECT, INSERT, UPDATE, DELETE)
-- Repetir esta estructura para cada tabla de usuario

-- POLÍTICAS: habits
DROP POLICY IF EXISTS "usuario ve sus habitos" ON habits;
CREATE POLICY "usuario ve sus habitos" ON habits
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "usuario crea sus habitos" ON habits;
CREATE POLICY "usuario crea sus habitos" ON habits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "usuario edita sus habitos" ON habits;
CREATE POLICY "usuario edita sus habitos" ON habits
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "usuario borra sus habitos" ON habits;
CREATE POLICY "usuario borra sus habitos" ON habits
  FOR DELETE USING (auth.uid() = user_id);

-- POLÍTICAS: habit_logs
DROP POLICY IF EXISTS "usuario ve sus habit_logs" ON habit_logs;
CREATE POLICY "usuario ve sus habit_logs" ON habit_logs
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "usuario crea sus habit_logs" ON habit_logs;
CREATE POLICY "usuario crea sus habit_logs" ON habit_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "usuario edita sus habit_logs" ON habit_logs;
CREATE POLICY "usuario edita sus habit_logs" ON habit_logs
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "usuario borra sus habit_logs" ON habit_logs;
CREATE POLICY "usuario borra sus habit_logs" ON habit_logs
  FOR DELETE USING (auth.uid() = user_id);

-- POLÍTICAS: projects
DROP POLICY IF EXISTS "usuario ve sus projects" ON projects;
CREATE POLICY "usuario ve sus projects" ON projects
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "usuario crea sus projects" ON projects;
CREATE POLICY "usuario crea sus projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "usuario edita sus projects" ON projects;
CREATE POLICY "usuario edita sus projects" ON projects
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "usuario borra sus projects" ON projects;
CREATE POLICY "usuario borra sus projects" ON projects
  FOR DELETE USING (auth.uid() = user_id);

-- POLÍTICAS: project_tasks
DROP POLICY IF EXISTS "usuario ve sus project_tasks" ON project_tasks;
CREATE POLICY "usuario ve sus project_tasks" ON project_tasks
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "usuario crea sus project_tasks" ON project_tasks;
CREATE POLICY "usuario crea sus project_tasks" ON project_tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "usuario edita sus project_tasks" ON project_tasks;
CREATE POLICY "usuario edita sus project_tasks" ON project_tasks
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "usuario borra sus project_tasks" ON project_tasks;
CREATE POLICY "usuario borra sus project_tasks" ON project_tasks
  FOR DELETE USING (auth.uid() = user_id);

-- POLÍTICAS: work_items
DROP POLICY IF EXISTS "usuario ve sus work_items" ON work_items;
CREATE POLICY "usuario ve sus work_items" ON work_items
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "usuario crea sus work_items" ON work_items;
CREATE POLICY "usuario crea sus work_items" ON work_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "usuario edita sus work_items" ON work_items;
CREATE POLICY "usuario edita sus work_items" ON work_items
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "usuario borra sus work_items" ON work_items;
CREATE POLICY "usuario borra sus work_items" ON work_items
  FOR DELETE USING (auth.uid() = user_id);

-- POLÍTICAS: transactions
DROP POLICY IF EXISTS "usuario ve sus transactions" ON transactions;
CREATE POLICY "usuario ve sus transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "usuario crea sus transactions" ON transactions;
CREATE POLICY "usuario crea sus transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "usuario edita sus transactions" ON transactions;
CREATE POLICY "usuario edita sus transactions" ON transactions
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "usuario borra sus transactions" ON transactions;
CREATE POLICY "usuario borra sus transactions" ON transactions
  FOR DELETE USING (auth.uid() = user_id);

-- POLÍTICAS: workouts
DROP POLICY IF EXISTS "usuario ve sus workouts" ON workouts;
CREATE POLICY "usuario ve sus workouts" ON workouts
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "usuario crea sus workouts" ON workouts;
CREATE POLICY "usuario crea sus workouts" ON workouts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "usuario edita sus workouts" ON workouts;
CREATE POLICY "usuario edita sus workouts" ON workouts
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "usuario borra sus workouts" ON workouts;
CREATE POLICY "usuario borra sus workouts" ON workouts
  FOR DELETE USING (auth.uid() = user_id);

-- POLÍTICAS: objectives
DROP POLICY IF EXISTS "usuario ve sus objectives" ON objectives;
CREATE POLICY "usuario ve sus objectives" ON objectives
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "usuario crea sus objectives" ON objectives;
CREATE POLICY "usuario crea sus objectives" ON objectives
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "usuario edita sus objectives" ON objectives;
CREATE POLICY "usuario edita sus objectives" ON objectives
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "usuario borra sus objectives" ON objectives;
CREATE POLICY "usuario borra sus objectives" ON objectives
  FOR DELETE USING (auth.uid() = user_id);

-- POLÍTICAS: ro_dates
DROP POLICY IF EXISTS "usuario ve sus ro_dates" ON ro_dates;
CREATE POLICY "usuario ve sus ro_dates" ON ro_dates
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "usuario crea sus ro_dates" ON ro_dates;
CREATE POLICY "usuario crea sus ro_dates" ON ro_dates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "usuario edita sus ro_dates" ON ro_dates;
CREATE POLICY "usuario edita sus ro_dates" ON ro_dates
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "usuario borra sus ro_dates" ON ro_dates;
CREATE POLICY "usuario borra sus ro_dates" ON ro_dates
  FOR DELETE USING (auth.uid() = user_id);

-- POLÍTICAS: global_todos
DROP POLICY IF EXISTS "usuario ve sus global_todos" ON global_todos;
CREATE POLICY "usuario ve sus global_todos" ON global_todos
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "usuario crea sus global_todos" ON global_todos;
CREATE POLICY "usuario crea sus global_todos" ON global_todos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "usuario edita sus global_todos" ON global_todos;
CREATE POLICY "usuario edita sus global_todos" ON global_todos
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "usuario borra sus global_todos" ON global_todos;
CREATE POLICY "usuario borra sus global_todos" ON global_todos
  FOR DELETE USING (auth.uid() = user_id);

-- POLÍTICAS: audit_logs (solo lectura para admin)
DROP POLICY IF EXISTS "solo admin ve audit_logs" ON audit_logs;
CREATE POLICY "solo admin ve audit_logs" ON audit_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ✅ FIN DEL SCRIPT
-- Si llegaste aquí sin errores, todo está configurado correctamente.
