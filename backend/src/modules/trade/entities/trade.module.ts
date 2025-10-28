import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TradeService } from "./trade.service";
import { Trade } from "../entities/trade.entity";
import { Strategy } from "../../strategy/entities/strategy.entity";
import { BybitModule } from "../../bybit/bybit.module";
import { StrategyModule } from "../../strategy/entities/strategy.module";
import { AiModule } from "../../ai/ai.module";
import { WebsocketModule } from "../../websocket/websocket.module";
import { TradeController } from "./trade.controller";

@Module({
  imports: [
    TypeOrmModule.forFeature([Trade, Strategy]),
    BybitModule,
    StrategyModule,
    AiModule,
    WebsocketModule,
  ],
  providers: [TradeService],
  controllers: [TradeController],
  exports: [TradeService],
})
export class TradeModule {}
