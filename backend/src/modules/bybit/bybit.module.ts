import { Module } from "@nestjs/common";
import { BybitService } from "./bybit.service";
import { BybitController } from "./bybit.controller";
import { WebsocketModule } from "../websocket/websocket.module";

@Module({
  imports: [WebsocketModule],
  providers: [BybitService],
  controllers: [BybitController],
  exports: [BybitService],
})
export class BybitModule {}
