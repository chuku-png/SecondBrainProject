import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import CategoryForm from '../_components/CategoryForm'

export default function NewCategoryPage() {
  return (
    <div className="min-h-screen bg-brand-bg dot-pattern">
      <div className="max-w-md mx-auto px-4 py-6 md:px-6">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/finance/categories" className="text-brand-muted hover:text-brand-text transition-colors">
            <ChevronLeft size={24} />
          </Link>
          <h1 className="text-xl font-bold text-brand-text font-mono">Nueva categoría</h1>
        </div>
        <CategoryForm mode="create" />
      </div>
    </div>
  )
}
