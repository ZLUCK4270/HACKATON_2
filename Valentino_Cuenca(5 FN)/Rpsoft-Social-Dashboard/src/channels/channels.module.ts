import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChannelsService } from './channels.service';
import { ChannelsController } from './channels.controller';
import { Channel } from '../entities/channel.entity';
import { ChannelSnapshot } from '../entities/channel-snapshot.entity';
import { SnapshotModule } from '../snapshot/snapshot.module';

@Module({
  imports: [TypeOrmModule.forFeature([Channel, ChannelSnapshot]), SnapshotModule],
  providers: [ChannelsService],
  controllers: [ChannelsController],
  exports: [ChannelsService],
})
export class ChannelsModule {}
