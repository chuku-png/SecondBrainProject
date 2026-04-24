import { getRoDate } from '@/app/_actions/ro'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { notFound } from 'next/navigation'
import RoForm from '../../_components/RoForm'

export default async function EditRoDatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data, error } = await getRoDate(id)

  if (!data || error) notFound()

  return (
    <div className="min-h-screen bg-brand-bg dot-pattern">
      <div className="max-w-lg mx-auto px-4 py-6 md:px-6">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/ro" className="text-brand-muted hover:text-brand-text transition-colors">
            <ChevronLeft size={24} />
          </Link>
          <h1 className="text-xl font-bold text-brand-text font-mono">Editar fecha</h1>
        </div>
        <RoForm
          mode="edit"
          id={id}
          initial={{
            title: data.title,
            date: data.date,
            type: data.type,
            notes: data.notes,
            recurring: data.recurring,
          }}
        />
      </div>
    </div>
  )
}
