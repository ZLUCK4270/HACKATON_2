import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { DashboardController } from './dashboard.controller';
import { YoutubeService } from './youtube.service';
import { DatabaseService } from './database.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [DashboardController],
  providers: [YoutubeService, DatabaseService],
})
export class AppModule {}