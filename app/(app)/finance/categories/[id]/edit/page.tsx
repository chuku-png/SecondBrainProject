import { getCategories } from '@/app/_actions/finance'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { notFound } from 'next/navigation'
import CategoryForm from '../../_components/CategoryForm'

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data: categories } = await getCategories()
  const cat = categories?.find(c => c.id === id)

  if (!cat) notFound()

  return (
    <div className="min-h-screen bg-brand-bg dot-pattern">
      <div className="max-w-md mx-auto px-4 py-6 md:px-6">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/finance/categories" className="text-brand-muted hover:text-brand-text transition-colors">
            <ChevronLeft size={24} />
          </Link>
          <h1 className="text-xl font-bold text-brand-text font-mono">Editar categoría</h1>
        </div>
        <CategoryForm
          mode="edit"
          id={id}
          initial={{ name: cat.name, type: cat.type as 'income' | 'expense', color: cat.color }}
        />
      </div>
    </div>
  )
}
