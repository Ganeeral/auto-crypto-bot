import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ScheduleModule } from "@nestjs/schedule";
import { BybitModule } from "./modules/bybit/bybit.module";
import { StrategyModule } from "./modules/strategy/entities/strategy.module";
import { AiModule } from "./modules/ai/ai.module";
import { TradeModule } from "./modules/trade/entities/trade.module";
import { WebsocketModule } from "./modules/websocket/websocket.module";

@Module({
  imports: [
    // Конфигурация
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),

    // База данных PostgreSQL
    TypeOrmModule.forRoot({
      type: "postgres",
      host: process.env.DATABASE_HOST || "localhost",
      port: parseInt(process.env.DATABASE_PORT) || 5432,
      username: process.env.POSTGRES_USER || "postgres",
      password: process.env.POSTGRES_PASSWORD || "postgres",
      database: process.env.POSTGRES_DB || "trading_bot",
      entities: [__dirname + "/**/*.entity{.ts,.js}"],
      synchronize: true, // В production ставь false и используй миграции
    }),

    // Планировщик для автоматических задач
    ScheduleModule.forRoot(),

    // Модули приложения
    BybitModule,
    StrategyModule,
    AiModule,
    TradeModule,
    WebsocketModule,
  ],
})
export class AppModule {}
