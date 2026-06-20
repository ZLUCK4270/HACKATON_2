import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as fs from 'fs';
import * as https from 'https';

interface VideoData {
  videoId: string;
  title: string;
  publishedAt: string;
  durationSec: number;
  views: number;
  likes: number;
  comments: number;
}

interface ChannelData {
  channelId: string;
  title: string;
  brand: string;
  thumbnailUrl: string;
  subscribers: number;
  totalViews: number;
  videoCount: number;
  videos: VideoData[];
}

interface SnapshotPoint {
  date: string;
  subscribers: number;
  totalViews: number;
  videoCount: number;
}

interface BackupData {
  channels: ChannelData[];
  snapshots: Record<string, SnapshotPoint[]>;
}

@Injectable()
export class YoutubeService {
  private readonly logger = new Logger(YoutubeService.name);
  private backupData: BackupData | null = null;
  private _usingBackup = false;

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {
    this.loadBackupData();
  }

  private loadBackupData() {
    try {
      const backupPath = this.configService.get(
        'BACKUP_PATH',
        'backup-data/backup.json',
      );
      const data = fs.readFileSync(backupPath, 'utf8');
      this.backupData = JSON.parse(data);
      this.logger.log('Backup data loaded successfully');
    } catch (error) {
      this.logger.warn('Could not load backup data: ' + error.message);
    }
  }

  private getApiKey(): string | null {
    const key = this.configService.get('YOUTUBE_API_KEY');
    if (key && key !== 'YOUR_API_KEY_HERE' && key.length > 5) {
      return key;
    }
    return null;
  }

  async fetchAllChannelsData(
    channels: { channelId: string; title: string; brand: string }[],
  ): Promise<{
    channels: ChannelData[];
    snapshots: Record<string, SnapshotPoint[]>;
    source: 'api' | 'backup';
    error?: string;
  }> {
    const apiKey = this.getApiKey();

    if (!apiKey) {
      this.logger.warn('No API key configured, using backup data');
      return this.getBackupData();
    }

    try {
      const results = await Promise.allSettled(
        channels.map((ch) =>
          this.fetchChannelData(ch.channelId, ch.title, ch.brand, apiKey),
        ),
      );

      const channelData: ChannelData[] = [];
      const errors: string[] = [];

      for (const result of results) {
        if (result.status === 'fulfilled') {
          channelData.push(result.value);
        } else {
          errors.push(result.reason?.message || 'Unknown error');
        }
      }

      if (channelData.length === 0) {
        throw new Error('All API calls failed: ' + errors.join('; '));
      }

      const today = new Date().toISOString().split('T')[0];
      const snapshots: Record<string, SnapshotPoint[]> = {};
      for (const ch of channelData) {
        snapshots[ch.channelId] = [
          {
            date: today,
            subscribers: ch.subscribers,
            totalViews: ch.totalViews,
            videoCount: ch.videoCount,
          },
        ];
      }

      this._usingBackup = false;
      return { channels: channelData, snapshots, source: 'api' };
    } catch (error) {
      this.logger.error(
        'API fetch failed, falling back to backup: ' + error.message,
      );
      const backup = this.getBackupData();
      return {
        ...backup,
        error: `API error: ${error.message}. Usando datos de respaldo.`,
      };
    }
  }

  private async fetchChannelData(
    channelId: string,
    title: string,
    brand: string,
    apiKey: string,
  ): Promise<ChannelData> {
    const baseUrl = 'https://www.googleapis.com/youtube/v3';

    const params: any = {
      part: 'statistics,contentDetails,snippet',
      key: apiKey,
    };

    const isHandle = this.isHandle(channelId);
    const cleanHandle = channelId.replace(/^@/, '');

    if (isHandle) {
      params.forHandle = cleanHandle;
    } else {
      params.id = channelId;
    }

    let channelRes = await firstValueFrom(
      this.httpService.get(`${baseUrl}/channels`, { params }),
    );

    if (!channelRes.data.items?.[0] && isHandle) {
      channelRes = await firstValueFrom(
        this.httpService.get(`${baseUrl}/channels`, {
          params: {
            part: 'statistics,contentDetails,snippet',
            id: channelId,
            key: apiKey,
          },
        }),
      );
    }

    const channelInfo = channelRes.data.items?.[0];
    if (!channelInfo) {
      throw new Error(`Channel ${channelId} not found`);
    }

    const subscribers = parseInt(channelInfo.statistics.subscriberCount) || 0;
    const totalViews = parseInt(channelInfo.statistics.viewCount) || 0;
    const videoCount = parseInt(channelInfo.statistics.videoCount) || 0;
    const thumbnailUrl = channelInfo.snippet?.thumbnails?.default?.url || '';
    const channelTitle = channelInfo.snippet?.title || title;
    const uploadsPlaylistId =
      channelInfo.contentDetails?.relatedPlaylists?.uploads;

    let videos: VideoData[] = [];
    if (uploadsPlaylistId) {
      videos = await this.fetchChannelVideos(
        uploadsPlaylistId,
        channelId,
        apiKey,
      );
    }

    return {
      channelId,
      title: channelTitle,
      brand,
      thumbnailUrl,
      subscribers,
      totalViews,
      videoCount,
      videos,
    };
  }

