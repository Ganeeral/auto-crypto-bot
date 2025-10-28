import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Bybit API
export const bybitApi = {
  getBalance: () => api.get("/api/bybit/balance"),
  getPositions: (symbol?: string) => 
    api.get("/api/bybit/positions", { params: { symbol } }),
  getOrders: (symbol?: string) => 
    api.get("/api/bybit/orders", { params: { symbol } }),
  getHistory: (symbol?: string, limit?: number) =>
    api.get("/api/bybit/history", { params: { symbol, limit } }),
  getKline: (symbol: string, interval?: string, limit?: number) =>
    api.get(`/api/bybit/kline/${symbol}`, { params: { interval, limit } }),
  getPrice: (symbol: string) => api.get(`/api/bybit/price/${symbol}`),
  placeOrder: (data: {
    symbol: string;
    side: "Buy" | "Sell";
    qty: string;
    orderType?: "Market" | "Limit";
    price?: string;
  }) => api.post("/api/bybit/order", data),
  setLeverage: (symbol: string, leverage: string) =>
    api.post("/api/bybit/leverage", { symbol, leverage }),
  closePosition: (symbol: string, side: "Buy" | "Sell", qty: string) =>
    api.post("/api/bybit/close-position", { symbol, side, qty }),
  cancelOrder: (symbol: string, orderId: string) =>
    api.delete(`/api/bybit/order/${symbol}/${orderId}`),
  cancelAllOrders: (symbol?: string) =>
    api.delete("/api/bybit/orders", { params: { symbol } }),
  subscribe: (symbol: string, type: string) =>
    api.post("/api/bybit/subscribe", { symbol, type }),
};

// Strategy API
export const strategyApi = {
  getAll: () => api.get("/api/strategies"),
  getById: (id: number) => api.get(`/api/strategies/${id}`),
  create: (data: any) => api.post("/api/strategies", data),
  update: (id: number, data: any) => api.put(`/api/strategies/${id}`, data),
  delete: (id: number) => api.delete(`/api/strategies/${id}`),
  activate: (id: number) => api.post(`/api/strategies/${id}/activate`),
  deactivate: (id: number) => api.post(`/api/strategies/${id}/deactivate`),
};

// Trade API
export const tradeApi = {
  getAll: (limit?: number) => api.get("/api/trades", { params: { limit } }),
  getStats: () => api.get("/api/trades/stats"),
  getBySymbol: (symbol: string, limit?: number) =>
    api.get(`/api/trades/symbol/${symbol}`, { params: { limit } }),
  close: (id: number) => api.post(`/api/trades/${id}/close`),
  cancel: (id: number) => api.delete(`/api/trades/${id}/cancel`),
};

export default api;
