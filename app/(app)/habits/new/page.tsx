import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import HabitForm from '../_components/HabitForm'

export default function NewHabitPage() {
  return (
    <div className="min-h-screen bg-brand-bg dot-pattern">
      <div className="max-w-lg mx-auto px-4 py-6 md:px-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/habits"
            className="text-brand-muted hover:text-brand-text transition-colors"
          >
            <ChevronLeft size={24} />
          </Link>
          <h1 className="text-xl font-bold text-brand-text font-mono">Nuevo hábito</h1>
        </div>

        <HabitForm mode="create" />
      </div>
    </div>
  )
}