  private async fetchChannelVideos(
    playlistId: string,
    channelId: string,
    apiKey: string,
  ): Promise<VideoData[]> {
    const baseUrl = 'https://www.googleapis.com/youtube/v3';
    const videoIds: string[] = [];
    let nextPageToken: string | undefined;

    do {
      const playlistRes = await firstValueFrom(
        this.httpService.get(`${baseUrl}/playlistItems`, {
          params: {
            part: 'contentDetails',
            playlistId,
            maxResults: 50,
            pageToken: nextPageToken,
            key: apiKey,
          },
        }),
      );

      const items = playlistRes.data.items || [];
      videoIds.push(...items.map((item) => item.contentDetails.videoId));
      nextPageToken = playlistRes.data.nextPageToken;
    } while (nextPageToken && videoIds.length < 200);

    const videos: VideoData[] = [];
    for (let i = 0; i < videoIds.length; i += 50) {
      const batch = videoIds.slice(i, i + 50);
      const videoRes = await firstValueFrom(
        this.httpService.get(`${baseUrl}/videos`, {
          params: {
            part: 'statistics,snippet,contentDetails',
            id: batch.join(','),
            key: apiKey,
          },
        }),
      );

      for (const item of videoRes.data.items || []) {
        const stats = item.statistics || {};
        const duration = this.parseDuration(
          item.contentDetails?.duration || 'PT0S',
        );
        videos.push({
          videoId: item.id,
          title: item.snippet?.title || '',
          publishedAt: item.snippet?.publishedAt || '',
          durationSec: duration,
          views: parseInt(stats.viewCount) || 0,
          likes: parseInt(stats.likeCount) || 0,
          comments: parseInt(stats.commentCount) || 0,
        });
      }
    }

    return videos;
  }

  private parseDuration(isoDuration: string): number {
    const match = isoDuration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return 0;
    const hours = parseInt(match[1]?.replace('H', '') || '0');
    const minutes = parseInt(match[2]?.replace('M', '') || '0');
    const seconds = parseInt(match[3]?.replace('S', '') || '0');
    return hours * 3600 + minutes * 60 + seconds;
  }

  private getBackupData() {
    this._usingBackup = true;
    if (!this.backupData) {
      return { channels: [], snapshots: {}, source: 'backup' as const };
    }
    return {
      channels: this.backupData.channels,
      snapshots: this.backupData.snapshots,
      source: 'backup' as const,
    };
  }

