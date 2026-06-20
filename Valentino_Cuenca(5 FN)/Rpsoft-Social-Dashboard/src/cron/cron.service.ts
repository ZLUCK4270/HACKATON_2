import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { YoutubeService } from '../youtube/youtube.service';
import { SnapshotService } from '../snapshot/snapshot.service';
import { MONITORED_CHANNELS } from '../config/channels.config';

@Injectable()
export class CronService implements OnApplicationBootstrap {
  private readonly logger = new Logger(CronService.name);

  constructor(
    private youtubeService: YoutubeService,
    private snapshotService: SnapshotService,
  ) {}

  async onApplicationBootstrap() {
    const channels = await this.snapshotService.getChannels();
    if (channels.length === 0) {
      this.logger.log('Base de datos vacía — cargando datos históricos de respaldo...');
      try {
        const result = await this.youtubeService.fetchAllChannelsData(MONITORED_CHANNELS);
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
          this.logger.log('Datos históricos cargados desde respaldo');
        }
      } catch (error) {
        this.logger.error('Error cargando datos de respaldo: ' + error.message);
      }
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_NOON)
  async dailyFetch() {
    this.logger.log('Starting daily YouTube data fetch...');

    try {
      const result =
        await this.youtubeService.fetchAllChannelsData(MONITORED_CHANNELS);

      for (const ch of result.channels) {
        await this.snapshotService.saveSnapshot({
          channelId: ch.channelId,
          date: new Date().toISOString().split('T')[0],
          subscribers: ch.subscribers,
          totalViews: ch.totalViews,
          videoCount: ch.videoCount,
          videos: ch.videos.map((v) => ({
            ...v,
            publishedAt: v.publishedAt,
          })),
        });
        this.logger.log(
          `Saved snapshot for ${ch.title}: ${ch.subscribers} subs`,
        );
      }

      await this.snapshotService.ensureChannels(
        result.channels.map((ch) => ({
          channelId: ch.channelId,
          title: ch.title,
          brand: ch.brand,
          thumbnailUrl: ch.thumbnailUrl,
        })),
      );

      this.logger.log(`Daily fetch completed. Source: ${result.source}`);
    } catch (error) {
      this.logger.error('Daily fetch failed', error.message);
    }
  }

  async runManualFetch(): Promise<{
    message: string;
    source: string;
    channels: number;
  }> {
    await this.dailyFetch();
    return {
      message: 'Fetch completado',
      source: this.youtubeService.isUsingBackup() ? 'backup' : 'api',
      channels: MONITORED_CHANNELS.length,
    };
  }
}
