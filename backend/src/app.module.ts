import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AuthModule } from './auth/auth.module';
import { VendorModule } from './vendor/vendor.module';
import { AdminModule } from './admin/admin.module';
import { PublicModule } from './public/public.module';
import { ChecklistModule } from './checklist/checklist.module';
import { BudgetModule } from './budget/budget.module';
import { MatchmakerModule } from './matchmaker/matchmaker.module';

import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    // ✅ env loader (best practice)
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // ✅ MongoDB connection (safe null check)
    MongooseModule.forRoot(process.env.MONGO_URI as string),

    // ✅ JWT global
    JwtModule.register({
      global: true,
      secret: process.env.JWT_AUTH, // ⚠️ FIXED NAME (important)
      signOptions: { expiresIn: '5h' },
    }),

    // modules
    AuthModule,
    VendorModule,
    AdminModule,
    PublicModule,
    ChecklistModule,
    BudgetModule,
    MatchmakerModule,
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}