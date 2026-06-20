import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface SocialSnapshot {
  date: string;
  followers?: number;
  members?: number;
  likes?: number;
  reach?: number;
  posts?: number;
  engagements?: number;
  avgLikes?: number;
  avgComments?: number;
  following?: number;
}

export interface SocialAccount {
  id: string;
  name: string;
  brand: string;
  platform: 'facebook_page' | 'instagram' | 'facebook_group' | 'tiktok';
  username?: string;
  type?: string;
  description?: string;
  thumbnailUrl: string;
  snapshots: SocialSnapshot[];
  topPosts?: any[];
  growthRate?: number | null;
  netGrowth?: number;
  currentFollowers?: number;
}

@Injectable()
export class SocialDataService {
  private readonly logger = new Logger(SocialDataService.name);
  private dataset: any = null;

  constructor() {
    this.loadDataset();
  }

  private loadDataset() {
    try {
      const p = path.join(process.cwd(), 'backup-data', 'social-dataset.json');
      const raw = fs.readFileSync(p, 'utf8');
      this.dataset = JSON.parse(raw);
      this.logger.log('Social dataset loaded successfully');
    } catch (err) {
      this.logger.warn('Could not load social dataset: ' + err.message);
      this.dataset = { facebook_pages: [], instagram: [], facebook_groups: [], tiktok: [] };
    }
  }

  private calcGrowth(snapshots: SocialSnapshot[], field: 'followers' | 'members') {
    if (!snapshots || snapshots.length < 2) {
      return { growthRate: null, netGrowth: 0 };
    }
    const first = snapshots[0][field] || 0;
    const last  = snapshots[snapshots.length - 1][field] || 0;
    const net   = last - first;
    const rate  = first > 0 ? Math.round((net / first) * 10000) / 100 : null;
    return { growthRate: rate, netGrowth: net };
  }

  private calcEngagement(snapshots: SocialSnapshot[]): number | null {
    const valid = snapshots.filter(s => (s.reach || 0) > 0 && (s.engagements || 0) > 0);
    if (valid.length === 0) return null;
    const avg = valid.reduce((sum, s) => sum + ((s.engagements! / s.reach!) * 100), 0) / valid.length;
    return Math.round(avg * 100) / 100;
  }

  getAllAccounts(startDate?: string, endDate?: string, brand?: string): SocialAccount[] {
    if (!this.dataset) return [];

    const filterSnaps = (snaps: SocialSnapshot[]) => {
      if (!startDate && !endDate) return snaps;
      return snaps.filter(s => {
        if (startDate && s.date < startDate) return false;
        if (endDate   && s.date > endDate)   return false;
        return true;
      });
    };

    const results: SocialAccount[] = [];

    // Facebook Pages
    for (const page of (this.dataset.facebook_pages || [])) {
      if (brand && page.brand !== brand) continue;
      const snaps = filterSnaps(page.snapshots || []);
      const { growthRate, netGrowth } = this.calcGrowth(snaps, 'followers');
      results.push({
        id: page.pageId,
        name: page.name,
        brand: page.brand,
        platform: 'facebook_page',
        thumbnailUrl: page.thumbnailUrl || '',
        snapshots: snaps,
        topPosts: page.topPosts || [],
        growthRate,
        netGrowth,
        currentFollowers: snaps.length > 0 ? snaps[snaps.length - 1].followers : 0,
      });
    }

    // Instagram
    for (const acc of (this.dataset.instagram || [])) {
      if (brand && acc.brand !== brand) continue;
      const snaps = filterSnaps(acc.snapshots || []);
      const { growthRate, netGrowth } = this.calcGrowth(snaps, 'followers');
      results.push({
        id: acc.accountId,
        name: acc.name,
        brand: acc.brand,
        platform: 'instagram',
        username: acc.username,
        thumbnailUrl: acc.thumbnailUrl || '',
        snapshots: snaps,
        topPosts: acc.topPosts || [],
        growthRate,
        netGrowth,
        currentFollowers: snaps.length > 0 ? snaps[snaps.length - 1].followers : 0,
      });
    }

    // Facebook Groups
    for (const grp of (this.dataset.facebook_groups || [])) {
      if (brand && grp.brand !== brand) continue;
      const snaps = filterSnaps(grp.snapshots || []);
      const { growthRate, netGrowth } = this.calcGrowth(snaps, 'members');
      results.push({
        id: grp.groupId,
        name: grp.name,
        brand: grp.brand,
        platform: 'facebook_group',
        type: grp.type,
        description: grp.description,
        thumbnailUrl: '',
        snapshots: snaps,
        growthRate,
        netGrowth,
        currentFollowers: snaps.length > 0 ? snaps[snaps.length - 1].members : 0,
      });
    }

    // TikTok
    for (const acc of (this.dataset.tiktok || [])) {
      if (brand && acc.brand !== brand) continue;
      const snaps = filterSnaps(acc.snapshots || []);
      const { growthRate, netGrowth } = this.calcGrowth(snaps, 'followers');
      results.push({
        id: acc.accountId,
        name: acc.name,
        brand: acc.brand,
        platform: 'tiktok',
        username: acc.username,
        thumbnailUrl: acc.thumbnailUrl || '',
        snapshots: snaps,
        topPosts: acc.topVideos || [],
        growthRate,
        netGrowth,
        currentFollowers: snaps.length > 0 ? snaps[snaps.length - 1].followers : 0,
      });
    }

    return results;
  }

