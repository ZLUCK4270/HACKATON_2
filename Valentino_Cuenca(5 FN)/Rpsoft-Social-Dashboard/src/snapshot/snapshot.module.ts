import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SnapshotService } from './snapshot.service';
import { SnapshotController } from './snapshot.controller';
import { ChannelSnapshot } from '../entities/channel-snapshot.entity';
import { Video } from '../entities/video.entity';
import { Channel } from '../entities/channel.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ChannelSnapshot, Video, Channel])],
  providers: [SnapshotService],
  controllers: [SnapshotController],
  exports: [SnapshotService],
})
export class SnapshotModule {}
