import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { CategoryModule } from './category/category.module';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/models/User.model';
import { Service, ServiceSchema } from 'src/models/Service.model';
import { Enquery, EnquerySchema } from 'src/models/Enquery.model';
import { Profile, ProfileSchema } from 'src/models/Profile.model';
import { Budget, BudgetSchema } from 'src/models/Budget.model';
import { Checklist, ChecklistSchema } from 'src/models/Checklist.model';
import { Matchmaker, MatchmakerSchema } from 'src/models/Matchmaker.model';

@Module({
  providers: [AdminService],
  controllers: [AdminController],
  imports: [
    CategoryModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Service.name, schema: ServiceSchema },
      { name: Enquery.name, schema: EnquerySchema },
      { name: Profile.name, schema: ProfileSchema },
      { name: Budget.name, schema: BudgetSchema },
      { name: Checklist.name, schema: ChecklistSchema },
      { name: Matchmaker.name, schema: MatchmakerSchema },
    ])
  ]
})
export class AdminModule {}

