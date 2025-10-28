import { Module } from "@nestjs/common";
import { StrategyService } from "./strategy.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Strategy } from "./strategy.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Strategy])],
  providers: [StrategyService],
  exports: [StrategyService],
})
export class StrategyModule {}
