import { getCategories } from '@/app/_actions/finance'
import Link from 'next/link'
import { ChevronLeft, Plus, Pencil, Trash2 } from 'lucide-react'
import DeleteCategoryButton from './_components/DeleteCategoryButton'

export default async function CategoriesPage() {
  const { data: categories } = await getCategories()

  const income  = categories?.filter(c => c.type === 'income')  ?? []
  const expense = categories?.filter(c => c.type === 'expense') ?? []

  return (
    <div className="min-h-screen bg-brand-bg dot-pattern">
      <div className="max-w-md mx-auto px-4 py-6 md:px-6">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/finance" className="text-brand-muted hover:text-brand-text transition-colors">
            <ChevronLeft size={24} />
          </Link>
          <h1 className="text-xl font-bold text-brand-text font-mono flex-1">Categorías</h1>
          <Link
            href="/finance/categories/new"
            className="flex items-center gap-1.5 bg-brand-dark hover:opacity-90 text-white text-sm font-mono font-bold px-3 py-2 rounded-xl transition"
          >
            <Plus size={15} />
            Nueva
          </Link>
        </div>

        <div className="flex flex-col gap-6">
          {/* Ingresos */}
          <div>
            <p className="text-xs font-mono text-brand-muted uppercase tracking-wide mb-2">Ingresos</p>
            {income.length === 0 ? (
              <p className="text-sm font-mono text-brand-muted px-1">Sin categorías de ingresos</p>
            ) : (
              <div className="flex flex-col gap-2">
                {income.map(cat => (
                  <CategoryRow key={cat.id} cat={cat} />
                ))}
              </div>
            )}
          </div>

          {/* Gastos */}
          <div>
            <p className="text-xs font-mono text-brand-muted uppercase tracking-wide mb-2">Gastos</p>
            {expense.length === 0 ? (
              <p className="text-sm font-mono text-brand-muted px-1">Sin categorías de gastos</p>
            ) : (
              <div className="flex flex-col gap-2">
                {expense.map(cat => (
                  <CategoryRow key={cat.id} cat={cat} />
                ))}
              </div>
            )}
          </div>

          <Link
            href="/finance/categories/new"
            className="flex items-center justify-center gap-2 h-11 bg-brand-dark hover:opacity-90 text-white text-sm font-mono font-bold rounded-xl transition"
          >
            <Plus size={16} />
            Nueva categoría
          </Link>
        </div>
      </div>
    </div>
  )
}

function CategoryRow({ cat }: { cat: { id: string; name: string; type: string; color: string } }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 flex items-center gap-3 px-4 py-3">
      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
      <span className="flex-1 text-sm font-mono text-brand-text">{cat.name}</span>
      <div className="flex items-center gap-1">
        <Link
          href={`/finance/categories/${cat.id}/edit`}
          className="text-gray-300 hover:text-brand-muted transition-colors p-1"
        >
          <Pencil size={13} />
        </Link>
        <DeleteCategoryButton id={cat.id} name={cat.name} />
      </div>
    </div>
  )
}
