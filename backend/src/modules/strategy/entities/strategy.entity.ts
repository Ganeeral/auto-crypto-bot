import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("strategies")
export class Strategy {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  type: string; // 'scalping', 'trend', 'medium-term'

  @Column({ default: false })
  isActive: boolean;

  @Column("simple-array")
  symbols: string[];

  @Column({ default: "15m" })
  timeframe: string;

  // Risk Management
  @Column({ type: "decimal", precision: 5, scale: 2, default: 1.0 })
  riskPercentage: number;

  @Column({ default: 3 })
  maxPositions: number;

  @Column({ type: "decimal", precision: 5, scale: 2, default: 2.0 })
  stopLossPercentage: number;

  @Column({ type: "decimal", precision: 5, scale: 2, default: 5.0 })
  takeProfitPercentage: number;

  // Indicator Parameters
  @Column({ type: "json" })
  indicators: {
    rsiPeriod: number;
    rsiOversold: number;
    rsiOverbought: number;
    emaShort: number;
    emaLong: number;
    macdFast: number;
    macdSlow: number;
    macdSignal: number;
  };

  // AI Settings
  @Column({ default: true })
  useAiConfirmation: boolean;

  @Column({ default: 70 })
  minAiConfidence: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
