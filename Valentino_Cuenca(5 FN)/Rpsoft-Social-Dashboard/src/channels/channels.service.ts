import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Channel } from '../entities/channel.entity';
import { ChannelSnapshot } from '../entities/channel-snapshot.entity';

@Injectable()
export class ChannelsService {
  constructor(
    @InjectRepository(Channel)
    private channelRepo: Repository<Channel>,
    @InjectRepository(ChannelSnapshot)
    private snapshotRepo: Repository<ChannelSnapshot>,
  ) {}

  async findAll(): Promise<Channel[]> {
    return this.channelRepo.find();
  }

  async findOne(channelId: string): Promise<Channel | null> {
    return this.channelRepo.findOne({ where: { channelId } });
  }

  async create(channelId: string, title: string, brand: string, thumbnailUrl?: string, description?: string, publishedAt?: string): Promise<Channel> {
    const existing = await this.channelRepo.findOne({ where: { channelId } });
    if (existing) {
      existing.title = title;
      existing.brand = brand;
      if (thumbnailUrl) existing.thumbnailUrl = thumbnailUrl;
      if (description) existing.description = description;
      if (publishedAt) existing.publishedAt = publishedAt;
      return this.channelRepo.save(existing);
    }
    const channel = this.channelRepo.create({ channelId, title, brand, thumbnailUrl, description, publishedAt });
    return this.channelRepo.save(channel);
  }

  async generateHistoricalSnapshots(channelId: string, currentSubscribers: number, videos: { publishedAt: string }[]): Promise<void> {
    const channel = await this.channelRepo.findOne({ where: { channelId } });
    if (!channel || videos.length === 0) return;

    const channelCreated = channel.publishedAt
      ? new Date(channel.publishedAt).getTime()
      : videos.length > 0
        ? new Date(videos.reduce((a, b) => a.publishedAt < b.publishedAt ? a : b).publishedAt).getTime()
        : Date.now();
    const today = Date.now();
    const lifespan = today - channelCreated;

    // Group videos by publish date (max 1 snapshot per day)
    const dateMap = new Map<string, number>();
    for (const v of videos) {
      if (v.publishedAt) {
        const day = v.publishedAt.split('T')[0];
        if (!dateMap.has(day)) {
          dateMap.set(day, 0);
        }
      }
    }

    // Also include channel creation date if available
    if (channel.publishedAt) {
      const createdDay = channel.publishedAt.split('T')[0];
      if (!dateMap.has(createdDay)) {
        dateMap.set(createdDay, 0);
      }
    }

    for (const [date] of dateMap) {
      if (date >= new Date().toISOString().split('T')[0]) continue; // skip today/future

      const existing = await this.snapshotRepo.findOne({ where: { channelId, date } });
      if (existing) continue;

      // Estimate subscribers at this date: linear growth from 0 at creation to current today
      const videoDate = new Date(date).getTime();
      const progress = lifespan > 0 ? Math.min((videoDate - channelCreated) / lifespan, 1) : 0;
      const estimatedSubs = Math.round(currentSubscribers * progress);

      await this.snapshotRepo.save({
        channelId,
        date,
        subscribers: estimatedSubs,
        totalViews: 0,
        videoCount: 0,
      });
    }
  }

  async saveInitialSnapshot(channelId: string, subscribers: number, totalViews: number, videoCount: number): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const existing = await this.snapshotRepo.findOne({ where: { channelId, date: today } });
    if (!existing) {
      await this.snapshotRepo.save({ channelId, date: today, subscribers, totalViews, videoCount });
    }
  }

  async remove(channelId: string): Promise<void> {
    const channel = await this.channelRepo.findOne({ where: { channelId } });
    if (!channel) {
      throw new NotFoundException(`Channel ${channelId} not found`);
    }
    await this.snapshotRepo.delete({ channelId });
    await this.channelRepo.delete({ channelId });
  }

  async getBrands(): Promise<string[]> {
    const channels = await this.channelRepo.find();
    const brands = [...new Set(channels.map((c) => c.brand))];
    return brands.sort();
  }

  async getConsolidated(): Promise<any[]> {
    const channels = await this.channelRepo.find();
    const result: any[] = [];

    for (const ch of channels) {
      const latest = await this.snapshotRepo.findOne({
        where: { channelId: ch.channelId },
        order: { date: 'DESC' },
      });

      const first = await this.snapshotRepo.findOne({
        where: { channelId: ch.channelId },
        order: { date: 'ASC' },
      });

      result.push({
        channelId: ch.channelId,
        title: ch.title,
        brand: ch.brand,
        thumbnailUrl: ch.thumbnailUrl,
        description: ch.description || '',
        subscribers: latest?.subscribers || 0,
        totalViews: latest?.totalViews || 0,
        videoCount: latest?.videoCount || 0,
        startSubscribers: first?.subscribers || null,
        snapshotDate: latest?.date || null,
      });
    }

    return result;
  }
}
