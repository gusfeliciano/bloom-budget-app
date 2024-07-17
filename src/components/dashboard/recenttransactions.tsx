const transactions = [
    { id: 1, name: 'IBM', category: 'Paychecks', amount: 2000 },
    { id: 2, name: 'University of Illinois', category: 'Paychecks', amount: 2200 },
    { id: 3, name: 'State Farm', category: 'Insurance', amount: -90.91 },
    { id: 4, name: 'State Farm', category: 'Insurance', amount: -110.54 },
    { id: 5, name: 'Student Loan Payment', category: 'Loan Repayment', amount: -500.23 },
  ];
  
  export default function RecentTransactions() {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="flex justify-between items-center">
              <div>
                <p className="font-medium">{transaction.name}</p>
                <p className="text-sm text-gray-500">{transaction.category}</p>
              </div>
              <span className={`font-medium ${transaction.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                ${Math.abs(transaction.amount).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }