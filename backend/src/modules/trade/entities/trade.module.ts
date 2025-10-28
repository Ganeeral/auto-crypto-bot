import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TradeService } from "./trade.service";
import { Trade } from "../entities/trade.entity";
import { BybitModule } from "../../bybit/bybit.module";
import { StrategyModule } from "../../strategy/entities/strategy.module";
import { AiModule } from "../../ai/ai.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Trade]),
    BybitModule,
    StrategyModule,
    AiModule,
  ],
  providers: [TradeService],
  exports: [TradeService],
})
export class TradeModule {}
