import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { CreateBudgetDto, UpdateBudgetDto } from 'src/dto/budget.dto';
import { BudgetService } from './budget.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('/api/v1/budget')
@UseGuards(AuthGuard)
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}

  @Get()
  async getAllBudgets(@Req() req: any) {
    const res_obj = await this.budgetService.getAllBudgets(req.user);
    return res_obj;
  }

  @Post()
  async createBudget(@Req() req: any, @Body() data: CreateBudgetDto) {
    const res_obj = await this.budgetService.createBudget(req.user, data);
    return res_obj;
  }

  @Put('/:id')
  async updateBudget(
    @Req() req: any,
    @Param('id') id: string,
    @Body() data: UpdateBudgetDto,
  ) {
    const res_obj = await this.budgetService.updateBudget(req.user, id, data);
    return res_obj;
  }

  @Delete('/:id')
  async deleteBudget(@Req() req: any, @Param('id') id: string) {
    const res_obj = await this.budgetService.deleteBudget(req.user, id);
    return res_obj;
  }
}
