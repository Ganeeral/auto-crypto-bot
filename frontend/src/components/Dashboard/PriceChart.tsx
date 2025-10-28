import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { bybitApi } from "../../services/api";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface PriceChartProps {
  symbol: string;
}

export function PriceChart({ symbol }: PriceChartProps) {
  const [chartData, setChartData] = useState<any>(null);
  const [timeframe, setTimeframe] = useState("15");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchKlineData();
    const intervalId = setInterval(() => fetchKlineData(), 30000);
    return () => clearInterval(intervalId);
  }, [symbol, timeframe]);

  const fetchKlineData = async () => {
    try {
      const response = await bybitApi.getKline(symbol, timeframe, 100);
      const klines = response.data;

      const labels = klines.map((k: any) => 
        new Date(k.start).toLocaleTimeString()
      ).reverse();
      
      const prices = klines.map((k: any) => parseFloat(k.close)).reverse();

      setChartData({
        labels,
        datasets: [
          {
            label: `${symbol} Price`,
            data: prices,
            borderColor: "rgb(59, 130, 246)",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            fill: true,
            tension: 0.4,
          },
        ],
      });
      setLoading(false);
    } catch (error) {
      console.error("Error fetching kline data:", error);
      setLoading(false);
    }
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: {
          color: "#fff",
        },
      },
      title: {
        display: true,
        text: `${symbol} Price Chart`,
        color: "#fff",
        font: {
          size: 18,
        },
      },
    },
    scales: {
      y: {
        ticks: { color: "#9ca3af" },
        grid: { color: "rgba(75, 85, 99, 0.3)" },
      },
      x: {
        ticks: { color: "#9ca3af" },
        grid: { color: "rgba(75, 85, 99, 0.3)" },
      },
    },
  };

  if (loading || !chartData) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 shadow-lg h-96 flex items-center justify-center">
        <p className="text-gray-400">Loading chart...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">📊 Price Chart</h2>
        <div className="flex space-x-2">
          {["1", "5", "15", "60", "240"].map((int) => (
            <button
              key={int}
              onClick={() => setTimeframe(int)}
              className={`px-3 py-1 rounded ${
                timeframe === int
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              {int}m
            </button>
          ))}
        </div>
      </div>
      <div className="h-96">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
