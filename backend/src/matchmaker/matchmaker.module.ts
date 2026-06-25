import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Matchmaker, MatchmakerSchema } from 'src/models/Matchmaker.model';
import { User, UserSchema } from 'src/models/User.model';
import { MatchmakerController } from './matchmaker.controller';
import { MatchmakerService } from './matchmaker.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Matchmaker.name, schema: MatchmakerSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [MatchmakerController],
  providers: [MatchmakerService],
  exports: [MatchmakerService],
})
export class MatchmakerModule {}
