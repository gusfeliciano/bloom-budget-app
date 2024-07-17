export default function NetWorth() {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Net Worth</h2>
        <div className="flex items-center space-x-2 mb-4">
          <span className="text-2xl font-bold">$605,774.24</span>
          <span className="text-sm text-green-500">+$2,791.16 (0.5%)</span>
          <span className="text-sm text-gray-500">This month</span>
        </div>
        {/* Add chart component here */}
        <div className="h-64 bg-gray-200 rounded flex items-center justify-center">
          <span className="text-gray-500">Chart placeholder</span>
        </div>
      </div>
    );
  }