  async searchVideos(query: string): Promise<any> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      return { items: [], error: 'No API key configured' };
    }

    try {
      const baseUrl = 'https://www.googleapis.com/youtube/v3';
      const res = await firstValueFrom(
        this.httpService.get(`${baseUrl}/search`, {
          params: {
            part: 'snippet',
            q: query,
            maxResults: 25,
            type: 'video',
            key: apiKey,
          },
        }),
      );

      const videoIds = (res.data.items || [])
        .map(item => item.id?.videoId)
        .filter(Boolean);

      if (videoIds.length === 0) return { items: [] };

      const statsRes = await firstValueFrom(
        this.httpService.get(`${baseUrl}/videos`, {
          params: {
            part: 'statistics,contentDetails',
            id: videoIds.join(','),
            key: apiKey,
          },
        }),
      );

      const statsMap = {};
      for (const item of statsRes.data.items || []) {
        statsMap[item.id] = {
          views: parseInt(item.statistics?.viewCount) || 0,
          likes: parseInt(item.statistics?.likeCount) || 0,
          comments: parseInt(item.statistics?.commentCount) || 0,
          duration: item.contentDetails?.duration || 'PT0S',
        };
      }

      const items = (res.data.items || []).map(item => {
        const stats = statsMap[item.id?.videoId] || {};
        return {
          videoId: item.id?.videoId,
          title: item.snippet?.title,
          description: item.snippet?.description,
          thumbnail: item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.default?.url,
          channelId: item.snippet?.channelId,
          channelTitle: item.snippet?.channelTitle,
          publishedAt: item.snippet?.publishedAt,
          views: stats.views,
          likes: stats.likes,
          comments: stats.comments,
          duration: stats.duration,
          durationSec: this.parseDuration(stats.duration || 'PT0S'),
        };
      });

      return { items };
    } catch (error) {
      this.logger.error('Search failed: ' + error.message);
      return { items: [], error: error.message };
    }
  }

  private isHandle(input: string): boolean {
    return input.startsWith('@') || !input.startsWith('UC');
  }

  async getChannelInfo(channelId: string): Promise<any> {
    const apiKey = this.getApiKey();
    if (!apiKey) return null;

    try {
      const baseUrl = 'https://www.googleapis.com/youtube/v3';
      const params: any = {
        part: 'snippet,statistics',
        key: apiKey,
      };

      const isHandle = this.isHandle(channelId);
      const cleanHandle = channelId.replace(/^@/, '');

      if (isHandle) {
        params.forHandle = cleanHandle;
      } else {
        params.id = channelId;
      }

      const res = await firstValueFrom(
        this.httpService.get(`${baseUrl}/channels`, { params }),
      );

      let item = res.data.items?.[0];

      if (!item && isHandle) {
        const retryRes = await firstValueFrom(
          this.httpService.get(`${baseUrl}/channels`, {
            params: {
              part: 'snippet,statistics',
              id: channelId,
              key: apiKey,
            },
          }),
        );
        item = retryRes.data.items?.[0];
      }

      if (!item) return null;

      return {
        channelId: item.id,
        title: item.snippet?.title,
        description: item.snippet?.description,
        thumbnailUrl: item.snippet?.thumbnails?.default?.url,
        publishedAt: item.snippet?.publishedAt || null,
        subscribers: parseInt(item.statistics?.subscriberCount) || 0,
        totalViews: parseInt(item.statistics?.viewCount) || 0,
        videoCount: parseInt(item.statistics?.videoCount) || 0,
      };
    } catch (error) {
      this.logger.error('getChannelInfo failed: ' + error.message);
      return null;
    }
  }

  async getChannelVideos(channelId: string): Promise<any> {
    const apiKey = this.getApiKey();
    if (!apiKey) return { items: [], error: 'No API key configured' };

    try {
      const baseUrl = 'https://www.googleapis.com/youtube/v3';

      const params: any = {
        part: 'contentDetails,snippet',
        key: apiKey,
      };

      const isHandle = this.isHandle(channelId);
      const cleanHandle = channelId.replace(/^@/, '');

      if (isHandle) {
        params.forHandle = cleanHandle;
      } else {
        params.id = channelId;
      }

      let channelRes = await firstValueFrom(
        this.httpService.get(`${baseUrl}/channels`, { params }),
      );

      if (!channelRes.data.items?.[0] && isHandle) {
        channelRes = await firstValueFrom(
          this.httpService.get(`${baseUrl}/channels`, {
            params: {
              part: 'contentDetails,snippet',
              id: channelId,
              key: apiKey,
            },
          }),
        );
      }

      const channelInfo = channelRes.data.items?.[0];
      if (!channelInfo) return { items: [], error: 'Channel not found' };

      const uploadsPlaylistId = channelInfo.contentDetails?.relatedPlaylists?.uploads;
      if (!uploadsPlaylistId) return { items: [], error: 'No uploads playlist' };

      const videoIds: string[] = [];
      let nextPageToken: string | undefined;

      do {
        const playlistRes = await firstValueFrom(
          this.httpService.get(`${baseUrl}/playlistItems`, {
            params: {
              part: 'contentDetails',
              playlistId: uploadsPlaylistId,
              maxResults: 50,
              pageToken: nextPageToken,
              key: apiKey,
            },
          }),
        );

        const items = playlistRes.data.items || [];
        videoIds.push(...items.map((item) => item.contentDetails.videoId));
        nextPageToken = playlistRes.data.nextPageToken;
      } while (nextPageToken && videoIds.length < 200);

      const videos: any[] = [];
      for (let i = 0; i < videoIds.length; i += 50) {
        const batch = videoIds.slice(i, i + 50);
        const videoRes = await firstValueFrom(
          this.httpService.get(`${baseUrl}/videos`, {
            params: {
              part: 'statistics,snippet,contentDetails',
              id: batch.join(','),
              key: apiKey,
            },
          }),
        );

        for (const item of videoRes.data.items || []) {
          const stats = item.statistics || {};
          videos.push({
            videoId: item.id,
            title: item.snippet?.title || '',
            description: item.snippet?.description || '',
            thumbnail: item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.default?.url,
            publishedAt: item.snippet?.publishedAt || '',
            duration: item.contentDetails?.duration || 'PT0S',
            durationSec: this.parseDuration(item.contentDetails?.duration || 'PT0S'),
            views: parseInt(stats.viewCount) || 0,
            likes: parseInt(stats.likeCount) || 0,
            comments: parseInt(stats.commentCount) || 0,
          });
        }
      }

      return {
        items: videos,
        channel: {
          channelId: channelInfo.id,
          title: channelInfo.snippet?.title || '',
          description: channelInfo.snippet?.description || '',
          thumbnailUrl: channelInfo.snippet?.thumbnails?.high?.url || channelInfo.snippet?.thumbnails?.default?.url,
        },
      };
    } catch (error) {
      this.logger.error('getChannelVideos failed: ' + error.message);
      return { items: [], error: error.message };
    }
  }

  isUsingBackup(): boolean {
    return this._usingBackup;
  }
}
