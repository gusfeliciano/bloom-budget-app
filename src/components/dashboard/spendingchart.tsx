export default function SpendingChart() {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Spending</h2>
        <p className="text-sm text-gray-500 mb-2">This month vs. last month</p>
        {/* Add chart component here */}
        <div className="h-64 bg-gray-200 rounded flex items-center justify-center">
          <span className="text-gray-500">Chart placeholder</span>
        </div>
      </div>
    );
  }