import IncomeExpenses from '../components/dashboard/IncomeExpenses'
import SpendingChart from '../components/dashboard/SpendingChart'
import NetWorth from '../components/dashboard/NetWorth'
import RecentTransactions from '../components/dashboard/RecentTransactions'

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-2 gap-6">
        <IncomeExpenses />
        <SpendingChart />
      </div>
      <div className="grid grid-cols-2 gap-6">
        <NetWorth />
        <RecentTransactions />
      </div>
    </div>
  )
}