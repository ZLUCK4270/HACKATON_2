export interface NormalizedVideoData {
  videoId: string;
  title: string;
  views: number;
  likes: number;
  comments: number;
  durationSeconds: number;
  isShort: boolean;
  publishedDate: string;
}

export interface NormalizedChannelData {
  channelId: string;
  name: string;
  subscriberCount: number;
  totalViews: bigint;
  videoCount: number;
  customImageUrl?: string;
  videos: NormalizedVideoData[];
}

export interface SocialNetworkConnector {
  getChannelData(channelId: string): Promise<NormalizedChannelData>;
}
export const SOCIAL_NETWORK_CONNECTOR = 'SocialNetworkConnector';
