import { Module } from '@nestjs/common';
import { CronService } from './cron.service';
import { CronController } from './cron.controller';
import { YoutubeModule } from '../youtube/youtube.module';
import { SnapshotModule } from '../snapshot/snapshot.module';

@Module({
  imports: [YoutubeModule, SnapshotModule],
  providers: [CronService],
  controllers: [CronController],
})
export class CronModule {}
