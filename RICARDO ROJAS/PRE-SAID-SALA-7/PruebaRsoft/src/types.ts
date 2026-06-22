export interface ChannelSnapshot {
  id?: number;
  channel_id: string;
  channel_name: string;
  date: string;
  subscribers: number;
  views: number;
}

export interface MetricData {
  subscribers: number;
  netGrowth: number;
  dailyGrowth: number;
  growthRatePercent: number;
  engagementPromedio: number;
  trend: string;
}

export interface ChannelAnalysis {
  channelId: string;
  channelName: string;
  platform: 'youtube' | 'facebook' | 'instagram' | 'facebook_group';
  history: ChannelSnapshot[];
  metrics: MetricData;
}

export interface VideoAnalysis {
  id: string;
  title: string;
  channelId: string;
  isShort: boolean;
  views: number;
  likes: number;
  comments: number;
  interacciones: number;
  engagementRate: number;
  viewsGained: number;
}

export interface DashboardData {
  channels: ChannelAnalysis[];
  videos: VideoAnalysis[];
  aggregate: {
    shortsAvgEngagement: number;
    longsAvgEngagement: number;
  };
}
