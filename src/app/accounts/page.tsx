import AccountsList from '@/components/accounts/AccountsList'
import AccountSummary from '@/components/accounts/AccountSummary'
import AddAccountForm from '@/components/accounts/AddAccountForm'

const assetsSummary = [
  { name: "Cash", amount: 160495.28 },
  { name: "Investments", amount: 390000.00 },
  { name: "Real Estate", amount: 300000.00 },
  { name: "Vehicles", amount: 20000.00 },
];

const liabilitiesSummary = [
  { name: "Credit Cards", amount: 24721.04 },
  { name: "Loans", amount: 240000.00 },
];

export default function AccountsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Accounts</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <AccountsList />
          <AddAccountForm />
        </div>
        <div>
          <AccountSummary assets={assetsSummary} liabilities={liabilitiesSummary} />
        </div>
      </div>
    </div>
  )
}