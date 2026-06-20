import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { ChannelSnapshot } from '../entities/channel-snapshot.entity';
import { Video } from '../entities/video.entity';
import { Channel } from '../entities/channel.entity';

export interface EngagementResult {
  rate: number | null;
  label: string;
}

export interface GrowthResult {
  netGrowth: number;
  growthRate: number | null;
}

export interface ChannelGrowthInfo {
  channelId: string;
  title: string;
  brand: string;
  netGrowth: number;
  growthRate: number | null;
  startSubs: number;
  endSubs: number;
}

export interface TopVideo {
  videoId: string;
  title: string;
  channelId: string;
  channelTitle: string;
  views: number;
  likes: number;
  comments: number;
  interactions: number;
  engagementRate: number | null;
  engagementLabel: string;
  durationSec: number;
  isShort: boolean;
}

export interface ContentTypeSummary {
  type: 'Short' | 'Video largo';
  avgEngagement: number | null;
  totalInteractions: number;
  totalViews: number;
  videoCount: number;
}

export interface TrendResult {
  channelId: string;
  title: string;
  trend: 'creciente' | 'plana' | 'decreciente';
  reason: string;
}

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(ChannelSnapshot)
    private snapshotRepo: Repository<ChannelSnapshot>,
    @InjectRepository(Video)
    private videoRepo: Repository<Video>,
    @InjectRepository(Channel)
    private channelRepo: Repository<Channel>,
  ) {}

  calculateEngagement(
    views: number,
    likes: number,
    comments: number,
  ): EngagementResult {
    if (views === 0) {
      return { rate: null, label: 'sin datos' };
    }
    const rate = ((likes + comments) / views) * 100;
    return {
      rate: Math.round(rate * 100) / 100,
      label: `${Math.round(rate * 100) / 100}%`,
    };
  }

  calculateGrowth(startSubs: number, endSubs: number): GrowthResult {
    const netGrowth = endSubs - startSubs;
    if (startSubs === 0) {
      return { netGrowth, growthRate: null };
    }
    const growthRate = ((endSubs - startSubs) / startSubs) * 100;
    return { netGrowth, growthRate: Math.round(growthRate * 100) / 100 };
  }

  async getChannelGrowth(
    channelId: string,
    startDate: string,
    endDate: string,
  ): Promise<{
    netGrowth: number;
    growthRate: number | null;
    startSubs: number;
    endSubs: number;
  }> {
    const startSnapshot = await this.snapshotRepo.findOne({
      where: { channelId, date: startDate },
      order: { date: 'ASC' },
    });

    const endSnapshot = await this.snapshotRepo.findOne({
      where: { channelId, date: endDate },
      order: { date: 'DESC' },
    });

    if (!startSnapshot || !endSnapshot) {
      return { netGrowth: 0, growthRate: null, startSubs: 0, endSubs: 0 };
    }

    return {
      ...this.calculateGrowth(
        startSnapshot.subscribers,
        endSnapshot.subscribers,
      ),
      startSubs: startSnapshot.subscribers,
      endSubs: endSnapshot.subscribers,
    };
  }

  async getTopGrowingChannels(
    startDate: string,
    endDate: string,
    threshold?: number,
    brands?: string[],
  ): Promise<{ ranking: ChannelGrowthInfo[]; stagnant: ChannelGrowthInfo[] }> {
    const snapshots = await this.snapshotRepo.find({
      where: { date: Between(startDate, endDate) },
      order: { channelId: 'ASC', date: 'ASC' },
    });

    const channelMap = new Map<string, ChannelSnapshot[]>();
    for (const snap of snapshots) {
      if (!channelMap.has(snap.channelId)) {
        channelMap.set(snap.channelId, []);
      }
      channelMap.get(snap.channelId)!.push(snap);
    }

    const channels = await this.channelRepo.find();
    const channelInfoMap = new Map(channels.map((c) => [c.channelId, c]));

    const growthList: ChannelGrowthInfo[] = [];

    for (const [channelId, snaps] of channelMap.entries()) {
      if (snaps.length < 1) continue;

      const info = channelInfoMap.get(channelId);
      if (brands && brands.length > 0 && info && !brands.includes(info.brand))
        continue;

      const first = snaps[0];
      const last = snaps[snaps.length - 1];
      // Only calculate growth if we have at least 2 snapshots
      const growth = snaps.length >= 2
        ? this.calculateGrowth(first.subscribers, last.subscribers)
        : { netGrowth: 0, growthRate: null };

      growthList.push({
        channelId,
        title: info?.title || channelId,
        brand: info?.brand || 'Unknown',
        netGrowth: growth.netGrowth,
        growthRate: growth.growthRate,
        startSubs: first.subscribers,
        endSubs: last.subscribers,
      });
    }

    growthList.sort(
      (a, b) => (b.growthRate ?? -Infinity) - (a.growthRate ?? -Infinity),
    );

    const defaultThreshold = threshold ?? 0.5;
    const stagnant = growthList.filter(
      (g) => g.growthRate !== null && g.growthRate <= defaultThreshold,
    );

    return { ranking: growthList, stagnant };
  }

  async getTopVideos(
    startDate?: string,
    endDate?: string,
    channelId?: string,
    limit = 10,
  ): Promise<TopVideo[]> {
    const where: any = {};
    if (channelId) where.channelId = channelId;
    if (startDate && endDate) {
      where.publishedAt = Between(new Date(startDate), new Date(endDate));
    }

    const videos = await this.videoRepo.find({ where });

    const channels = await this.channelRepo.find();
    const channelMap = new Map(channels.map((c) => [c.channelId, c]));

    const result: TopVideo[] = videos.map((v) => {
      const engagement = this.calculateEngagement(v.views, v.likes, v.comments);
      return {
        videoId: v.videoId,
        title: v.title,
        channelId: v.channelId,
        channelTitle: channelMap.get(v.channelId)?.title || v.channelId,
        views: v.views,
        likes: v.likes,
        comments: v.comments,
        interactions: v.likes + v.comments,
        engagementRate: engagement.rate,
        engagementLabel: engagement.label,
        durationSec: v.durationSec,
        isShort: v.durationSec <= 60,
      };
    });

    result.sort((a, b) => {
      if (b.interactions !== a.interactions)
        return b.interactions - a.interactions;
      return (b.engagementRate ?? -1) - (a.engagementRate ?? -1);
    });

    return result.slice(0, limit);
  }

  async getContentTypeComparison(
    startDate?: string,
    endDate?: string,
  ): Promise<{ shorts: ContentTypeSummary; longVideos: ContentTypeSummary }> {
    const where: any = {};
    if (startDate && endDate) {
      where.publishedAt = Between(new Date(startDate), new Date(endDate));
    }

    const videos = await this.videoRepo.find({ where });

    const shorts = videos.filter((v) => v.durationSec <= 60);
    const longVideos = videos.filter((v) => v.durationSec > 60);

    const summarize = (list: Video[]): ContentTypeSummary => {
      if (list.length === 0) {
        return {
          type: 'Short',
          avgEngagement: null,
          totalInteractions: 0,
          totalViews: 0,
          videoCount: 0,
        };
      }
      const totalViews = list.reduce((s, v) => s + v.views, 0);
      const totalInteractions = list.reduce(
        (s, v) => s + v.likes + v.comments,
        0,
      );
      const engagements = list
        .filter((v) => v.views > 0)
        .map((v) => ((v.likes + v.comments) / v.views) * 100);
      const avgEngagement =
        engagements.length > 0
          ? Math.round(
              (engagements.reduce((s, e) => s + e, 0) / engagements.length) *
                100,
            ) / 100
          : null;
      return {
        type: 'Short',
        avgEngagement,
        totalInteractions,
        totalViews,
        videoCount: list.length,
      };
    };

    return {
      shorts: { ...summarize(shorts), type: 'Short' },
      longVideos: { ...summarize(longVideos), type: 'Video largo' },
    };
  }

  async getTrend(
    channelId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<TrendResult> {
    const where: any = { channelId };
    if (startDate && endDate) {
      where.date = Between(startDate, endDate);
    }
    const snapshots = await this.snapshotRepo.find({
      where,
      order: { date: 'ASC' },
    });

    const channel = await this.channelRepo.findOne({ where: { channelId } });

    if (snapshots.length < 2) {
      return {
        channelId,
        title: channel?.title || channelId,
        trend: 'plana',
        reason:
          snapshots.length === 0
            ? 'Sin datos'
            : 'Solo un punto, no hay suficiente historia',
      };
    }

    const mid = Math.floor(snapshots.length / 2);
    const firstHalf = snapshots.slice(0, mid);
    const secondHalf = snapshots.slice(mid);

    const firstAvg =
      firstHalf.reduce((s, x) => s + x.subscribers, 0) / firstHalf.length;
    const secondAvg =
      secondHalf.reduce((s, x) => s + x.subscribers, 0) / secondHalf.length;

    const diff = ((secondAvg - firstAvg) / firstAvg) * 100;

    let trend: 'creciente' | 'plana' | 'decreciente';
    let reason: string;

    if (diff > 0.5) {
      trend = 'creciente';
      reason = `La comunidad crece: +${Math.round(diff * 100) / 100}% entre la primera y segunda mitad del periodo`;
    } else if (diff < -0.5) {
      trend = 'decreciente';
      reason = `La comunidad decrece: ${Math.round(diff * 100) / 100}% entre la primera y segunda mitad del periodo`;
    } else {
      trend = 'plana';
      reason = `La comunidad se mantiene estable: ${Math.round(diff * 100) / 100}% de cambio entre mitades`;
    }

    return {
      channelId,
      title: channel?.title || channelId,
      trend,
      reason,
    };
  }

  async getDashboardSummary(
    startDate?: string,
    endDate?: string,
    brands?: string[],
  ): Promise<any> {
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];
    const sDate = startDate || weekAgo;
    const eDate = endDate || today;

    const { ranking, stagnant } = await this.getTopGrowingChannels(
      sDate,
      eDate,
      undefined,
      brands,
    );

    // Include channels that have no snapshots in the period but exist in DB
    const allChannels = await this.channelRepo.find();
    const filteredChannels = brands && brands.length > 0
      ? allChannels.filter((c) => brands.includes(c.brand))
      : allChannels;

    const rankingIds = new Set(ranking.map(r => r.channelId));
    for (const ch of filteredChannels) {
      if (!rankingIds.has(ch.channelId)) {
        // Only include if there's at least 1 real snapshot with subscriber data
        const latestSnap = await this.snapshotRepo.findOne({
          where: { channelId: ch.channelId },
          order: { date: 'DESC' },
        });
        if (latestSnap && latestSnap.subscribers > 0) {
          ranking.push({
            channelId: ch.channelId,
            title: ch.title,
            brand: ch.brand,
            netGrowth: 0,
            growthRate: null,
            startSubs: latestSnap.subscribers,
            endSubs: latestSnap.subscribers,
          });
        }
        // Channels with no snapshots or 0 subscribers are silently excluded
      }
    }

    const topVideos = await this.getTopVideos(sDate, eDate);
    const contentType = await this.getContentTypeComparison(sDate, eDate);

    const trends: TrendResult[] = [];
    for (const ch of filteredChannels) {
      // Only include in trends if the channel has enough history (≥2 snapshots)
      const snapCount = await this.snapshotRepo.count({ where: { channelId: ch.channelId } });
      if (snapCount >= 2) {
        trends.push(await this.getTrend(ch.channelId, sDate, eDate));
      }
    }

    const allSnapshots = await this.snapshotRepo.find({
      where: sDate && eDate ? { date: Between(sDate, eDate) } : {},
      order: { date: 'ASC' },
    });

    // Also include recent snapshots outside the period for timeline continuity
    const recentSnapshots = await this.snapshotRepo.find({
      order: { date: 'DESC' },
      take: 500,
    });

    const timeline: Record<
      string,
      { date: string; subscribers: number; channelId: string; title: string }[]
    > = {};
    const chMap = new Map(allChannels.map((c) => [c.channelId, c.title]));

    // Use broader snapshot set for timeline to show channels with data outside the period
    const snapshotsForTimeline = allSnapshots.length > 0 ? allSnapshots : recentSnapshots;
    for (const snap of snapshotsForTimeline) {
      if (!timeline[snap.channelId]) {
        timeline[snap.channelId] = [];
      }
      timeline[snap.channelId].push({
        date: snap.date,
        subscribers: snap.subscribers,
        channelId: snap.channelId,
        title: chMap.get(snap.channelId) || snap.channelId,
      });
    }

    // Summary stats per channel — only include channels with real snapshot data
    const channelsSummaryRaw = await Promise.all(filteredChannels.map(async ch => {
      const latest = await this.snapshotRepo.findOne({
        where: { channelId: ch.channelId },
        order: { date: 'DESC' },
      });
      if (!latest || latest.subscribers === 0) return null; // skip channels with no data
      const rankEntry = ranking.find(r => r.channelId === ch.channelId);
      const videoCount = await this.videoRepo.count({ where: { channelId: ch.channelId } });
      return {
        channelId: ch.channelId,
        title: ch.title,
        brand: ch.brand,
        thumbnailUrl: ch.thumbnailUrl || '',
        subscribers: latest.subscribers,
        videoCount: latest.videoCount || videoCount || 0,
        growthRate: rankEntry?.growthRate ?? null,
        netGrowth: rankEntry?.netGrowth ?? 0,
        snapshotDate: latest.date,
      };
    }));
    const channelsSummary = channelsSummaryRaw.filter(Boolean);

    return {
      period: { start: sDate, end: eDate },
      channelGrowth: { ranking, stagnant },
      topVideos,
      contentTypeComparison: contentType,
      trends,
      timeline,
      channelsSummary,
    };
  }
}
