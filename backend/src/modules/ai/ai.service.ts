import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import OpenAI from "openai";
import { TechnicalIndicators } from "../strategy/entities/strategy.service";

export interface AIDecision {
  action: "LONG" | "SHORT" | "HOLD";
  confidence: number;
  reasoning: string;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get("OPENAI_API_KEY"),
    });
  }

  async getTradeDecision(
    symbol: string,
    currentPrice: number,
    indicators: TechnicalIndicators,
    recentPrices: number[],
    strategySignal: "LONG" | "SHORT" | "HOLD"
  ): Promise<AIDecision> {
    try {
      const prompt = this.buildTradingPrompt(
        symbol,
        currentPrice,
        indicators,
        recentPrices,
        strategySignal
      );
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "You are an expert crypto trading algorithm. Analyze and reply in valid JSON.",
          },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.2,
      });
      const decision = JSON.parse(completion.choices[0].message.content);
      this.logger.log(`AI: ${decision.action}`);
      return decision as AIDecision;
    } catch (error) {
      this.logger.error("Failed to get AI decision", error);
      return {
        action: "HOLD",
        confidence: 0,
        reasoning: "AI service unavailable.",
        riskLevel: "HIGH",
      };
    }
  }

  private buildTradingPrompt(
    symbol: string,
    currentPrice: number,
    indicators: TechnicalIndicators,
    recentPrices: number[],
    strategySignal: string
  ): string {
    return `
Analyze data for ${symbol}.
Current Price: $${currentPrice}
RSI: ${indicators.rsi}
EMA(9): ${indicators.emaShort}
EMA(21): ${indicators.emaLong}
MACD: ${indicators.macd.macd}
MACD Signal: ${indicators.macd.signal}
MACD Histogram: ${indicators.macd.histogram}
Bollinger Bands: [${indicators.bollinger.upper}, ${
      indicators.bollinger.middle
    }, ${indicators.bollinger.lower}]
Strategy Signal: ${strategySignal}
Return: { "action": "LONG|SHORT|HOLD", "confidence": 0-100, "reasoning": "...", "riskLevel": "LOW|MEDIUM|HIGH" }
Prices: ${recentPrices.slice(-10).join(", ")}
`;
  }
}
