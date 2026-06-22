import { Injectable, Logger, OnApplicationBootstrap, Inject } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { google, youtube_v3 } from 'googleapis';
import { DatabaseService, VideoSnapshot } from './database.service';

function parseDuration(duration: string): number {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return 0;
  return (parseInt(match[1]) || 0) * 3600 + (parseInt(match[2]) || 0) * 60 + (parseInt(match[3]) || 0);
}

@Injectable()
export class YoutubeService implements OnApplicationBootstrap {
  private readonly logger = new Logger(YoutubeService.name);
  private youtube: youtube_v3.Youtube;

  constructor(@Inject(DatabaseService) private readonly db: DatabaseService) {
    this.youtube = google.youtube({ version: 'v3', auth: process.env.YOUTUBE_API_KEY || 'MISSING_KEY' });
  }

  async onApplicationBootstrap() {
    this.db.seedTestDataIfEmpty();
    await this.ingestDataJob();
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async ingestDataJob() {
    const channels = this.db.getChannels() as any[];
    for (const channel of channels) {
      if (!channel.platform || channel.platform === 'youtube') {
        await this.ingestChannelData(channel.channel_id);
      }
    }
  }

  async forceIngest() {
    await this.ingestDataJob();
  }

  async ingestChannelData(channelId: string) {
    const dateStr = new Date().toISOString().split('T')[0];
    try {
      if (!process.env.YOUTUBE_API_KEY || process.env.YOUTUBE_API_KEY === 'MISSING_KEY') throw new Error('No API Key');
      let channelRes;
      
      if (channelId.startsWith('@')) {
        channelRes = await this.youtube.channels.list({ part: ['statistics', 'contentDetails', 'snippet'], forHandle: channelId });
      } else if (!channelId.startsWith('UC')) {
        channelRes = await this.youtube.channels.list({ part: ['statistics', 'contentDetails', 'snippet'], forUsername: channelId });
      } else {
        channelRes = await this.youtube.channels.list({ part: ['statistics', 'contentDetails', 'snippet'], id: [channelId] });
      }
      
      if (!channelRes.data.items || channelRes.data.items.length === 0) {
        this.db.deleteChannel(channelId);
        throw new Error('Channel not found for: ' + channelId);
      }

      const item = channelRes.data.items[0];
      const actualChannelId = item.id!;
      const stats = item.statistics!;
      const uploadsPlaylistId = item.contentDetails?.relatedPlaylists?.uploads;
      const channelName = item.snippet?.title || 'Unknown Channel';

      // Ensure the actual ID is saved
      if (actualChannelId !== channelId) {
        this.db.deleteChannel(channelId);
      }
      this.db.addChannel(actualChannelId, channelName);
      this.db.saveChannelSnapshot({ channel_id: actualChannelId, channel_name: channelName, date: dateStr, subscribers: parseInt(stats.subscriberCount || '0', 10), views: parseInt(stats.viewCount || '0', 10) });

      if (uploadsPlaylistId) {
        const playlistRes = await this.youtube.playlistItems.list({ part: ['contentDetails'], playlistId: uploadsPlaylistId, maxResults: 50 });
        const videoIds = (playlistRes.data.items || []).map(i => i.contentDetails?.videoId).filter(Boolean) as string[];

        if (videoIds.length > 0) {
          const videosRes = await this.youtube.videos.list({ part: ['snippet', 'statistics', 'contentDetails'], id: videoIds });
          const snaps: Omit<VideoSnapshot, 'id'>[] = (videosRes.data.items || []).map(vid => ({
            video_id: vid.id!, channel_id: actualChannelId, date: dateStr, title: vid.snippet?.title || 'Untitled',
            duration: parseDuration(vid.contentDetails?.duration || 'PT0S'), views: parseInt(vid.statistics?.viewCount || '0', 10),
            likes: parseInt(vid.statistics?.likeCount || '0', 10), comments: parseInt(vid.statistics?.commentCount || '0', 10)
          }));
          this.logger.log(`Extracted ${snaps.length} videos from ${channelName}`);
          this.db.saveVideoSnapshots(snaps);
        }
      }
    } catch (e) {
      this.logger.error('API Error: ' + (e as any).message);
    }
  }
}
