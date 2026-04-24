import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import RoForm from '../_components/RoForm'

export default function NewRoDatePage() {
  return (
    <div className="min-h-screen bg-brand-bg dot-pattern">
      <div className="max-w-lg mx-auto px-4 py-6 md:px-6">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/ro" className="text-brand-muted hover:text-brand-text transition-colors">
            <ChevronLeft size={24} />
          </Link>
          <h1 className="text-xl font-bold text-brand-text font-mono">Nueva fecha</h1>
        </div>
        <RoForm mode="create" />
      </div>
    </div>
  )
}
