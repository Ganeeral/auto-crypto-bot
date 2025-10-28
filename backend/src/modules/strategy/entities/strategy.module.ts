import { Module } from "@nestjs/common";
import { StrategyService } from "./strategy.service";
import { StrategyController } from "./strategy.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Strategy } from "./strategy.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Strategy])],
  providers: [StrategyService],
  controllers: [StrategyController],
  exports: [StrategyService],
})
export class StrategyModule {}
