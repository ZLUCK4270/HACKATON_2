import { Controller, Get, Param, Query } from '@nestjs/common';
import { SnapshotService } from './snapshot.service';

@Controller('api/snapshots')
export class SnapshotController {
  constructor(private snapshotService: SnapshotService) {}

  @Get()
  async getAll(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.snapshotService.getAllSnapshots(startDate, endDate);
  }

  @Get('channels')
  async getChannels() {
    return this.snapshotService.getChannels();
  }

  @Get(':channelId')
  async getByChannel(
    @Param('channelId') channelId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.snapshotService.getSnapshotsByChannel(
      channelId,
      startDate,
      endDate,
    );
  }
}
