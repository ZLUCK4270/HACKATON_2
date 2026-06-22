import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Database from 'better-sqlite3';
import path from 'path';

export interface ChannelSnapshot {
  id?: number;
  channel_id: string;
  channel_name: string;
  date: string;
  subscribers: number;
  views: number;
}
export interface VideoSnapshot {
  id?: number;
  video_id: string;
  channel_id: string;
  date: string;
  title: string;
  duration: number;
  views: number;
  likes: number;
  comments: number;
}

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private db!: Database.Database;

  onModuleInit() {
    this.db = new Database(path.join(process.cwd(), 'database.sqlite'));
    this.initSchema();
  }

  onModuleDestroy() {
    if (this.db) this.db.close();
  }

  private initSchema() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS channels (channel_id TEXT PRIMARY KEY, channel_name TEXT, platform TEXT DEFAULT 'youtube', tracked_since TEXT);
      CREATE TABLE IF NOT EXISTS channel_snapshots (
        id INTEGER PRIMARY KEY AUTOINCREMENT, channel_id TEXT, channel_name TEXT, date TEXT, subscribers INTEGER, views INTEGER,
        FOREIGN KEY(channel_id) REFERENCES channels(channel_id)
      );
      CREATE TABLE IF NOT EXISTS video_snapshots (
        id INTEGER PRIMARY KEY AUTOINCREMENT, video_id TEXT, channel_id TEXT, date TEXT, title TEXT, duration INTEGER, views INTEGER, likes INTEGER, comments INTEGER,
        UNIQUE(video_id, date)
      );
    `);
    try {
      this.db.exec(`ALTER TABLE channels ADD COLUMN platform TEXT DEFAULT 'youtube';`);
    } catch(e) {} // Column might already exist
  }

  addChannel(channelId: string, channelName: string, platform: string = 'youtube') {
    this.db.prepare('INSERT OR IGNORE INTO channels (channel_id, channel_name, platform, tracked_since) VALUES (?, ?, ?, ?)').run(channelId, channelName, platform, new Date().toISOString().split('T')[0]);
  }

  deleteChannel(channelId: string) {
    this.db.prepare('DELETE FROM video_snapshots WHERE channel_id = ?').run(channelId);
    this.db.prepare('DELETE FROM channel_snapshots WHERE channel_id = ?').run(channelId);
    this.db.prepare('DELETE FROM channels WHERE channel_id = ?').run(channelId);
  }

  getChannelById(channelId: string) {
    return this.db.prepare('SELECT * FROM channels WHERE channel_id = ?').get(channelId);
  }

  deleteSnapshotForDate(channelId: string, date: string) {
    this.db.prepare('DELETE FROM channel_snapshots WHERE channel_id = ? AND date = ?').run(channelId, date);
  }

  getChannels() {
    return this.db.prepare('SELECT * FROM channels').all();
  }

  saveChannelSnapshot(snapshot: Omit<ChannelSnapshot, 'id'>) {
    this.db.prepare('INSERT INTO channel_snapshots (channel_id, channel_name, date, subscribers, views) VALUES (?, ?, ?, ?, ?)').run(snapshot.channel_id, snapshot.channel_name, snapshot.date, snapshot.subscribers, snapshot.views);
  }

  saveVideoSnapshots(snapshots: Omit<VideoSnapshot, 'id'>[]) {
    const stmt = this.db.prepare('INSERT OR REPLACE INTO video_snapshots (video_id, channel_id, date, title, duration, views, likes, comments) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    const insertMany = this.db.transaction((snaps: Omit<VideoSnapshot, 'id'>[]) => {
      for (const snap of snaps) stmt.run(snap.video_id, snap.channel_id, snap.date, snap.title, snap.duration, snap.views, snap.likes, snap.comments);
    });
    insertMany(snapshots);
  }

  getAllChannelSnapshots(): ChannelSnapshot[] {
    return this.db.prepare('SELECT * FROM channel_snapshots ORDER BY date ASC').all() as ChannelSnapshot[];
  }

  getAllVideoSnapshots(): VideoSnapshot[] {
    return this.db.prepare('SELECT * FROM video_snapshots ORDER BY date ASC').all() as VideoSnapshot[];
  }

  getAllLatestVideoSnapshots(): VideoSnapshot[] {
    return this.db.prepare(`SELECT v.* FROM video_snapshots v INNER JOIN (SELECT video_id, MAX(date) as maxDate FROM video_snapshots GROUP BY video_id) latest ON v.video_id = latest.video_id AND v.date = latest.maxDate`).all() as VideoSnapshot[];
  }

  seedTestDataIfEmpty() {
    // Also clean up any messed up rows from bad parser
    this.db.prepare("DELETE FROM channels WHERE channel_id LIKE 'http%'").run();
    this.db.prepare("DELETE FROM channels WHERE channel_id = 'UCX6OQ3DkcsbYNE6H8uQquQA'").run();
    this.db.prepare("DELETE FROM channel_snapshots WHERE channel_id NOT IN (SELECT channel_id FROM channels)").run();
    this.db.prepare("DELETE FROM video_snapshots WHERE channel_id NOT IN (SELECT channel_id FROM channels)").run();

    if ((this.getChannels() as any[]).length === 0) {
      this.addChannel('UC_x5XG1OV2P6uZZ5FSM9Ttw', 'Google Developers', 'youtube');
    }

    // dataset de respaldo loading
    const otherChannels = [
      { id: 'fb_page_1', name: 'RPSoft FB Page', platform: 'facebook' },
      { id: 'ig_acc_1', name: '@rpsoft_ig', platform: 'instagram' },
      { id: 'fb_group_1', name: 'RPSoft Community', platform: 'facebook_group' }
    ];

    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStrYest = yesterday.toISOString().split('T')[0];

    for (const c of otherChannels) {
      const existing = this.db.prepare("SELECT * FROM channels WHERE channel_id = ?").get(c.id);
      if (!existing) {
        this.addChannel(c.id, c.name, c.platform);
        
        let initialSubs = 0;
        let growth = 0;
        let v_id_prefix = c.id;

        if (c.platform === 'facebook') { initialSubs = 25000; growth = 120; }
        if (c.platform === 'instagram') { initialSubs = 18000; growth = 300; }
        if (c.platform === 'facebook_group') { initialSubs = 5000; growth = 25; }

        this.saveChannelSnapshot({ channel_id: c.id, channel_name: c.name, date: dateStrYest, subscribers: initialSubs, views: 0 });
        this.saveChannelSnapshot({ channel_id: c.id, channel_name: c.name, date: dateStr, subscribers: initialSubs + growth, views: 0 });

        if (c.platform !== 'facebook_group') { // groups don't have posts/videos in our simple mockup
           this.saveVideoSnapshots([
             { video_id: v_id_prefix + '_vid1', channel_id: c.id, date: dateStr, title: `${c.platform} Post 1`, duration: 60, views: 5000, likes: 250, comments: 40 },
             { video_id: v_id_prefix + '_vid2', channel_id: c.id, date: dateStr, title: `${c.platform} Post 2`, duration: 120, views: 2000, likes: 100, comments: 5 },
           ]);
        }
      }
    }
  }
}
