import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Strategy } from "./strategy.entity";

@Controller("api/strategies")
export class StrategyController {
  constructor(
    @InjectRepository(Strategy)
    private strategyRepo: Repository<Strategy>
  ) {}

  @Get()
  async getAllStrategies() {
    return this.strategyRepo.find({ order: { createdAt: "DESC" } });
  }

  @Get(":id")
  async getStrategy(@Param("id") id: number) {
    return this.strategyRepo.findOne({ where: { id } });
  }

  @Post()
  async createStrategy(@Body() data: Partial<Strategy>) {
    const strategy = this.strategyRepo.create(data);
    return this.strategyRepo.save(strategy);
  }

  @Put(":id")
  async updateStrategy(
    @Param("id") id: number,
    @Body() data: Partial<Strategy>
  ) {
    await this.strategyRepo.update(id, data);
    return this.strategyRepo.findOne({ where: { id } });
  }

  @Delete(":id")
  async deleteStrategy(@Param("id") id: number) {
    await this.strategyRepo.delete(id);
    return { success: true, message: "Strategy deleted" };
  }

  @Post(":id/activate")
  async activateStrategy(@Param("id") id: number) {
    await this.strategyRepo.update(id, { isActive: true });
    return this.strategyRepo.findOne({ where: { id } });
  }

  @Post(":id/deactivate")
  async deactivateStrategy(@Param("id") id: number) {
    await this.strategyRepo.update(id, { isActive: false });
    return this.strategyRepo.findOne({ where: { id } });
  }
}
