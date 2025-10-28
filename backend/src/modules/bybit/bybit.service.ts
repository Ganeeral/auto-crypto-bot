import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { RestClientV5, WebsocketClient, KlineIntervalV3 } from "bybit-api";
import { PositionIdx } from "bybit-api";
import { WebsocketGateway } from "../websocket/websocket.gateway";

export interface KlineData {
  start: number;
  end: number;
  interval: string;
  open: string;
  close: string;
  high: string;
  low: string;
  volume: string;
  turnover: string;
}

@Injectable()
export class BybitService implements OnModuleInit {
  private readonly logger = new Logger(BybitService.name);
  private client: RestClientV5;
  private wsClient: WebsocketClient;

  constructor(
    private configService: ConfigService,
    private websocketGateway: WebsocketGateway
  ) {
    const isTestnet = this.configService.get("BYBIT_USE_DEMO") === "true";

    this.client = new RestClientV5({
      key: this.configService.get("BYBIT_API_KEY"),
      secret: this.configService.get("BYBIT_API_SECRET"),
      testnet: isTestnet,
    });

    this.wsClient = new WebsocketClient({
      key: this.configService.get("BYBIT_API_KEY"),
      secret: this.configService.get("BYBIT_API_SECRET"),
      market: "v5",
      testnet: isTestnet,
    });
  }

  async onModuleInit() {
    this.setupWebSocket();
  }

  private setupWebSocket() {
    this.wsClient.on("update", (data) => {
      this.logger.debug(`WS Update: ${JSON.stringify(data)}`);
      this.websocketGateway.sendMarketUpdate(data);
    });

    this.wsClient.on("exception" as any, (error: any) => {
      this.logger.error("WebSocket error", error);
    });
  }

  subscribeToTicker(symbol: string) {
    this.wsClient.subscribe([`tickers.${symbol}`]);
    this.logger.log(`Subscribed to ticker: ${symbol}`);
  }

  subscribeToKline(symbol: string, interval: KlineIntervalV3 = "15") {
    this.wsClient.subscribe([`kline.${interval}.${symbol}`]);
    this.logger.log(`Subscribed to kline: ${symbol} ${interval}m`);
  }

  async getKlineData(
    symbol: string,
    interval: KlineIntervalV3 = "15",
    limit: number = 200
  ): Promise<KlineData[]> {
    try {
      const response = await this.client.getKline({
        category: "linear",
        symbol,
        interval,
        limit,
      });
      return response.result.list.map((k: any) => ({
        start: parseInt(k[0]),
        open: k[1],
        high: k[2],
        low: k[3],
        close: k[4],
        volume: k[5],
        turnover: k[6],
        interval,
        end: parseInt(k[0]),
      }));
    } catch (error) {
      this.logger.error("Failed to get kline data", error);
      throw error;
    }
  }

  async getAccountInfo() {
    try {
      const response = await this.client.getWalletBalance({
        accountType: "UNIFIED",
      });
      this.logger.log("Account info retrieved");
      return response.result;
    } catch (error) {
      this.logger.error("Failed to get account info", error);
      throw error;
    }
  }

  async getCurrentPrice(symbol: string): Promise<number> {
    try {
      const response = await this.client.getTickers({
        category: "linear",
        symbol,
      });
      return parseFloat(response.result.list[0].lastPrice);
    } catch (error) {
      this.logger.error("Failed to get current price", error);
      throw error;
    }
  }

  async placeOrder(
    symbol: string,
    side: "Buy" | "Sell",
    qty: string,
    orderType: "Market" | "Limit" = "Market",
    price?: string
  ) {
    try {
      const orderParams: any = {
        category: "linear",
        symbol,
        side,
        orderType,
        qty,
        timeInForce: orderType === "Market" ? "IOC" : "GTC",
      };

      if (orderType === "Limit" && price) {
        orderParams.price = price;
      }

      const response = await this.client.submitOrder(orderParams);
      this.logger.log(`Order placed: ${side} ${qty} ${symbol}`);
      return response.result;
    } catch (error) {
      this.logger.error("Failed to place order", error);
      throw error;
    }
  }

  async setLeverage(symbol: string, leverage: string) {
    try {
      const response = await this.client.setLeverage({
        category: "linear",
        symbol,
        buyLeverage: leverage,
        sellLeverage: leverage,
      });
      this.logger.log(`Leverage set to ${leverage}x for ${symbol}`);
      return response.result;
    } catch (error) {
      this.logger.error("Failed to set leverage", error);
      throw error;
    }
  }

  async setStopLoss(
    symbol: string,
    side: "Buy" | "Sell",
    stopLoss: string,
    positionIdx: PositionIdx = 0
  ) {
    try {
      const response = await this.client.setTradingStop({
        category: "linear",
        symbol,
        stopLoss,
        positionIdx,
      });
      this.logger.log(`Stop loss set: ${stopLoss} for ${symbol}`);
      return response.result;
    } catch (error) {
      this.logger.error("Failed to set stop loss", error);
      throw error;
    }
  }

  async getPositions(symbol?: string) {
    try {
      const params: any = {
        category: "linear",
      };
      if (symbol) params.symbol = symbol;

      const response = await this.client.getPositionInfo(params);
      return response.result.list;
    } catch (error) {
      this.logger.error("Failed to get positions", error);
      throw error;
    }
  }

  async closePosition(symbol: string, side: "Buy" | "Sell", qty: string) {
    const closeSide = side === "Buy" ? "Sell" : "Buy";
    return this.placeOrder(symbol, closeSide, qty);
  }

  async getOpenOrders(symbol?: string) {
    try {
      const params: any = {
        category: "linear",
      };
      if (symbol) params.symbol = symbol;

      const response = await this.client.getActiveOrders(params);
      return response.result.list;
    } catch (error) {
      this.logger.error("Failed to get open orders", error);
      throw error;
    }
  }

  async cancelOrder(symbol: string, orderId: string) {
    try {
      const response = await this.client.cancelOrder({
        category: "linear",
        symbol,
        orderId,
      });
      this.logger.log(`Order cancelled: ${orderId}`);
      return response.result;
    } catch (error) {
      this.logger.error("Failed to cancel order", error);
      throw error;
    }
  }

  async cancelAllOrders(symbol?: string) {
    try {
      const params: any = {
        category: "linear",
      };
      if (symbol) params.symbol = symbol;

      const response = await this.client.cancelAllOrders(params);
      this.logger.log(`All orders cancelled${symbol ? ` for ${symbol}` : ""}`);
      return response.result;
    } catch (error) {
      this.logger.error("Failed to cancel all orders", error);
      throw error;
    }
  }

  async getTradeHistory(symbol?: string, limit: number = 50) {
    try {
      const params: any = {
        category: "linear",
        limit,
      };
      if (symbol) params.symbol = symbol;

      const response = await this.client.getHistoricOrders(params);
      return response.result.list;
    } catch (error) {
      this.logger.error("Failed to get trade history", error);
      throw error;
    }
  }
}
