'use client'

import { useState, useTransition, useEffect } from 'react'
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react'
import Modal from '@/app/(app)/_components/Modal'
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/app/_actions/finance'
import { useRouter } from 'next/navigation'

const COLORS = [
  '#22c55e', '#6366f1', '#f59e0b', '#06b6d4', '#ef4444',
  '#f97316', '#8b5cf6', '#ec4899', '#84cc16', '#3b82f6',
  '#64748b', '#C4A882', '#3D2010', '#E07B4F', '#4A7C59',
]

interface Category { id: string; name: string; type: 'income' | 'expense'; color: string }

// ─── Inline color picker ───────────────────────────────────────────────────────

function ColorPicker({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  return (
    <div className="flex gap-2 flex-wrap mt-2">
      {COLORS.map(c => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          className={`w-6 h-6 rounded-full transition-transform ${value === c ? 'scale-125 ring-2 ring-offset-1 ring-brand-border' : 'hover:scale-110'}`}
          style={{ backgroundColor: c }}
        />
      ))}
    </div>
  )
}

// ─── Create row ───────────────────────────────────────────────────────────────

function CreateRow({
  defaultType,
  onCreated,
  onCancel,
}: {
  defaultType: 'income' | 'expense'
  onCreated: () => void
  onCancel: () => void
}) {
  const [isPending, startTransition] = useTransition()
  const [name, setName]   = useState('')
  const [type, setType]   = useState<'income' | 'expense'>(defaultType)
  const [color, setColor] = useState(COLORS[0])
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    startTransition(async () => {
      const result = await createCategory({ name, type, color })
      if (result.error) { setError(result.error); return }
      onCreated()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-brand-bg border border-brand-border rounded-xl p-3 flex flex-col gap-3">
      <div className="flex gap-2">
        <button type="button" onClick={() => setType('expense')}
          className={`flex-1 h-8 rounded-lg text-xs font-bold font-mono transition ${type === 'expense' ? 'bg-red-500 text-white' : 'bg-white border border-gray-200 text-brand-muted'}`}>
          Gasto
        </button>
        <button type="button" onClick={() => setType('income')}
          className={`flex-1 h-8 rounded-lg text-xs font-bold font-mono transition ${type === 'income' ? 'bg-green-500 text-white' : 'bg-white border border-gray-200 text-brand-muted'}`}>
          Ingreso
        </button>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
        <input
          autoFocus
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Nombre de la categoría"
          required
          className="flex-1 h-9 px-3 rounded-lg bg-white border border-gray-200 text-brand-text placeholder-brand-border text-sm font-mono focus:outline-none focus:border-brand-dark transition"
        />
        <button type="submit" disabled={isPending || !name.trim()}
          className="w-9 h-9 rounded-lg bg-brand-dark text-white flex items-center justify-center disabled:opacity-40 flex-shrink-0">
          <Check size={14} />
        </button>
        <button type="button" onClick={onCancel}
          className="w-9 h-9 rounded-lg bg-gray-100 text-brand-muted flex items-center justify-center flex-shrink-0">
          <X size={14} />
        </button>
      </div>
      <ColorPicker value={color} onChange={setColor} />
      {error && <p className="text-red-500 text-xs font-mono">{error}</p>}
    </form>
  )
}

// ─── Edit row ─────────────────────────────────────────────────────────────────

function EditRow({
  cat,
  onSaved,
  onCancel,
}: {
  cat: Category
  onSaved: () => void
  onCancel: () => void
}) {
  const [isPending, startTransition] = useTransition()
  const [name, setName]   = useState(cat.name)
  const [color, setColor] = useState(cat.color)
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    startTransition(async () => {
      const result = await updateCategory(cat.id, { name, color })
      if (result.error) { setError(result.error); return }
      onSaved()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-brand-bg border border-brand-border rounded-xl p-3 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
        <input
          autoFocus
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          className="flex-1 h-9 px-3 rounded-lg bg-white border border-gray-200 text-brand-text text-sm font-mono focus:outline-none focus:border-brand-dark transition"
        />
        <button type="submit" disabled={isPending || !name.trim()}
          className="w-9 h-9 rounded-lg bg-brand-dark text-white flex items-center justify-center disabled:opacity-40 flex-shrink-0">
          <Check size={14} />
        </button>
        <button type="button" onClick={onCancel}
          className="w-9 h-9 rounded-lg bg-gray-100 text-brand-muted flex items-center justify-center flex-shrink-0">
          <X size={14} />
        </button>
      </div>
      <ColorPicker value={color} onChange={setColor} />
      {error && <p className="text-red-500 text-xs font-mono">{error}</p>}
    </form>
  )
}

// ─── Category row ─────────────────────────────────────────────────────────────

function CategoryRow({
  cat,
  onEdit,
  onDeleted,
}: {
  cat: Category
  onEdit: () => void
  onDeleted: () => void
}) {
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    if (!confirm(`¿Eliminar la categoría "${cat.name}"?`)) return
    startTransition(async () => {
      await deleteCategory(cat.id)
      onDeleted()
    })
  }

  return (
    <div className={`bg-white border border-gray-100 rounded-xl flex items-center gap-3 px-3 py-2.5 transition-opacity ${isPending ? 'opacity-50' : ''}`}>
      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
      <span className="flex-1 text-sm font-mono text-brand-text truncate">{cat.name}</span>
      <button onClick={onEdit} className="p-1.5 text-gray-300 hover:text-brand-muted transition-colors">
        <Pencil size={12} />
      </button>
      <button onClick={handleDelete} disabled={isPending} className="p-1.5 text-gray-300 hover:text-red-400 transition-colors disabled:opacity-50">
        <Trash2 size={12} />
      </button>
    </div>
  )
}

// ─── Main modal content ───────────────────────────────────────────────────────

function CategoryManagerContent({ onClose }: { onClose: () => void }) {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading]       = useState(true)
  const [creating, setCreating]     = useState<'income' | 'expense' | null>(null)
  const [editing, setEditing]       = useState<string | null>(null)

  async function load() {
    setLoading(true)
    const { data } = await getCategories()
    setCategories((data ?? []) as Category[])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function refresh() {
    load()
    router.refresh()
  }

  const income  = categories.filter(c => c.type === 'income')
  const expense = categories.filter(c => c.type === 'expense')

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-brand-dark border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  function Section({
    label,
    items,
    type,
  }: {
    label: string
    items: Category[]
    type: 'income' | 'expense'
  }) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-mono text-brand-muted uppercase tracking-wide">{label}</p>
          {creating !== type && (
            <button
              onClick={() => { setCreating(type); setEditing(null) }}
              className="flex items-center gap-1 text-[10px] font-mono text-brand-muted hover:text-brand-text transition-colors"
            >
              <Plus size={10} />
              Nueva
            </button>
          )}
        </div>

        {items.map(cat =>
          editing === cat.id ? (
            <EditRow
              key={cat.id}
              cat={cat}
              onSaved={() => { setEditing(null); refresh() }}
              onCancel={() => setEditing(null)}
            />
          ) : (
            <CategoryRow
              key={cat.id}
              cat={cat}
              onEdit={() => { setEditing(cat.id); setCreating(null) }}
              onDeleted={refresh}
            />
          )
        )}

        {items.length === 0 && creating !== type && (
          <p className="text-xs font-mono text-brand-muted px-1">Sin categorías</p>
        )}

        {creating === type && (
          <CreateRow
            defaultType={type}
            onCreated={() => { setCreating(null); refresh() }}
            onCancel={() => setCreating(null)}
          />
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5 pb-6">
      <Section label="Gastos" items={expense} type="expense" />
      <Section label="Ingresos" items={income} type="income" />
    </div>
  )
}

// ─── Exported modal + button ──────────────────────────────────────────────────

export default function CategoryManagerModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal title="Categorías" onClose={onClose}>
      <CategoryManagerContent onClose={onClose} />
    </Modal>
  )
}

export function CategoryManagerButton() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-xs font-mono text-brand-muted hover:text-brand-text transition-colors"
      >
        <Plus size={12} />
        Categorías
      </button>
      {open && <CategoryManagerModal onClose={() => setOpen(false)} />}
    </>
  )
}
