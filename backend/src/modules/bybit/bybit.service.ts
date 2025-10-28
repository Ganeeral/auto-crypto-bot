import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { RestClientV5 } from "bybit-api";

@Injectable()
export class BybitService {
  private readonly logger = new Logger(BybitService.name);
  private client: RestClientV5;

  constructor(private configService: ConfigService) {
    this.client = new RestClientV5({
      key: this.configService.get("BYBIT_API_KEY"),
      secret: this.configService.get("BYBIT_API_SECRET"),
      testnet: this.configService.get("BYBIT_USE_DEMO") === "true",
    });
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

  async placeOrder(symbol: string, side: "Buy" | "Sell", qty: string) {
    try {
      const response = await this.client.submitOrder({
        category: "linear",
        symbol,
        side,
        orderType: "Market",
        qty,
        timeInForce: "IOC",
      });
      this.logger.log(`Order placed: ${side} ${qty} ${symbol}`);
      return response.result;
    } catch (error) {
      this.logger.error("Failed to place order", error);
      throw error;
    }
  }

  async getPositions() {
    try {
      const response = await this.client.getPositionInfo({
        category: "linear",
      });
      return response.result.list;
    } catch (error) {
      this.logger.error("Failed to get positions", error);
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
}
