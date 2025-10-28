import { Module } from "@nestjs/common";
import { BybitService } from "./bybit.service";
import { BybitController } from "./bybit.controller";

@Module({
  providers: [BybitService],
  controllers: [BybitController],
  exports: [BybitService],
})
export class BybitModule {}
