import { Controller, Get, Post, Body, HttpException, HttpStatus, Query, Inject } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { YoutubeService } from './youtube.service';

@Controller('dashboard')
export class DashboardController {
  constructor(
    @Inject(DatabaseService) private readonly db: DatabaseService,
    @Inject(YoutubeService) private readonly youtubeService: YoutubeService
  ) {}

  @Post('ingest')
  async forceIngest() {
    await this.youtubeService.forceIngest();
    return { success: true };
  }

  @Post('channels')
  addChannel(@Body() body: { channelId: string, channelName?: string }) {
    if (!body.channelId) throw new HttpException('channelId is required', HttpStatus.BAD_REQUEST);
    
    let parsedId = body.channelId.trim();
    // Try to extract handle or ID from URL if provided
    if (parsedId.includes('youtube.com/') || parsedId.includes('youtu.be/')) {
      const urlPath = parsedId.split(/youtube\.com|youtu\.be/)[1];
      const parts = urlPath.split(/[\/?&#]/).filter(Boolean);
      if (parts.length > 0) {
        if (['channel', 'c', 'user'].includes(parts[0]) && parts.length > 1) {
          parsedId = parts[1];
        } else if (parts[0].startsWith('@')) {
          parsedId = parts[0];
        }
      }
    }
    
    // Fallback: if it's still a URL somehow, just discard the URL part
    if (parsedId.startsWith('http')) {
       return { success: false, error: 'Invalid channel ID format' };
    }

    this.db.addChannel(parsedId, body.channelName || parsedId);
    return { success: true };
  }

  @Post('groups/members')
  addGroupMembers(@Body() body: { channelId: string, members: number, date?: string }) {
    if (!body.channelId) throw new HttpException('channelId is required', HttpStatus.BAD_REQUEST);
    if (typeof body.members !== 'number') throw new HttpException('members must be a number', HttpStatus.BAD_REQUEST);

    const channel = this.db.getChannelById(body.channelId) as any;
    if (!channel) throw new HttpException('Group channel not found', HttpStatus.NOT_FOUND);

    const targetDate = body.date || new Date().toISOString().split('T')[0];
    
    // We check if a snapshot exists for this date, if so we update it or delete then insert
    this.db.deleteSnapshotForDate(body.channelId, targetDate);
    this.db.saveChannelSnapshot({
      channel_id: channel.channel_id,
      channel_name: channel.channel_name,
      date: targetDate,
      subscribers: body.members,
      views: 0
    });

    return { success: true };
  }

  @Get('metrics')
  getCalculatedMetrics(@Query('period') period?: string) {
    const allChannels = this.db.getChannels() as any[];
    const channelPlatformMap = new Map<string, string>();
    allChannels.forEach(c => channelPlatformMap.set(c.channel_id, c.platform || 'youtube'));

    const allChannelSnaps = this.db.getAllChannelSnapshots();
    const allVideoSnapsRaw = this.db.getAllVideoSnapshots();

    // Filter snapshots based on period
    const now = new Date();
    const periodValue = (period || 'all').toLowerCase();
    let statsStartDate = new Date(0);
    if (periodValue === 'week') {
      statsStartDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (periodValue === 'month') {
      statsStartDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    const isoStatsStart = statsStartDate.toISOString();

    const channelsMap = new Map<string, { latest: any, oldest: any, history: any[] }>();
    allChannelSnaps.forEach(snap => {
      if (!channelsMap.has(snap.channel_id)) {
        channelsMap.set(snap.channel_id, { latest: snap, oldest: snap, history: [] });
      }
      const ch = channelsMap.get(snap.channel_id)!;
      if (snap.date > ch.latest.date) ch.latest = snap;
    });

    // Apply period filtering for history and oldest
    allChannelSnaps.filter(s => s.date >= isoStatsStart).forEach(snap => {
       const ch = channelsMap.get(snap.channel_id);
       if (ch) {
         ch.history.push(snap);
         // Find oldest within the allowed period
         if (ch.oldest.date < isoStatsStart || snap.date < ch.oldest.date) {
             ch.oldest = snap;
         }
       }
    });

    const channelsAnalysis = Array.from(channelsMap.values()).map(ch => {
      if (ch.history.length === 0) {
          ch.history.push(ch.latest);
          ch.oldest = ch.latest;
      }
      const subsFin = ch.latest.subscribers;
      const subsInicio = ch.oldest.subscribers;
      const calcCrecimientoNeto = subsFin - subsInicio;
      const divisionSafe = subsInicio === 0 ? 1 : subsInicio;
      const tasaCrecimiento = (calcCrecimientoNeto / divisionSafe) * 100;

      const dFin = new Date(ch.latest.date).getTime();
      const dInicio = new Date(ch.oldest.date).getTime();
      let diffDays = Math.round((dFin - dInicio) / (1000 * 60 * 60 * 24));
      if (diffDays <= 0) diffDays = 1;
      const dailyGrowth = Math.round(calcCrecimientoNeto / diffDays);

      let trend = "Plana";
      if (ch.history.length >= 2) {
         const mid = Math.floor(ch.history.length / 2);
         const firstHalf = ch.history.slice(0, mid);
         const secondHalf = ch.history.slice(mid);
         const firstHalfAvg = firstHalf.reduce((acc, val) => acc + val.subscribers, 0) / firstHalf.length;
         const secondHalfAvg = secondHalf.reduce((acc, val) => acc + val.subscribers, 0) / secondHalf.length;
         if (secondHalfAvg > firstHalfAvg) trend = "Creciente";
         else if (secondHalfAvg < firstHalfAvg) trend = "Decreciente";
      }

      const allVideoSnapsLatest = this.db.getAllLatestVideoSnapshots();
      const vids = allVideoSnapsLatest.filter((v: any) => v.channel_id === ch.latest.channel_id);
      let totalEngagementRate = 0;
      let validVideos = 0;
      vids.forEach((v: any) => {
        if (v.views > 0) {
          const er = ((v.likes + v.comments) / v.views) * 100;
          totalEngagementRate += er;
          validVideos++;
        }
      });
      const engagementPromedio = validVideos > 0 ? totalEngagementRate / validVideos : 0;

      return {
        channelId: ch.latest.channel_id,
        channelName: ch.latest.channel_name,
        platform: channelPlatformMap.get(ch.latest.channel_id) || 'youtube',
        history: ch.history,
        metrics: { subscribers: subsFin, netGrowth: calcCrecimientoNeto, dailyGrowth, growthRatePercent: tasaCrecimiento, engagementPromedio, trend }
      };
    });

    channelsAnalysis.sort((a, b) => b.metrics.growthRatePercent - a.metrics.growthRatePercent);

    const videosMap = new Map<string, { latest: any, oldestInPeriod: any }>();
    const allLatestVideos = this.db.getAllLatestVideoSnapshots();
    allLatestVideos.forEach((v: any) => {
      videosMap.set(v.video_id, { latest: v, oldestInPeriod: v });
    });

    allVideoSnapsRaw.filter((v: any) => v.date >= isoStatsStart).forEach((v: any) => {
      if (videosMap.has(v.video_id)) {
        const vp = videosMap.get(v.video_id)!;
        if (vp.oldestInPeriod.date < isoStatsStart || v.date < vp.oldestInPeriod.date) {
           vp.oldestInPeriod = v;
        }
      }
    });

    const videosAnalysis = Array.from(videosMap.values()).map(({latest, oldestInPeriod}) => {
      const v = latest;
      const oldV = oldestInPeriod;
      
      const viewsGained = v.views - oldV.views;
      const interacciones = v.likes + v.comments;
      const engagementRate = v.views > 0 ? (interacciones / v.views) * 100 : 0;
      
      return { 
        ...v, 
        id: v.video_id, 
        channelId: v.channel_id,
        isShort: v.duration <= 60, 
        interacciones, 
        engagementRate,
        viewsGained
      };
    });

    videosAnalysis.sort((a, b) => {
      if (b.viewsGained !== a.viewsGained) return b.viewsGained - a.viewsGained;
      if (b.interacciones !== a.interacciones) return b.interacciones - a.interacciones;
      return b.engagementRate - a.engagementRate;
    });

    let shortsER = 0, shortsCount = 0, longsER = 0, longsCount = 0;
    videosAnalysis.forEach(v => {
      if (v.views > 0) {
        if (v.isShort) { shortsER += v.engagementRate; shortsCount++; }
        else { longsER += v.engagementRate; longsCount++; }
      }
    });

    return {
      channels: channelsAnalysis,
      videos: videosAnalysis,
      aggregate: {
        shortsAvgEngagement: shortsCount > 0 ? shortsER / shortsCount : 0,
        longsAvgEngagement: longsCount > 0 ? longsER / longsCount : 0,
      }
    };
  }
}
