'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { X, FolderOpen, CheckCircle2, Circle } from 'lucide-react'
import BlockEditor, { Block } from './BlockEditor'
import { updateProjectContent } from '@/app/_actions/projects'
import TaskItem from './TaskItem'
import AddTaskForm from './AddTaskForm'
import ProjectActions from './ProjectActions'

interface Task {
  id: string
  title: string
  status: 'pending' | 'done'
  notes: string | null
  due_date?: string | null
}

interface Project {
  id: string
  name: string
  description: string | null
  status: string
  color: string
  content: { blocks: Block[] } | null
  taskTotal: number
  taskDone: number
  tasks?: Task[]
}

interface ProjectModalProps {
  project: Project
  onClose: () => void
}

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [saved, setSaved] = useState(true)
  const [activeTab, setActiveTab] = useState<'notes' | 'tasks'>('notes')

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('keydown', handleKey)
      if (saveTimer.current) clearTimeout(saveTimer.current)
    }
  }, [onClose])

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const handleChange = useCallback((blocks: Block[]) => {
    setSaved(false)
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(async () => {
      await updateProjectContent(project.id, { blocks })
      setSaved(true)
    }, 1200)
  }, [project.id])

  const initialBlocks = project.content?.blocks ?? []
  const progress = project.taskTotal > 0
    ? Math.round((project.taskDone / project.taskTotal) * 100)
    : 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-8">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">

        {/* Cover */}
        <div className="h-20 flex-shrink-0 relative" style={{ backgroundColor: project.color }}>
          <div className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'radial-gradient(circle at 20% 80%, white 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          />
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center text-white transition"
          >
            <X size={15} />
          </button>
          {/* Save indicator */}
          <div className="absolute bottom-3 right-3">
            <span className={`text-[10px] font-mono transition-opacity ${saved ? 'opacity-40' : 'opacity-100'} text-white`}>
              {saved ? 'Guardado' : 'Guardando...'}
            </span>
          </div>
        </div>

        {/* Header */}
        <div className="px-8 pt-5 pb-3 flex-shrink-0 border-b border-gray-100">
          <div className="flex items-start gap-3">
            <FolderOpen size={24} className="text-brand-muted flex-shrink-0 mt-0.5" style={{ color: project.color }} />
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold text-brand-text font-mono leading-tight">{project.name}</h2>
              {project.description && (
                <p className="text-brand-muted text-sm font-mono mt-0.5">{project.description}</p>
              )}
            </div>
          </div>

          {/* Progreso + acciones */}
          <div className="mt-3 flex items-center gap-4">
            {project.taskTotal > 0 && (
              <div className="flex-1 max-w-xs">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={11} className="text-brand-muted" />
                    <span className="text-[10px] font-mono text-brand-muted">
                      {project.taskDone}/{project.taskTotal} tareas
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-brand-muted">{progress}%</span>
                </div>
                <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${progress}%`, backgroundColor: project.color }}
                  />
                </div>
              </div>
            )}
            <div className="ml-auto">
              <ProjectActions
                id={project.id}
                status={project.status as 'active' | 'completed' | 'paused'}
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-3">
            {([['notes', 'Notas'], ['tasks', 'Tareas']] as const).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors ${
                  activeTab === key
                    ? 'bg-brand-dark text-white'
                    : 'text-brand-muted hover:text-brand-text hover:bg-gray-100'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-8 py-5" dir="ltr">
          {activeTab === 'notes' ? (
            <BlockEditor
              initialBlocks={initialBlocks}
              onChange={handleChange}
            />
          ) : (
            <div className="space-y-1">
              {(project.tasks ?? []).length === 0 ? (
                <p className="text-brand-muted text-sm font-mono py-4 text-center">Sin tareas todavía</p>
              ) : (
                <div className="divide-y divide-gray-50">
                  {(project.tasks ?? []).filter(t => t.status === 'pending').map(t => (
                    <TaskItem key={t.id} task={t} />
                  ))}
                  {(project.tasks ?? []).filter(t => t.status === 'done').map(t => (
                    <div key={t.id} className="opacity-50">
                      <TaskItem task={t} />
                    </div>
                  ))}
                </div>
              )}
              <div className="pt-3 border-t border-gray-100">
                <AddTaskForm projectId={project.id} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
