import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import ObjectiveForm from '../_components/ObjectiveForm'

export default function NewObjectivePage() {
  return (
    <div className="min-h-screen bg-brand-bg dot-pattern">
      <div className="max-w-lg mx-auto px-4 py-6 md:px-6">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/objectives" className="text-brand-muted hover:text-brand-text transition-colors">
            <ChevronLeft size={24} />
          </Link>
          <h1 className="text-xl font-bold text-brand-text font-mono">Nuevo objetivo</h1>
        </div>
        <ObjectiveForm mode="create" />
      </div>
    </div>
  )
}
