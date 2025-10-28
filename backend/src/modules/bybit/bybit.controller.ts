import { Controller, Get, Post, Body, Delete, Param } from "@nestjs/common";
import { BybitService } from "./bybit.service";

@Controller("bybit")
export class BybitController {
  constructor(private bybitService: BybitService) {}

  @Get("balance")
  async getBalance() {
    return this.bybitService.getAccountInfo();
  }

  @Get("positions")
  async getPositions() {
    return this.bybitService.getPositions();
  }

  @Post("order")
  async createOrder(
    @Body() body: { symbol: string; side: "Buy" | "Sell"; qty: string }
  ) {
    return this.bybitService.placeOrder(body.symbol, body.side, body.qty);
  }

  @Delete("order/:symbol/:orderId")
  async cancelOrder(
    @Param("symbol") symbol: string,
    @Param("orderId") orderId: string
  ) {
    return this.bybitService.cancelOrder(symbol, orderId);
  }
}
