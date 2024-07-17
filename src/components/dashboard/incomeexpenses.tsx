export default function IncomeExpenses() {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">February</h2>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500">Income</p>
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold">$8,412</span>
              <span className="text-sm text-gray-500">$8,410</span>
            </div>
            <div className="w-full bg-green-200 h-2 rounded-full">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '99%' }}></div>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500">Expenses</p>
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold">$5,621</span>
              <span className="text-sm text-gray-500">$5,695</span>
            </div>
            <div className="w-full bg-red-200 h-2 rounded-full">
              <div className="bg-red-500 h-2 rounded-full" style={{ width: '98%' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }