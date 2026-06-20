import { Controller, Get, Post, Delete, Param, Query, Body, Logger } from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { SnapshotService } from '../snapshot/snapshot.service';

@Controller('api/channels')
export class ChannelsController {
  private readonly logger = new Logger(ChannelsController.name);

  constructor(
    private channelsService: ChannelsService,
    private snapshotService: SnapshotService,
  ) {}

  @Get()
  async findAll() {
    return this.channelsService.findAll();
  }

  @Get('consolidated')
  async getConsolidated() {
    return this.channelsService.getConsolidated();
  }

  @Get('brands')
  async getBrands() {
    return this.channelsService.getBrands();
  }

  @Post()
  async create(@Body() body: { channelId: string; title: string; brand?: string; thumbnailUrl?: string; description?: string; publishedAt?: string; subscribers?: number; totalViews?: number; videoCount?: number }) {
    const channel = await this.channelsService.create(body.channelId, body.title, body.brand || 'Default', body.thumbnailUrl, body.description, body.publishedAt);
    if (body.subscribers !== undefined && body.videoCount !== undefined) {
      await this.channelsService.saveInitialSnapshot(body.channelId, body.subscribers, body.totalViews || 0, body.videoCount);
    }
    return channel;
  }

  @Post('save-videos')
  async saveVideos(@Body() body: {
    channelId: string;
    subscribers: number;
    totalViews: number;
    videoCount: number;
    videos: { videoId: string; title: string; publishedAt: string; durationSec: number; views: number; likes: number; comments: number }[];
  }) {
    await this.snapshotService.saveSnapshot({
      channelId: body.channelId,
      date: new Date().toISOString().split('T')[0],
      subscribers: body.subscribers,
      totalViews: body.totalViews,
      videoCount: body.videoCount,
      videos: body.videos || [],
    });

    // Generate historical snapshots from video publish dates
    await this.channelsService.generateHistoricalSnapshots(
      body.channelId,
      body.subscribers,
      body.videos.map(v => ({ publishedAt: v.publishedAt })),
    );

    return { message: 'Videos guardados', count: body.videos?.length || 0 };
  }

  @Delete()
  async remove(@Query('channelId') channelId: string) {
    await this.channelsService.remove(channelId);
    return { message: 'Canal eliminado', channelId };
  }
}
