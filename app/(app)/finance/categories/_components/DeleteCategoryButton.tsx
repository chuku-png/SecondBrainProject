'use client'

import { useTransition } from 'react'
import { Trash2 } from 'lucide-react'
import { deleteCategory } from '@/app/_actions/finance'

export default function DeleteCategoryButton({ id, name }: { id: string; name: string }) {
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    if (!confirm(`¿Eliminar categoría "${name}"? Las transacciones existentes no se verán afectadas.`)) return
    startTransition(async () => { await deleteCategory(id) })
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="text-gray-300 hover:text-red-400 transition-colors p-1 disabled:opacity-50"
    >
      <Trash2 size={13} />
    </button>
  )
}
