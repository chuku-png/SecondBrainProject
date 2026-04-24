'use client'

import { useState, useTransition, useOptimistic } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Briefcase, FolderOpen, Heart, CalendarDays } from 'lucide-react'
import Link from 'next/link'
import { addTodo, toggleTodo } from '@/app/_actions/todos'

interface Todo {
  id: string
  title: string
  completed: boolean
}

export interface AgendaItem {
  id: string
  title: string
  source: 'work' | 'project' | 'ro'
  sourceLabel: string
  sourceColor?: string
  href: string
}

const SOURCE_ICONS = {
  work:    Briefcase,
  project: FolderOpen,
  ro:      Heart,
}

const SOURCE_COLORS = {
  work:    'text-blue-500',
  project: 'text-brand-muted',
  ro:      'text-pink-500',
}

export default function TodoDay({
  todos,
  agendaItems,
}: {
  todos: Todo[]
  agendaItems: AgendaItem[]
}) {
  const router = useRouter()
  const [input, setInput] = useState('')
  const [isPending, startTransition] = useTransition()
  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    todos,
    (current: Todo[], newTodo: Todo) => [newTodo, ...current]
  )

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim()) return
    const title = input.trim()
    setInput('')
    startTransition(async () => {
      addOptimisticTodo({ id: crypto.randomUUID(), title, completed: false })
      const result = await addTodo(title)
      if (result?.error) {
        // Server action failed — refresh to revert the optimistic item
        router.refresh()
      } else {
        router.refresh()
      }
    })
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Agenda automática */}
      {agendaItems.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex items-center gap-1.5 mb-3">
            <CalendarDays size={12} className="text-brand-muted" />
            <h2 className="text-brand-text font-bold text-xs font-mono uppercase tracking-wide">
              Agenda de hoy
            </h2>
          </div>
          <div className="flex flex-col gap-2">
            {agendaItems.map(item => {
              const Icon = SOURCE_ICONS[item.source]
              const iconColor = item.source === 'project' && item.sourceColor
                ? undefined
                : SOURCE_COLORS[item.source]
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className="flex items-start gap-2 group hover:opacity-80 transition-opacity"
                >
                  <Icon
                    size={11}
                    className={`flex-shrink-0 mt-0.5 ${iconColor ?? ''}`}
                    style={item.source === 'project' && item.sourceColor ? { color: item.sourceColor } : undefined}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-mono text-brand-text truncate leading-tight">{item.title}</p>
                    <p className="text-[10px] font-mono text-brand-muted truncate">{item.sourceLabel}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Quick todos */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <h2 className="text-brand-text font-bold text-sm font-mono mb-3">To-Do rápidas</h2>

        <form onSubmit={handleAdd} className="flex gap-2 mb-3">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Agregar..."
            className="flex-1 h-9 px-3 rounded-xl bg-brand-bg border border-brand-border/30 text-brand-text placeholder-brand-border text-xs font-mono focus:outline-none focus:border-brand-dark transition"
          />
          <button
            type="submit"
            disabled={isPending || !input.trim()}
            className="w-9 h-9 rounded-xl bg-[#E07B4F] hover:opacity-90 disabled:opacity-50 flex items-center justify-center text-white flex-shrink-0 transition"
          >
            <Plus size={16} />
          </button>
        </form>

        {optimisticTodos.length === 0 ? (
          <p className="text-brand-muted text-xs font-mono text-center py-2">Sin tareas rápidas</p>
        ) : (
          <div className="flex flex-col gap-2">
            {optimisticTodos.filter(t => !t.completed).map(todo => (
              <TodoItem key={todo.id} todo={todo} />
            ))}
            {optimisticTodos.filter(t => t.completed).length > 0 && (
              <div className="flex flex-col gap-2 mt-1 opacity-50">
                {optimisticTodos.filter(t => t.completed).map(todo => (
                  <TodoItem key={todo.id} todo={todo} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function TodoItem({ todo }: { todo: Todo }) {
  const [isPending, startTransition] = useTransition()
  const [optimisticCompleted, setOptimistic] = useOptimistic(
    todo.completed,
    (_: boolean, v: boolean) => v
  )

  function handleToggle() {
    startTransition(async () => {
      setOptimistic(!todo.completed)
      await toggleTodo(todo.id, todo.completed)
    })
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className="flex items-center gap-2.5 text-left w-full group disabled:opacity-60"
    >
      <div className={`w-3.5 h-3.5 flex-shrink-0 border-2 rounded-sm transition-colors ${
        optimisticCompleted
          ? 'bg-brand-dark border-brand-dark'
          : 'border-brand-border group-hover:border-brand-muted'
      }`}>
        {optimisticCompleted && (
          <svg viewBox="0 0 14 14" className="w-full h-full text-white" fill="none">
            <path d="M2.5 7l3 3L11.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <span className={`text-xs font-mono transition-colors ${optimisticCompleted ? 'line-through text-brand-muted' : 'text-brand-text'}`}>
        {todo.title}
      </span>
    </button>
  )
}
