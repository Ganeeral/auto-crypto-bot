import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Cron, CronExpression } from "@nestjs/schedule";
import { BybitService } from "../../bybit/bybit.service";
import { StrategyService, MarketData } from "../../strategy/entities/strategy.service";
import { AiService } from "../../ai/ai.service";
import { Trade } from "../entities/trade.entity";
import { Strategy } from "../../strategy/entities/strategy.entity";
import { WebsocketGateway } from "../../websocket/websocket.gateway";

@Injectable()
export class TradeService {
  private readonly logger = new Logger(TradeService.name);
  private activeStrategies: Map<number, boolean> = new Map();

  constructor(
    @InjectRepository(Trade) private tradeRepo: Repository<Trade>,
    @InjectRepository(Strategy) private strategyRepo: Repository<Strategy>,
    private bybitService: BybitService,
    private strategyService: StrategyService,
    private aiService: AiService,
    private websocketGateway: WebsocketGateway
  ) {}

  // Автоматический запуск стратегий каждую минуту
  @Cron(CronExpression.EVERY_MINUTE)
  async runActiveStrategies() {
    const strategies = await this.strategyRepo.find({ where: { isActive: true } });
    
    for (const strategy of strategies) {
      if (!this.activeStrategies.get(strategy.id)) {
        this.activeStrategies.set(strategy.id, true);
        
        for (const symbol of strategy.symbols) {
          try {
            await this.executeStrategy(strategy, symbol);
          } catch (error) {
            this.logger.error(`Error executing strategy ${strategy.id} for ${symbol}`, error);
          }
        }
        
        this.activeStrategies.set(strategy.id, false);
      }
    }
  }

  async executeStrategy(strategy: Strategy, symbol: string) {
    this.logger.log(`Executing ${strategy.type} strategy for ${symbol}`);

    // 1. Получить исторические данные с Bybit
    const klineData = await this.bybitService.getKlineData(
      symbol,
      strategy.timeframe,
      200
    );

    if (!klineData || klineData.length < 50) {
      this.logger.warn(`Not enough data for ${symbol}`);
      return;
    }

    // 2. Преобразовать в MarketData
    const marketData: MarketData[] = klineData.map((k) => ({
      time: k.start,
      open: parseFloat(k.open),
      high: parseFloat(k.high),
      low: parseFloat(k.low),
      close: parseFloat(k.close),
      volume: parseFloat(k.volume),
    }));

    // 3. Рассчитать технические индикаторы
    const indicators = this.strategyService.calculateIndicators(marketData);
    const currentPrice = marketData[marketData.length - 1].close;

    // 4. Получить сигнал от стратегии
    let strategySignal: "LONG" | "SHORT" | "HOLD";
    if (strategy.type === "scalping") {
      strategySignal = this.strategyService.analyzeScalpingStrategy(
        indicators,
        currentPrice
      );
    } else {
      strategySignal = this.strategyService.analyzeTrendStrategy(
        indicators,
        currentPrice
      );
    }

    this.logger.log(`Strategy signal for ${symbol}: ${strategySignal}`);

    // 5. Если стратегия рекомендует торговать и включен AI
    if (strategySignal !== "HOLD" && strategy.useAiConfirmation) {
      const recentPrices = marketData.slice(-10).map((d) => d.close);
      const aiDecision = await this.aiService.getTradeDecision(
        symbol,
        currentPrice,
        indicators,
        recentPrices,
        strategySignal
      );

      this.logger.log(
        `AI Decision: ${aiDecision.action} (confidence: ${aiDecision.confidence}%)`
      );

      // 6. Проверить confidence
      if (aiDecision.confidence < strategy.minAiConfidence) {
        this.logger.log(
          `AI confidence too low (${aiDecision.confidence}% < ${strategy.minAiConfidence}%)`
        );
        return;
      }

      // 7. Проверить максимальное количество открытых позиций
      const openPositions = await this.bybitService.getPositions(symbol);
      const activePositions = openPositions.filter(
        (p: any) => parseFloat(p.size) > 0
      );

      if (activePositions.length >= strategy.maxPositions) {
        this.logger.log(`Max positions reached for ${symbol}`);
        return;
      }

      // 8. Рассчитать размер позиции на основе риск-менеджмента
      const accountInfo = await this.bybitService.getAccountInfo();
      const balance = parseFloat(
        accountInfo.list[0]?.totalAvailableBalance || "0"
      );
      
      const riskAmount = (balance * parseFloat(strategy.riskPercentage.toString())) / 100;
      const qty = (riskAmount / currentPrice).toFixed(3);

      // 9. Разместить ордер
      const side = aiDecision.action === "LONG" ? "Buy" : "Sell";
      
      try {
        const order = await this.bybitService.placeOrder(symbol, side, qty);

        // 10. Установить стоп-лосс и тейк-профит
        const stopLossPrice =
          side === "Buy"
            ? currentPrice * (1 - parseFloat(strategy.stopLossPercentage.toString()) / 100)
            : currentPrice * (1 + parseFloat(strategy.stopLossPercentage.toString()) / 100);

        await this.bybitService.setStopLoss(
          symbol,
          side,
          stopLossPrice.toFixed(2)
        );

        // 11. Сохранить сделку в базе данных
        const trade = this.tradeRepo.create({
          symbol,
          side,
          quantity: parseFloat(qty),
          price: currentPrice,
          orderId: order.orderId,
          confidence: aiDecision.confidence,
          reasoning: aiDecision.reasoning,
          status: "EXECUTED",
          executedAt: new Date(),
        });

        await this.tradeRepo.save(trade);

        // 12. Отправить уведомление через WebSocket
        this.websocketGateway.sendTradeExecuted({
          trade,
          aiDecision,
          indicators,
        });

        this.logger.log(
          `✅ Trade executed: ${side} ${qty} ${symbol} @ ${currentPrice}`
        );
      } catch (error) {
        this.logger.error(`Failed to execute trade for ${symbol}`, error);
        
        // Сохранить неудачную сделку
        const failedTrade = this.tradeRepo.create({
          symbol,
          side,
          quantity: parseFloat(qty),
          price: currentPrice,
          orderId: "FAILED",
          confidence: aiDecision.confidence,
          reasoning: `Failed: ${error.message}`,
          status: "FAILED",
        });
        
        await this.tradeRepo.save(failedTrade);
      }
    }
  }

