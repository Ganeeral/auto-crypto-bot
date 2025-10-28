interface Trade {
  id: number;
  symbol: string;
  side: string;
  quantity: number;
  price: number;
  status: string;
  confidence?: number;
  reasoning?: string;
  realizedPnl?: number;
  createdAt: string;
}

interface TradesTableProps {
  trades: Trade[];
  onCloseTrade: (id: number) => void;
}

export function TradesTable({ trades, onCloseTrade }: TradesTableProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'EXECUTED':
        return 'bg-green-900 text-green-200';
      case 'FAILED':
        return 'bg-red-900 text-red-200';
      case 'CANCELLED':
        return 'bg-gray-700 text-gray-300';
      case 'CLOSED':
        return 'bg-blue-900 text-blue-200';
      default:
        return 'bg-yellow-900 text-yellow-200';
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
      <h2 className="text-2xl font-bold mb-4">📜 Recent Trades</h2>
      
      {trades.length === 0 ? (
        <p className="text-gray-400 text-center py-8">No trades yet</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-700">
                <th className="pb-3">Time</th>
                <th className="pb-3">Symbol</th>
                <th className="pb-3">Side</th>
                <th className="pb-3">Quantity</th>
                <th className="pb-3">Price</th>
                <th className="pb-3">AI Confidence</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">P&L</th>
                <th className="pb-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((trade) => {
                const pnl = trade.realizedPnl || 0;
                const pnlColor = pnl >= 0 ? 'text-green-500' : 'text-red-500';
                
                return (
                  <tr key={trade.id} className="border-b border-gray-700 hover:bg-gray-750">
                    <td className="py-3 text-sm">{formatDate(trade.createdAt)}</td>
                    <td className="py-3 font-semibold">{trade.symbol}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded text-sm ${
                        trade.side === 'Buy' 
                          ? 'bg-green-900 text-green-200' 
                          : 'bg-red-900 text-red-200'
                      }`}>
                        {trade.side}
                      </span>
                    </td>
                    <td className="py-3">{trade.quantity}</td>
                    <td className="py-3">${parseFloat(trade.price.toString()).toFixed(2)}</td>
                    <td className="py-3">
                      {trade.confidence ? (
                        <span className="text-blue-400">{trade.confidence}%</span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded text-xs ${getStatusColor(trade.status)}`}>
                        {trade.status}
                      </span>
                    </td>
                    <td className={`py-3 font-semibold ${pnlColor}`}>
                      {pnl !== 0 ? `${pnl >= 0 ? '+' : ''}${pnl.toFixed(2)} USDT` : '-'}
                    </td>
                    <td className="py-3">
                      {trade.status === 'EXECUTED' && (
                        <button
                          onClick={() => onCloseTrade(trade.id)}
                          className="bg-orange-600 hover:bg-orange-700 px-3 py-1 rounded text-sm"
                        >
                          Close
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
