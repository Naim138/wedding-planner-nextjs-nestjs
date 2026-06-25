import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { CreateChecklistDto, UpdateChecklistDto } from 'src/dto/checklist.dto';
import { ChecklistService } from './checklist.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('/api/v1/checklist')
@UseGuards(AuthGuard)
export class ChecklistController {
  constructor(private readonly checklistService: ChecklistService) {}

  @Get()
  async getAllChecklists(@Req() req: any) {
    const res_obj = await this.checklistService.getAllChecklists(req.user);
    return res_obj;
  }

  @Post()
  async createChecklist(@Req() req: any, @Body() data: CreateChecklistDto) {
    const res_obj = await this.checklistService.createChecklist(req.user, data);
    return res_obj;
  }

  @Put('/:id')
  async updateChecklist(
    @Req() req: any,
    @Param('id') id: string,
    @Body() data: UpdateChecklistDto,
  ) {
    const res_obj = await this.checklistService.updateChecklist(req.user, id, data);
    return res_obj;
  }

  @Delete('/:id')
  async deleteChecklist(@Req() req: any, @Param('id') id: string) {
    const res_obj = await this.checklistService.deleteChecklist(req.user, id);
    return res_obj;
  }
}
