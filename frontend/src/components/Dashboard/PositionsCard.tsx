interface Position {
  symbol: string;
  side: string;
  size: string;
  avgPrice: string;
  markPrice: string;
  unrealisedPnl: string;
  leverage: string;
}

interface PositionsCardProps {
  positions: Position[];
  onClosePosition: (symbol: string, side: string, qty: string) => void;
}

export function PositionsCard({ positions, onClosePosition }: PositionsCardProps) {
  const activePositions = positions.filter((p) => parseFloat(p.size) > 0);

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
      <h2 className="text-2xl font-bold mb-4">📈 Open Positions</h2>
      
      {activePositions.length === 0 ? (
        <p className="text-gray-400 text-center py-8">No open positions</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-700">
                <th className="pb-3">Symbol</th>
                <th className="pb-3">Side</th>
                <th className="pb-3">Size</th>
                <th className="pb-3">Entry Price</th>
                <th className="pb-3">Mark Price</th>
                <th className="pb-3">Unrealized P&L</th>
                <th className="pb-3">Leverage</th>
                <th className="pb-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {activePositions.map((position, idx) => {
                const pnl = parseFloat(position.unrealisedPnl);
                const pnlColor = pnl >= 0 ? 'text-green-500' : 'text-red-500';
                
                return (
                  <tr key={idx} className="border-b border-gray-700">
                    <td className="py-3 font-semibold">{position.symbol}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded ${
                        position.side === 'Buy' 
                          ? 'bg-green-900 text-green-200' 
                          : 'bg-red-900 text-red-200'
                      }`}>
                        {position.side}
                      </span>
                    </td>
                    <td className="py-3">{position.size}</td>
                    <td className="py-3">${parseFloat(position.avgPrice).toFixed(2)}</td>
                    <td className="py-3">${parseFloat(position.markPrice).toFixed(2)}</td>
                    <td className={`py-3 font-semibold ${pnlColor}`}>
                      {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)} USDT
                    </td>
                    <td className="py-3">{position.leverage}x</td>
                    <td className="py-3">
                      <button
                        onClick={() => onClosePosition(position.symbol, position.side, position.size)}
                        className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm"
                      >
                        Close
                      </button>
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
