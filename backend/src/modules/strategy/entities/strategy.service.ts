import { Injectable, Logger } from "@nestjs/common";
import { EMA, RSI, MACD, BollingerBands } from "technicalindicators";

export interface MarketData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TechnicalIndicators {
  rsi: number;
  emaShort: number;
  emaLong: number;
  macd: {
    macd: number;
    signal: number;
    histogram: number;
  };
  bollinger: {
    upper: number;
    middle: number;
    lower: number;
  };
}

@Injectable()
export class StrategyService {
  private readonly logger = new Logger(StrategyService.name);

  // Рассчитать все индикаторы
  calculateIndicators(marketData: MarketData[]): TechnicalIndicators {
    const closePrices = marketData.map((d) => d.close);

    const rsi = this.calculateRSI(closePrices);
    const emaShort = this.calculateEMA(closePrices, 9);
    const emaLong = this.calculateEMA(closePrices, 21);
    const macd = this.calculateMACD(closePrices);
    const bollinger = this.calculateBollingerBands(closePrices);

    return {
      rsi,
      emaShort,
      emaLong,
      macd: {
        macd: macd.MACD || 0,
        signal: macd.signal || 0,
        histogram: macd.histogram || 0,
      },
      bollinger: {
        upper: bollinger.upper || 0,
        middle: bollinger.middle || 0,
        lower: bollinger.lower || 0,
      },
    };
  }

  private calculateRSI(prices: number[], period: number = 14): number {
    const rsi = RSI.calculate({ values: prices, period });
    return rsi[rsi.length - 1] || 50;
  }

  private calculateEMA(prices: number[], period: number): number {
    const ema = EMA.calculate({ values: prices, period });
    return ema[ema.length - 1] || 0;
  }

  private calculateMACD(prices: number[]) {
    const macd = MACD.calculate({
      values: prices,
      fastPeriod: 12,
      slowPeriod: 26,
      signalPeriod: 9,
      SimpleMAOscillator: false,
      SimpleMASignal: false,
    });
    return macd[macd.length - 1] || { MACD: 0, signal: 0, histogram: 0 };
  }

  private calculateBollingerBands(prices: number[], period: number = 20) {
    const bb = BollingerBands.calculate({
      values: prices,
      period,
      stdDev: 2,
    });
    return bb[bb.length - 1] || { upper: 0, middle: 0, lower: 0 };
  }

  // Скальпинг стратегия
  analyzeScalpingStrategy(
    indicators: TechnicalIndicators,
    currentPrice: number
  ): "LONG" | "SHORT" | "HOLD" {
    const { rsi, emaShort, emaLong, macd } = indicators;

    // LONG условия
    if (rsi < 30 && emaShort > emaLong && macd.histogram > 0) {
      return "LONG";
    }

    // SHORT условия
    if (rsi > 70 && emaShort < emaLong && macd.histogram < 0) {
      return "SHORT";
    }

    return "HOLD";
  }

  // Трендовая стратегия
  analyzeTrendStrategy(
    indicators: TechnicalIndicators,
    currentPrice: number
  ): "LONG" | "SHORT" | "HOLD" {
    const { emaShort, emaLong, macd, bollinger } = indicators;

    // LONG - сильный восходящий тренд
    if (
      emaShort > emaLong &&
      macd.macd > macd.signal &&
      currentPrice > bollinger.middle
    ) {
      return "LONG";
    }

    // SHORT - сильный нисходящий тренд
    if (
      emaShort < emaLong &&
      macd.macd < macd.signal &&
      currentPrice < bollinger.middle
    ) {
      return "SHORT";
    }

    return "HOLD";
  }
}
