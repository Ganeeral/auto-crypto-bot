import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from "typeorm";

@Entity("trades")
export class Trade {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  symbol: string;

  @Column()
  side: string; // 'Buy' или 'Sell'

  @Column({ type: "decimal", precision: 20, scale: 8 })
  quantity: number;

  @Column({ type: "decimal", precision: 20, scale: 8 })
  price: number;

  @Column()
  orderId: string;

  @Column({ nullable: true })
  confidence: number;

  @Column({ type: "text", nullable: true })
  reasoning: string;

  @Column({ default: "PENDING" })
  status: string; // 'PENDING', 'EXECUTED', 'FAILED', 'CANCELLED'

  @Column({ type: "decimal", precision: 20, scale: 8, nullable: true })
  exitPrice: number;

  @Column({ type: "decimal", precision: 20, scale: 8, nullable: true })
  realizedPnl: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  executedAt: Date;

  @Column({ nullable: true })
  closedAt: Date;
}
