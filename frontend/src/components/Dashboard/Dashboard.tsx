import { useState, useEffect } from "react";
import { bybitApi, tradeApi } from "../../services/api";
import { BalanceCard } from "./BalanceCard";
import { PositionsCard } from "./PositionsCard";
import { TradesTable } from "./TradesTable";
import { StatsCard } from "./StatsCard";
import { PriceChart } from "./PriceChart";
import { useWebSocket } from "../../hooks/useWebSocket";

export default function Dashboard() {
  const [balance, setBalance] = useState<any>(null);
  const [positions, setPositions] = useState<any[]>([]);
  const [trades, setTrades] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSymbol, setSelectedSymbol] = useState("BTCUSDT");

  const { connected, tradeExecuted, balanceUpdate } = useWebSocket();

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Обновление каждые 10 секунд
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (tradeExecuted) {
      fetchData();
    }
  }, [tradeExecuted]);

  useEffect(() => {
    if (balanceUpdate) {
      setBalance(balanceUpdate.balance);
    }
  }, [balanceUpdate]);

  const fetchData = async () => {
    try {
      const [balanceRes, positionsRes, tradesRes, statsRes] = await Promise.all([
        bybitApi.getBalance(),
        bybitApi.getPositions(),
        tradeApi.getAll(50),
        tradeApi.getStats(),
      ]);

      setBalance(balanceRes.data);
      setPositions(positionsRes.data);
      setTrades(tradesRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseTrade = async (tradeId: number) => {
    try {
      await tradeApi.close(tradeId);
      fetchData();
    } catch (error) {
      console.error("Error closing trade:", error);
    }
  };

  const handleClosePosition = async (symbol: string, side: string, qty: string) => {
    try {
      await bybitApi.closePosition(symbol, side as "Buy" | "Sell", qty);
      fetchData();
    } catch (error) {
      console.error("Error closing position:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">🤖 Bybit Trading Bot</h1>
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${connected ? 'bg-green-900' : 'bg-red-900'}`}>
              <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
              <span>{connected ? 'Connected' : 'Disconnected'}</span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <BalanceCard balance={balance} />
          <StatsCard 
            title="Total Trades" 
            value={stats?.totalTrades || 0} 
            icon="📊"
            color="blue"
          />
          <StatsCard 
            title="Win Rate" 
            value={`${stats?.winRate || 0}%`} 
            icon="🎯"
            color="green"
          />
          <StatsCard 
            title="Total P&L" 
            value={`${stats?.totalPnl || 0} USDT`} 
            icon="💰"
            color={parseFloat(stats?.totalPnl || 0) >= 0 ? 'green' : 'red'}
          />
        </div>

        {/* Price Chart */}
        <div className="mb-8">
          <PriceChart symbol={selectedSymbol} />
        </div>

        {/* Open Positions */}
        <div className="mb-8">
          <PositionsCard 
            positions={positions} 
            onClosePosition={handleClosePosition}
          />
        </div>

        {/* Recent Trades */}
        <div>
          <TradesTable 
            trades={trades} 
            onCloseTrade={handleCloseTrade}
          />
        </div>
      </div>
    </div>
  );
}
