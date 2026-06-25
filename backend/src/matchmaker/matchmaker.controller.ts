import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { CreateMatchmakerDto } from 'src/dto/matchmaker.dto';
import { MatchmakerService } from './matchmaker.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('/api/v1/matchmaker')
@UseGuards(AuthGuard)
export class MatchmakerController {
  constructor(private readonly matchmakerService: MatchmakerService) {}

  @Get()
  async getMatchHistory(@Req() req: any) {
    const res_obj = await this.matchmakerService.getMatchHistory(req.user);
    return res_obj;
  }

  @Post()
  async runMatchmaker(@Req() req: any, @Body() data: CreateMatchmakerDto) {
    const res_obj = await this.matchmakerService.runMatchmaker(req.user, data);
    return res_obj;
  }
}
