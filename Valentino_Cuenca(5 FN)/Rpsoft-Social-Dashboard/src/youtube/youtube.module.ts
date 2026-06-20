import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { YoutubeService } from './youtube.service';
import { YoutubeController } from './youtube.controller';
import { SnapshotModule } from '../snapshot/snapshot.module';
import { ChannelsModule } from '../channels/channels.module';

@Module({
  imports: [HttpModule, SnapshotModule, ChannelsModule],
  providers: [YoutubeService],
  controllers: [YoutubeController],
  exports: [YoutubeService],
})
export class YoutubeModule {}