  async getAllTrades(limit: number = 100): Promise<Trade[]> {
    return this.tradeRepo.find({
      order: { createdAt: "DESC" },
      take: limit,
    });
  }

  async getTradesBySymbol(symbol: string, limit: number = 50): Promise<Trade[]> {
    return this.tradeRepo.find({
      where: { symbol },
      order: { createdAt: "DESC" },
      take: limit,
    });
  }

  async getTradeStats() {
    const trades = await this.tradeRepo.find();
    
    const totalTrades = trades.length;
    const executedTrades = trades.filter((t) => t.status === "EXECUTED");
    const failedTrades = trades.filter((t) => t.status === "FAILED");
    
    const profitableTrades = executedTrades.filter(
      (t) => t.realizedPnl && t.realizedPnl > 0
    );
    
    const totalPnl = executedTrades.reduce(
      (sum, t) => sum + (parseFloat(t.realizedPnl?.toString() || "0")),
      0
    );
    
    const winRate = executedTrades.length > 0
      ? (profitableTrades.length / executedTrades.length) * 100
      : 0;

    return {
      totalTrades,
      executedTrades: executedTrades.length,
      failedTrades: failedTrades.length,
      profitableTrades: profitableTrades.length,
      totalPnl: totalPnl.toFixed(2),
      winRate: winRate.toFixed(2),
    };
  }

  async closeTrade(tradeId: number) {
    const trade = await this.tradeRepo.findOne({ where: { id: tradeId } });
    
    if (!trade) {
      throw new Error("Trade not found");
    }

    if (trade.status === "CLOSED") {
      throw new Error("Trade already closed");
    }

    const currentPrice = await this.bybitService.getCurrentPrice(trade.symbol);
    
    await this.bybitService.closePosition(
      trade.symbol,
      trade.side as "Buy" | "Sell",
      trade.quantity.toString()
    );

    const pnl =
      trade.side === "Buy"
        ? (currentPrice - parseFloat(trade.price.toString())) * parseFloat(trade.quantity.toString())
        : (parseFloat(trade.price.toString()) - currentPrice) * parseFloat(trade.quantity.toString());

    trade.exitPrice = currentPrice;
    trade.realizedPnl = pnl;
    trade.status = "CLOSED";
    trade.closedAt = new Date();

    await this.tradeRepo.save(trade);

    this.logger.log(
      `Trade #${tradeId} closed. PnL: ${pnl.toFixed(2)} USDT`
    );

    return trade;
  }

  async cancelTrade(tradeId: number) {
    const trade = await this.tradeRepo.findOne({ where: { id: tradeId } });
    
    if (!trade) {
      throw new Error("Trade not found");
    }

    if (trade.orderId && trade.orderId !== "FAILED") {
      await this.bybitService.cancelOrder(trade.symbol, trade.orderId);
    }

    trade.status = "CANCELLED";
    await this.tradeRepo.save(trade);

    return trade;
  }
}
