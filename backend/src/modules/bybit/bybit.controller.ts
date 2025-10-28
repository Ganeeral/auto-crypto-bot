import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Delete,
} from "@nestjs/common";
import { KlineIntervalV3 } from "bybit-api";
import { BybitService } from "./bybit.service";

@Controller("api/bybit")
export class BybitController {
  constructor(private readonly bybitService: BybitService) {}

  @Get("balance")
  async getBalance() {
    return this.bybitService.getAccountInfo();
  }

  @Get("positions")
  async getPositions(@Query("symbol") symbol?: string) {
    return this.bybitService.getPositions(symbol);
  }

  @Get("orders")
  async getOpenOrders(@Query("symbol") symbol?: string) {
    return this.bybitService.getOpenOrders(symbol);
  }

  @Get("history")
  async getTradeHistory(
    @Query("symbol") symbol?: string,
    @Query("limit") limit: number = 50
  ) {
    return this.bybitService.getTradeHistory(symbol, limit);
  }

  @Get("kline/:symbol")
  async getKlineData(
    @Param("symbol") symbol: string,
    @Query("interval") interval: KlineIntervalV3 = "15",
    @Query("limit") limit: number = 200
  ) {
    return this.bybitService.getKlineData(symbol, interval, limit);
  }

  @Get("price/:symbol")
  async getCurrentPrice(@Param("symbol") symbol: string) {
    const price = await this.bybitService.getCurrentPrice(symbol);
    return { symbol, price };
  }

  @Post("order")
  async placeOrder(
    @Body()
    body: {
      symbol: string;
      side: "Buy" | "Sell";
      qty: string;
      orderType?: "Market" | "Limit";
      price?: string;
    }
  ) {
    return this.bybitService.placeOrder(
      body.symbol,
      body.side,
      body.qty,
      body.orderType || "Market",
      body.price
    );
  }

  @Post("leverage")
  async setLeverage(@Body() body: { symbol: string; leverage: string }) {
    return this.bybitService.setLeverage(body.symbol, body.leverage);
  }

  @Post("stop-loss")
  async setStopLoss(
    @Body() body: { symbol: string; side: "Buy" | "Sell"; stopLoss: string }
  ) {
    return this.bybitService.setStopLoss(
      body.symbol,
      body.side,
      body.stopLoss
    );
  }

  @Post("close-position")
  async closePosition(
    @Body() body: { symbol: string; side: "Buy" | "Sell"; qty: string }
  ) {
    return this.bybitService.closePosition(body.symbol, body.side, body.qty);
  }

  @Delete("order/:symbol/:orderId")
  async cancelOrder(
    @Param("symbol") symbol: string,
    @Param("orderId") orderId: string
  ) {
    return this.bybitService.cancelOrder(symbol, orderId);
  }

  @Delete("orders")
  async cancelAllOrders(@Query("symbol") symbol?: string) {
    return this.bybitService.cancelAllOrders(symbol);
  }

  @Post("subscribe")
  async subscribe(@Body() body: { symbol: string; type: string }) {
    if (body.type === "ticker") {
      this.bybitService.subscribeToTicker(body.symbol);
    } else if (body.type === "kline") {
      this.bybitService.subscribeToKline(body.symbol);
    }
    return { success: true, message: `Subscribed to ${body.type}` };
  }
}
