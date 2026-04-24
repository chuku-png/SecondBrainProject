import { getAccount } from '@/app/_actions/finance'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { notFound } from 'next/navigation'
import AccountForm from '../../../_components/AccountForm'

export default async function EditAccountPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data, error } = await getAccount(id)

  if (!data || error) notFound()

  return (
    <div className="min-h-screen bg-brand-bg dot-pattern">
      <div className="max-w-md mx-auto px-4 py-6 md:px-6">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/finance" className="text-brand-muted hover:text-brand-text transition-colors">
            <ChevronLeft size={24} />
          </Link>
          <h1 className="text-xl font-bold text-brand-text font-mono">Editar cuenta</h1>
        </div>
        <AccountForm
          mode="edit"
          id={id}
          initial={{
            name: data.name,
            type: data.type as 'bank' | 'wallet' | 'cash',
            initial_balance: Number(data.initial_balance),
            color: data.color,
          }}
        />
      </div>
    </div>
  )
}
