import { Controller, Post, Get, Query, Body, Logger } from '@nestjs/common';
import { YoutubeService } from './youtube.service';
import { SnapshotService } from '../snapshot/snapshot.service';
import { ChannelsService } from '../channels/channels.service';
import { MONITORED_CHANNELS } from '../config/channels.config';

@Controller('api/youtube')
export class YoutubeController {
  private readonly logger = new Logger(YoutubeController.name);

  constructor(
    private youtubeService: YoutubeService,
    private snapshotService: SnapshotService,
    private channelsService: ChannelsService,
  ) {}

  @Post('fetch')
  async fetchAndSave() {
    const dbChannels = await this.channelsService.findAll();
    const channelsToFetch = dbChannels.length > 0
      ? dbChannels.map(ch => ({ channelId: ch.channelId, title: ch.title, brand: ch.brand }))
      : MONITORED_CHANNELS;

    const result =
      await this.youtubeService.fetchAllChannelsData(channelsToFetch);

    if (result.source === 'backup' && result.snapshots) {
      const allVideos = result.channels.flatMap(ch =>
        ch.videos.map(v => ({
          ...v,
          channelId: ch.channelId,
          snapshotDate: new Date().toISOString().split('T')[0],
        }))
      );
      await this.snapshotService.loadBackupSnapshots(
        result.snapshots,
        result.channels.map(ch => ({
          channelId: ch.channelId,
          title: ch.title,
          brand: ch.brand,
          thumbnailUrl: ch.thumbnailUrl,
        })),
        allVideos,
      );
    }

    for (const ch of result.channels) {
      await this.snapshotService.saveSnapshot({
        channelId: ch.channelId,
        date: new Date().toISOString().split('T')[0],
        subscribers: ch.subscribers,
        totalViews: ch.totalViews,
        videoCount: ch.videoCount,
        videos: ch.videos,
      });
    }

    await this.snapshotService.ensureChannels(
      result.channels.map((ch) => ({
        channelId: ch.channelId,
        title: ch.title,
        brand: ch.brand,
        thumbnailUrl: ch.thumbnailUrl,
      })),
    );

    return {
      message: 'Datos obtenidos y guardados',
      source: result.source,
      channels: result.channels.length,
      error: result.error || null,
    };
  }

  @Get('status')
  getStatus() {
    return {
      usingBackup: this.youtubeService.isUsingBackup(),
      source: this.youtubeService.isUsingBackup() ? 'backup' : 'api',
    };
  }

  @Get('search')
  async searchVideos(@Query('q') query: string) {
    if (!query) return { items: [] };
    return this.youtubeService.searchVideos(query);
  }

  @Get('channel-info')
  async getChannelInfo(@Query('channelId') channelId: string) {
    return this.youtubeService.getChannelInfo(channelId);
  }

  @Get('channel-videos')
  async getChannelVideos(@Query('channelId') channelId: string) {
    if (!channelId) return { items: [], error: 'channelId required' };
    return this.youtubeService.getChannelVideos(channelId);
  }
}
