import { getFinanceData, getAccounts, getCategories } from '@/app/_actions/finance'
import { getDebts } from '@/app/_actions/debts'
import FinanceDashboard from './_components/FinanceDashboard'
import { TransactionNewButton } from './_components/TransactionModal'

export default async function FinancePage() {
  const today = new Date()
  const year  = today.getFullYear()
  const month = today.getMonth() + 1

  const [{ data: transactions, error }, { data: accounts }, { data: categories }, { data: debts }] = await Promise.all([
    getFinanceData(year, month),
    getAccounts(),
    getCategories(),
    getDebts(),
  ])

  const txs      = transactions ?? []
  const accs     = accounts ?? []
  const income   = txs.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
  const expense  = txs.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)
  const balance  = income - expense
  // Suma del saldo real de cada cuenta (initial_balance + todos los ingresos - todos los gastos de esa cuenta)
  const netWorth = accs.reduce((s, acc) => s + acc.balance, 0)

  const monthLabel = today.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })

  return (
    <div className="min-h-screen bg-brand-bg dot-pattern">
      <header className="px-4 pt-6 pb-4 md:px-6 flex items-start justify-between max-w-2xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-brand-text font-mono">Finanzas</h1>
          <p className="text-brand-muted text-sm font-mono capitalize mt-0.5">{monthLabel}</p>
        </div>
        <TransactionNewButton variant="header" accounts={accs} categories={categories ?? []} />
      </header>

      <div className="px-4 pb-8 md:px-6 max-w-2xl mx-auto">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
            <p className="text-red-700 text-sm font-mono">{error}</p>
          </div>
        )}

        <FinanceDashboard
          transactions={txs}
          accounts={accs}
          income={income}
          expense={expense}
          balance={balance}
          netWorth={netWorth}
          debts={debts ?? []}
        />
      </div>

      <TransactionNewButton variant="fab" accounts={accs} categories={categories ?? []} />
    </div>
  )
}
