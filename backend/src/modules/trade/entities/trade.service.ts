import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { BybitService } from "../../bybit/bybit.service";
import { StrategyService } from "../../strategy/entities/strategy.service";
import { AiService } from "../../ai/ai.service";
import { Trade } from "../entities/trade.entity";

@Injectable()
export class TradeService {
  private readonly logger = new Logger(TradeService.name);

  constructor(
    @InjectRepository(Trade) private tradeRepo: Repository<Trade>,
    private bybitService: BybitService,
    private strategyService: StrategyService,
    private aiService: AiService
  ) {}

  async executeStrategy(symbol: string, strategyType: string) {
    // 1. Получить данные рынка через BybitService
    // 2. Считать индикаторы через StrategyService
    // 3. Запросить сигнал у AI через AiService
    // 4. Если confidence > 70, выставить ордер через BybitService
    // 5. Сохранить ордер через this.tradeRepo.save()
  }

  // ... другие методы для истории сделок, принудительного закрытия и т.д.
}
