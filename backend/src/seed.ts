import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { Repository } from "typeorm";
import { Strategy } from "./modules/strategy/entities/strategy.entity";
import { getRepositoryToken } from "@nestjs/typeorm";

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const strategyRepo: Repository<Strategy> = app.get(
    getRepositoryToken(Strategy)
  );

  console.log("🌱 Seeding database...");

  // Создание примеров стратегий
  const strategies = [
    {
      name: "BTC Scalping",
      type: "scalping",
      isActive: false,
      symbols: ["BTCUSDT"],
      timeframe: "5",
      riskPercentage: 1.0,
      maxPositions: 2,
      stopLossPercentage: 1.5,
      takeProfitPercentage: 3.0,
      useAiConfirmation: true,
      minAiConfidence: 75,
      indicators: {
        rsiPeriod: 14,
        rsiOversold: 30,
        rsiOverbought: 70,
        emaShort: 9,
        emaLong: 21,
        macdFast: 12,
        macdSlow: 26,
        macdSignal: 9,
      },
    },
    {
      name: "ETH Trend Following",
      type: "trend",
      isActive: false,
      symbols: ["ETHUSDT"],
      timeframe: "15",
      riskPercentage: 1.5,
      maxPositions: 3,
      stopLossPercentage: 2.0,
      takeProfitPercentage: 5.0,
      useAiConfirmation: true,
      minAiConfidence: 70,
      indicators: {
        rsiPeriod: 14,
        rsiOversold: 35,
        rsiOverbought: 65,
        emaShort: 9,
        emaLong: 21,
        macdFast: 12,
        macdSlow: 26,
        macdSignal: 9,
      },
    },
    {
      name: "Multi-Asset Medium Term",
      type: "medium-term",
      isActive: false,
      symbols: ["BTCUSDT", "ETHUSDT", "SOLUSDT"],
      timeframe: "60",
      riskPercentage: 2.0,
      maxPositions: 5,
      stopLossPercentage: 3.0,
      takeProfitPercentage: 8.0,
      useAiConfirmation: true,
      minAiConfidence: 65,
      indicators: {
        rsiPeriod: 14,
        rsiOversold: 40,
        rsiOverbought: 60,
        emaShort: 12,
        emaLong: 26,
        macdFast: 12,
        macdSlow: 26,
        macdSignal: 9,
      },
    },
  ];

  for (const strategyData of strategies) {
    const exists = await strategyRepo.findOne({
      where: { name: strategyData.name },
    });

    if (!exists) {
      const strategy = strategyRepo.create(strategyData);
      await strategyRepo.save(strategy);
      console.log(`✅ Created strategy: ${strategyData.name}`);
    } else {
      console.log(`⏭️  Strategy already exists: ${strategyData.name}`);
    }
  }

  console.log("✨ Seeding completed!");
  await app.close();
}

seed().catch((error) => {
  console.error("❌ Seeding failed:", error);
  process.exit(1);
});
