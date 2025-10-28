import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
} from "@nestjs/common";
import { TradeService } from "./trade.service";

@Controller("api/trades")
export class TradeController {
  constructor(private readonly tradeService: TradeService) {}

  @Get()
  async getAllTrades(@Query("limit") limit: number = 100) {
    return this.tradeService.getAllTrades(limit);
  }

  @Get("stats")
  async getTradeStats() {
    return this.tradeService.getTradeStats();
  }

  @Get("symbol/:symbol")
  async getTradesBySymbol(
    @Param("symbol") symbol: string,
    @Query("limit") limit: number = 50
  ) {
    return this.tradeService.getTradesBySymbol(symbol, limit);
  }

  @Post(":id/close")
  async closeTrade(@Param("id") id: number) {
    return this.tradeService.closeTrade(id);
  }

  @Delete(":id/cancel")
  async cancelTrade(@Param("id") id: number) {
    return this.tradeService.cancelTrade(id);
  }

  @Post("execute")
  async manualExecute(
    @Body() body: { strategyId: number; symbol: string }
  ) {
    // Здесь можно добавить логику для ручного запуска стратегии
    return { success: true, message: "Strategy execution requested" };
  }
}
