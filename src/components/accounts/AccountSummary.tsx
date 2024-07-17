import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SummaryItem {
  name: string;
  amount: number;
}

interface AccountSummaryProps {
  assets: SummaryItem[];
  liabilities: SummaryItem[];
}

export default function AccountSummary({ assets, liabilities }: AccountSummaryProps) {
  const totalAssets = assets.reduce((sum, item) => sum + item.amount, 0);
  const totalLiabilities = liabilities.reduce((sum, item) => sum + item.amount, 0);
  const netWorth = totalAssets - totalLiabilities;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold">Assets</h3>
            {assets.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span>{item.name}</span>
                <span>${item.amount.toLocaleString()}</span>
              </div>
            ))}
            <div className="flex justify-between font-semibold mt-1">
              <span>Total Assets</span>
              <span>${totalAssets.toLocaleString()}</span>
            </div>
          </div>
          <div>
            <h3 className="font-semibold">Liabilities</h3>
            {liabilities.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span>{item.name}</span>
                <span>${item.amount.toLocaleString()}</span>
              </div>
            ))}
            <div className="flex justify-between font-semibold mt-1">
              <span>Total Liabilities</span>
              <span>${totalLiabilities.toLocaleString()}</span>
            </div>
          </div>
          <div className="pt-2 border-t">
            <div className="flex justify-between font-bold">
              <span>Net Worth</span>
              <span>${netWorth.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}