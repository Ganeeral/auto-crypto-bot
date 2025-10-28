import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

interface MarketUpdate {
  data: any;
}

interface TradeExecuted {
  trade: any;
  aiDecision: any;
  indicators: any;
}

interface BalanceUpdate {
  balance: any;
}

export function useWebSocket(url?: string) {
  const [connected, setConnected] = useState(false);
  const [marketUpdate, setMarketUpdate] = useState<MarketUpdate | null>(null);
  const [tradeExecuted, setTradeExecuted] = useState<TradeExecuted | null>(null);
  const [balanceUpdate, setBalanceUpdate] = useState<BalanceUpdate | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const wsUrl = url || import.meta.env.VITE_WS_URL || "http://localhost:3000";

  useEffect(() => {
    socketRef.current = io(wsUrl);

    socketRef.current.on("connect", () => {
      console.log("WebSocket connected");
      setConnected(true);
    });

    socketRef.current.on("disconnect", () => {
      console.log("WebSocket disconnected");
      setConnected(false);
    });

    socketRef.current.on("marketUpdate", (data) => {
      setMarketUpdate(data);
    });

    socketRef.current.on("tradeExecuted", (data) => {
      setTradeExecuted(data);
    });

    socketRef.current.on("balanceUpdate", (data) => {
      setBalanceUpdate(data);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [wsUrl]);

  return { 
    connected, 
    marketUpdate, 
    tradeExecuted, 
    balanceUpdate,
    socket: socketRef.current 
  };
}
