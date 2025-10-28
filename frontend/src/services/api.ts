import axios from "axios";

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });

export async function getBalance() {
  return api.get("/bybit/balance");
}

export async function placeOrder(symbol, side, qty) {
  return api.post("/bybit/order", { symbol, side, qty });
}
