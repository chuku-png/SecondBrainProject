import { createClient } from '@/lib/supabase/server'
import { getAuthUser } from '@/app/_actions/auth'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import HabitForm from '../../_components/HabitForm'

export default async function EditHabitPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await getAuthUser()
  if (!user) return null

  const supabase = await createClient()
  const { data: habit } = await supabase
    .from('habits')
    .select('id, name, type, color, frequency, linked_module')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!habit) notFound()

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
          <h1 className="text-xl font-bold text-brand-text font-mono">Editar hábito</h1>
        </div>

        <HabitForm
          mode="edit"
          habitId={habit.id}
          defaultValues={{
            name: habit.name,
            type: habit.type as 'daily' | 'weekly',
            color: habit.color,
            frequency: habit.frequency,
            linked_module: habit.linked_module,
          }}
        />
      </div>
    </div>
  )
}
