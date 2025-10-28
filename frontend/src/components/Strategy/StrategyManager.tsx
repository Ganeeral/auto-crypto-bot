import { useState, useEffect } from "react";
import { strategyApi } from "../../services/api";

interface Strategy {
  id: number;
  name: string;
  type: string;
  isActive: boolean;
  symbols: string[];
  timeframe: string;
  riskPercentage: number;
  maxPositions: number;
  stopLossPercentage: number;
  takeProfitPercentage: number;
  useAiConfirmation: boolean;
  minAiConfidence: number;
}

export default function StrategyManager() {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStrategies();
  }, []);

  const fetchStrategies = async () => {
    try {
      const response = await strategyApi.getAll();
      setStrategies(response.data);
    } catch (error) {
      console.error("Error fetching strategies:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (id: number, isActive: boolean) => {
    try {
      if (isActive) {
        await strategyApi.deactivate(id);
      } else {
        await strategyApi.activate(id);
      }
      fetchStrategies();
    } catch (error) {
      console.error("Error toggling strategy:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this strategy?")) {
      try {
        await strategyApi.delete(id);
        fetchStrategies();
      } catch (error) {
        console.error("Error deleting strategy:", error);
      }
    }
  };

  const handleCreate = async (formData: Partial<Strategy>) => {
    try {
      await strategyApi.create(formData);
      setShowCreateForm(false);
      fetchStrategies();
    } catch (error) {
      console.error("Error creating strategy:", error);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading strategies...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">⚙️ Strategy Manager</h1>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold"
          >
            + Create New Strategy
          </button>
        </div>

        {showCreateForm && (
          <CreateStrategyForm
            onClose={() => setShowCreateForm(false)}
            onCreate={handleCreate}
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {strategies.map((strategy) => (
            <div
              key={strategy.id}
              className={`bg-gray-800 rounded-lg p-6 shadow-lg border-2 ${
                strategy.isActive ? "border-green-500" : "border-gray-700"
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold">{strategy.name}</h3>
                  <p className="text-sm text-gray-400 capitalize">{strategy.type}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded text-sm ${
                    strategy.isActive
                      ? "bg-green-900 text-green-200"
                      : "bg-gray-700 text-gray-300"
                  }`}
                >
                  {strategy.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Symbols:</span>
                  <span>{strategy.symbols.join(", ")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Timeframe:</span>
                  <span>{strategy.timeframe}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Risk:</span>
                  <span>{strategy.riskPercentage}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Max Positions:</span>
                  <span>{strategy.maxPositions}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Stop Loss:</span>
                  <span>{strategy.stopLossPercentage}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Take Profit:</span>
                  <span>{strategy.takeProfitPercentage}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">AI Confirmation:</span>
                  <span>{strategy.useAiConfirmation ? "Yes" : "No"}</span>
                </div>
                {strategy.useAiConfirmation && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Min AI Confidence:</span>
                    <span>{strategy.minAiConfidence}%</span>
                  </div>
                )}
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleActivate(strategy.id, strategy.isActive)}
                  className={`flex-1 px-4 py-2 rounded ${
                    strategy.isActive
                      ? "bg-yellow-600 hover:bg-yellow-700"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {strategy.isActive ? "Deactivate" : "Activate"}
                </button>
                <button
                  onClick={() => handleDelete(strategy.id)}
                  className="px-4 py-2 rounded bg-red-600 hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {strategies.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No strategies created yet</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="mt-4 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg"
            >
              Create Your First Strategy
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function CreateStrategyForm({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (data: Partial<Strategy>) => void;
}) {
  const [formData, setFormData] = useState({
    name: "",
    type: "scalping",
    symbols: ["BTCUSDT"],
    timeframe: "15m",
    riskPercentage: 1.0,
    maxPositions: 3,
    stopLossPercentage: 2.0,
    takeProfitPercentage: 5.0,
    useAiConfirmation: true,
    minAiConfidence: 70,
    indicators: {
      rsiPeriod: 14,
      rsiOversold: 30,
      rsiOverbought: 70,
      emaShort: 9,
      emaLong: 21,
      macdFast: 12,
      macdSlow: 26,
      macdSignal: 9,
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">Create New Strategy</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Strategy Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-gray-700 rounded px-4 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Strategy Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full bg-gray-700 rounded px-4 py-2"
            >
              <option value="scalping">Scalping</option>
              <option value="trend">Trend Following</option>
              <option value="medium-term">Medium Term</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Timeframe</label>
            <select
              value={formData.timeframe}
              onChange={(e) => setFormData({ ...formData, timeframe: e.target.value })}
              className="w-full bg-gray-700 rounded px-4 py-2"
            >
              <option value="1">1 minute</option>
              <option value="5">5 minutes</option>
              <option value="15">15 minutes</option>
              <option value="60">1 hour</option>
              <option value="240">4 hours</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Risk %</label>
              <input
                type="number"
                step="0.1"
                value={formData.riskPercentage}
                onChange={(e) =>
                  setFormData({ ...formData, riskPercentage: parseFloat(e.target.value) })
                }
                className="w-full bg-gray-700 rounded px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Max Positions</label>
              <input
                type="number"
                value={formData.maxPositions}
                onChange={(e) =>
                  setFormData({ ...formData, maxPositions: parseInt(e.target.value) })
                }
                className="w-full bg-gray-700 rounded px-4 py-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Stop Loss %</label>
              <input
                type="number"
                step="0.1"
                value={formData.stopLossPercentage}
                onChange={(e) =>
                  setFormData({ ...formData, stopLossPercentage: parseFloat(e.target.value) })
                }
                className="w-full bg-gray-700 rounded px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Take Profit %</label>
              <input
                type="number"
                step="0.1"
                value={formData.takeProfitPercentage}
                onChange={(e) =>
                  setFormData({ ...formData, takeProfitPercentage: parseFloat(e.target.value) })
                }
                className="w-full bg-gray-700 rounded px-4 py-2"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.useAiConfirmation}
              onChange={(e) =>
                setFormData({ ...formData, useAiConfirmation: e.target.checked })
              }
              className="w-5 h-5"
            />
            <label className="text-sm font-medium">Use AI Confirmation</label>
          </div>

          {formData.useAiConfirmation && (
            <div>
              <label className="block text-sm font-medium mb-2">Min AI Confidence %</label>
              <input
                type="number"
                value={formData.minAiConfidence}
                onChange={(e) =>
                  setFormData({ ...formData, minAiConfidence: parseInt(e.target.value) })
                }
                className="w-full bg-gray-700 rounded px-4 py-2"
              />
            </div>
          )}

          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold"
            >
              Create Strategy
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-lg font-semibold"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