  getSummary(startDate?: string, endDate?: string, brand?: string) {
    const accounts = this.getAllAccounts(startDate, endDate, brand);

    const byPlatform = {
      facebook_page:  accounts.filter(a => a.platform === 'facebook_page'),
      instagram:      accounts.filter(a => a.platform === 'instagram'),
      facebook_group: accounts.filter(a => a.platform === 'facebook_group'),
      tiktok:         accounts.filter(a => a.platform === 'tiktok'),
    };

    const totalCommunity = accounts.reduce((s, a) => s + (a.currentFollowers || 0), 0);

    const topGrowing = [...accounts]
      .filter(a => a.growthRate !== null)
      .sort((a, b) => (b.growthRate ?? -Infinity) - (a.growthRate ?? -Infinity));

    const timeline: Record<string, { date: string; followers: number; name: string; platform: string }[]> = {};
    for (const acc of accounts) {
      const field = acc.platform === 'facebook_group' ? 'members' : 'followers';
      timeline[acc.id] = (acc.snapshots || []).map(s => ({
        date: s.date,
        followers: (s as any)[field] || 0,
        name: acc.name,
        platform: acc.platform,
      }));
    }

    return {
      accounts,
      byPlatform,
      totalCommunity,
      topGrowing,
      timeline,
      accountCount: accounts.length,
    };
  }

  // Manual group member entry
  addGroupSnapshot(groupId: string, date: string, members: number): { success: boolean; message: string } {
    if (!this.dataset) return { success: false, message: 'Dataset no disponible' };

    const group = this.dataset.facebook_groups?.find((g: any) => g.groupId === groupId);
    if (!group) return { success: false, message: `Grupo ${groupId} no encontrado` };

    const existing = group.snapshots?.find((s: any) => s.date === date);
    if (existing) {
      existing.members = members;
    } else {
      if (!group.snapshots) group.snapshots = [];
      group.snapshots.push({ date, members });
      group.snapshots.sort((a: any, b: any) => a.date.localeCompare(b.date));
    }

    // Persist to disk
    try {
      const p = path.join(process.cwd(), 'backup-data', 'social-dataset.json');
      fs.writeFileSync(p, JSON.stringify(this.dataset, null, 2), 'utf8');
    } catch (err) {
      this.logger.warn('Could not persist dataset: ' + err.message);
    }

    return { success: true, message: `Miembros del grupo actualizados: ${members} para ${date}` };
  }

  getGroups() {
    return (this.dataset?.facebook_groups || []).map((g: any) => ({
      groupId: g.groupId,
      name: g.name,
      brand: g.brand,
      type: g.type,
      description: g.description,
      latestMembers: g.snapshots?.length > 0 ? g.snapshots[g.snapshots.length - 1].members : 0,
      snapshotCount: g.snapshots?.length || 0,
    }));
  }
}
