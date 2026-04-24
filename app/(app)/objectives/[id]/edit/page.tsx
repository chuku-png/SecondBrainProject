import { getObjective } from '@/app/_actions/objectives'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { notFound } from 'next/navigation'
import ObjectiveForm from '../../_components/ObjectiveForm'

export default async function EditObjectivePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data, error } = await getObjective(id)

  if (!data || error) notFound()

  return (
    <div className="min-h-screen bg-brand-bg dot-pattern">
      <div className="max-w-lg mx-auto px-4 py-6 md:px-6">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/objectives" className="text-brand-muted hover:text-brand-text transition-colors">
            <ChevronLeft size={24} />
          </Link>
          <h1 className="text-xl font-bold text-brand-text font-mono">Editar objetivo</h1>
        </div>
        <ObjectiveForm
          mode="edit"
          id={id}
          initial={{
            title: data.title,
            description: data.description,
            target_date: data.target_date,
            color: data.color,
            status: data.status,
          }}
        />
      </div>
    </div>
  )
}
