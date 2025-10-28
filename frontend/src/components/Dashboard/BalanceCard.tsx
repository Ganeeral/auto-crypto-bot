interface BalanceCardProps {
  balance: any;
}

export function BalanceCard({ balance }: BalanceCardProps) {
  const totalBalance = balance?.list?.[0]?.totalAvailableBalance || "0";
  const totalEquity = balance?.list?.[0]?.totalEquity || "0";
  const usedMargin = balance?.list?.[0]?.totalMarginBalance || "0";
  
  return (
    <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-200">💰 Account Balance</h3>
      </div>
      <div className="space-y-2">
        <div>
          <p className="text-sm text-gray-200">Available Balance</p>
          <p className="text-3xl font-bold">${parseFloat(totalBalance).toFixed(2)}</p>
        </div>
        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-purple-500">
          <div>
            <p className="text-xs text-gray-300">Total Equity</p>
            <p className="text-sm font-semibold">${parseFloat(totalEquity).toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-300">Used Margin</p>
            <p className="text-sm font-semibold">${parseFloat(usedMargin).toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
