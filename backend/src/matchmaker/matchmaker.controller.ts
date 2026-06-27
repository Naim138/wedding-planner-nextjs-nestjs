import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { CreateMatchmakerDto } from 'src/dto/matchmaker.dto';
import { MatchmakerService } from './matchmaker.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/models/User.model';

@Controller('/api/v1/matchmaker')
@UseGuards(AuthGuard)
export class MatchmakerController {
  constructor(
    private readonly matchmakerService: MatchmakerService,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  @Get()
  async getMatchHistory(@Req() req: any) {
    const res_obj = await this.matchmakerService.getMatchHistory(req.user);
    return res_obj;
  }

  @Get('/users')
  async getUsersForMatching(@Req() req: any) {
    const users = await this.userModel.find({
      _id: { $ne: req.user },
      role: 'user',
      $or: [
        { age: { $ne: null } },
        { personality: { $ne: '' } },
        { profession: { $ne: '' } }
      ]
    }).select('name email age profession personality hobbies values gender avatar');
    return users;
  }

  @Post()
  async runMatchmaker(@Req() req: any, @Body() data: CreateMatchmakerDto) {
    const res_obj = await this.matchmakerService.runMatchmaker(req.user, data);
    return res_obj;
  }
}
