import { getTransaction, getAccounts, getCategories } from '@/app/_actions/finance'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { notFound } from 'next/navigation'
import NewTransactionForm from '../../_components/NewTransactionForm'

export default async function EditTransactionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [{ data: tx }, { data: accounts }, { data: categories }] = await Promise.all([
    getTransaction(id),
    getAccounts(),
    getCategories(),
  ])

  if (!tx) notFound()

  return (
    <div className="min-h-screen bg-brand-bg dot-pattern">
      <div className="max-w-md mx-auto px-4 py-6 md:px-6">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/finance" className="text-brand-muted hover:text-brand-text transition-colors">
            <ChevronLeft size={24} />
          </Link>
          <h1 className="text-xl font-bold text-brand-text font-mono">Editar transacción</h1>
        </div>
        <NewTransactionForm
          mode="edit"
          id={id}
          accounts={accounts ?? []}
          categories={categories ?? []}
          initial={{
            type: tx.type as 'income' | 'expense',
            amount: Number(tx.amount),
            category: tx.category,
            description: tx.description,
            date: tx.date,
            account_id: tx.account_id,
          }}
        />
      </div>
    </div>
  )
}
