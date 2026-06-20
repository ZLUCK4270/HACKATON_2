import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { ChannelSnapshot } from '../entities/channel-snapshot.entity';
import { Video } from '../entities/video.entity';
import { Channel } from '../entities/channel.entity';

@Injectable()
export class SnapshotService {
  private readonly logger = new Logger(SnapshotService.name);

  constructor(
    @InjectRepository(ChannelSnapshot)
    private snapshotRepo: Repository<ChannelSnapshot>,
    @InjectRepository(Video)
    private videoRepo: Repository<Video>,
    @InjectRepository(Channel)
    private channelRepo: Repository<Channel>,
  ) {}

  async saveSnapshot(data: {
    channelId: string;
    date: string;
    subscribers: number;
    totalViews: number;
    videoCount: number;
    videos: {
      videoId: string;
      title: string;
      publishedAt: string;
      durationSec: number;
      views: number;
      likes: number;
      comments: number;
    }[];
  }): Promise<ChannelSnapshot> {
    const existing = await this.snapshotRepo.findOne({
      where: { channelId: data.channelId, date: data.date },
    });

    if (existing) {
      existing.subscribers = data.subscribers;
      existing.totalViews = data.totalViews;
      existing.videoCount = data.videoCount;
      await this.snapshotRepo.save(existing);
    } else {
      const snapshot = this.snapshotRepo.create({
        channelId: data.channelId,
        date: data.date,
        subscribers: data.subscribers,
        totalViews: data.totalViews,
        videoCount: data.videoCount,
      });
      await this.snapshotRepo.save(snapshot);
    }

    for (const v of data.videos) {
      try {
        const existingVideo = await this.videoRepo.findOne({
          where: { videoId: v.videoId },
        });
        if (existingVideo) {
          existingVideo.views = v.views;
          existingVideo.likes = v.likes;
          existingVideo.comments = v.comments;
          existingVideo.snapshotDate = data.date;
          await this.videoRepo.save(existingVideo);
        } else {
          const video = this.videoRepo.create({
            videoId: v.videoId,
            channelId: data.channelId,
            title: v.title,
            publishedAt: new Date(v.publishedAt),
            durationSec: v.durationSec,
            views: v.views,
            likes: v.likes,
            comments: v.comments,
            snapshotDate: data.date,
          });
          await this.videoRepo.save(video);
        }
      } catch (error) {
        this.logger.warn(`Error saving video ${v.videoId}: ${error.message}`);
      }
    }

    return existing || await this.snapshotRepo.findOne({ where: { channelId: data.channelId, date: data.date } }) as ChannelSnapshot;
  }

  async getSnapshotsByChannel(
    channelId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<ChannelSnapshot[]> {
    const where: any = { channelId };
    if (startDate && endDate) {
      where.date = Between(startDate, endDate);
    } else if (startDate) {
      where.date = MoreThanOrEqual(startDate);
    } else if (endDate) {
      where.date = LessThanOrEqual(endDate);
    }
    return this.snapshotRepo.find({
      where,
      order: { date: 'ASC' },
    });
  }

  async getAllSnapshots(
    startDate?: string,
    endDate?: string,
  ): Promise<ChannelSnapshot[]> {
    const where: any = {};
    if (startDate && endDate) {
      where.date = Between(startDate, endDate);
    } else if (startDate) {
      where.date = MoreThanOrEqual(startDate);
    } else if (endDate) {
      where.date = LessThanOrEqual(endDate);
    }
    return this.snapshotRepo.find({
      where,
      order: { date: 'ASC', channelId: 'ASC' },
    });
  }

  async getLatestSnapshotByChannel(
    channelId: string,
  ): Promise<ChannelSnapshot | null> {
    return this.snapshotRepo.findOne({
      where: { channelId },
      order: { date: 'DESC' },
    });
  }

  async getVideos(
    channelId?: string,
    startDate?: string,
    endDate?: string,
  ): Promise<Video[]> {
    const where: any = {};
    if (channelId) where.channelId = channelId;
    if (startDate && endDate) {
      where.publishedAt = Between(new Date(startDate), new Date(endDate));
    }
    return this.videoRepo.find({ where, order: { views: 'DESC' } });
  }

  async ensureChannels(
    channels: {
      channelId: string;
      title: string;
      brand: string;
      thumbnailUrl?: string;
    }[],
  ): Promise<void> {
    for (const ch of channels) {
      const exists = await this.channelRepo.findOne({
        where: { channelId: ch.channelId },
      });
      if (!exists) {
        await this.channelRepo.save({
          channelId: ch.channelId,
          title: ch.title,
          brand: ch.brand,
          thumbnailUrl: ch.thumbnailUrl || '',
        });
      } else if (ch.thumbnailUrl && !exists.thumbnailUrl) {
        exists.thumbnailUrl = ch.thumbnailUrl;
        await this.channelRepo.save(exists);
      }
    }
  }

  async getChannels(): Promise<Channel[]> {
    return this.channelRepo.find();
  }

  async getChannel(channelId: string): Promise<Channel | null> {
    return this.channelRepo.findOne({ where: { channelId } });
  }

  async loadBackupSnapshots(
    snapshots: Record<
      string,
      {
        date: string;
        subscribers: number;
        totalViews: number;
        videoCount: number;
      }[]
    >,
    channels: {
      channelId: string;
      title: string;
      brand: string;
      thumbnailUrl?: string;
    }[],
    videos: {
      channelId: string;
      videoId: string;
      title: string;
      publishedAt: string;
      durationSec: number;
      views: number;
      likes: number;
      comments: number;
      snapshotDate: string;
    }[],
  ): Promise<void> {
    await this.ensureChannels(channels);

    for (const [channelId, points] of Object.entries(snapshots)) {
      for (const point of points) {
        const existing = await this.snapshotRepo.findOne({
          where: { channelId, date: point.date },
        });
        if (!existing) {
          await this.snapshotRepo.save({
            channelId,
            date: point.date,
            subscribers: point.subscribers,
            totalViews: point.totalViews,
            videoCount: point.videoCount,
          });
        }
      }
    }

    for (const v of videos) {
      const existing = await this.videoRepo.findOne({
        where: { videoId: v.videoId },
      });
      if (!existing) {
        await this.videoRepo.save({
          videoId: v.videoId,
          channelId: v.channelId,
          title: v.title,
          publishedAt: new Date(v.publishedAt),
          durationSec: v.durationSec,
          views: v.views,
          likes: v.likes,
          comments: v.comments,
          snapshotDate:
            v.snapshotDate || new Date().toISOString().split('T')[0],
        });
      }
    }

    this.logger.log('Backup snapshots loaded into database');
  }
}
