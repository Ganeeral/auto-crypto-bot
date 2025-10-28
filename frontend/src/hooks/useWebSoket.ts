import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

export function useSocket(url: string) {
  const [marketUpdate, setMarketUpdate] = useState(null);
  const [tradeExecuted, setTradeExecuted] = useState(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketRef.current = io(url);

    socketRef.current.on("marketUpdate", setMarketUpdate);
    socketRef.current.on("tradeExecuted", setTradeExecuted);

    return () => {
      socketRef.current?.disconnect();
    };
  }, [url]);

  return { marketUpdate, tradeExecuted };
}
