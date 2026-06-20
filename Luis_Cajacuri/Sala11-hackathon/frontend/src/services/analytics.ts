const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export interface GrowthRankingItem {
  id: string;
  name: string;
  customImageUrl?: string;
  crecimientoNeto: number;
  tasaCrecimiento: number;
  snapshotsCount: number;
  videoCount: number;
}

export interface SuccessfulVideoItem {
  id: string;
  title: string;
  isShort: boolean;
  publishedDate: string;
  views: number;
  likes: number;
  comments: number;
  engagement: number;
  interacciones: number;
  channelName: string;
}

export interface FormatStats {
  count: number;
  promedioInteracciones: number;
  promedioEngagement: number;
  promedioVistas: number;
}

export interface FormatComparisonData {
  shorts: FormatStats;
  longs: FormatStats;
  conclusion: string;
}

export interface HistoryItem {
  date: string;
  subscriberCount: number;
  totalViews: number;
  videoCount: number;
  engagementPromedio: number | null;
}

export async function fetchGrowthRanking(platform = 'youtube'): Promise<GrowthRankingItem[]> {
  const res = await fetch(`${API_URL}/analytics/rankings/growth?platform=${platform}`);
  if (!res.ok) {
    throw new Error("Error al cargar ranking de crecimiento.");
  }
  return res.json();
}

export async function fetchMostSuccessfulVideo(platform = 'youtube'): Promise<SuccessfulVideoItem[]> {
  const res = await fetch(`${API_URL}/analytics/videos/most-successful?platform=${platform}`);
  if (!res.ok) {
    throw new Error("Error al cargar el video más exitoso.");
  }
  return res.json();
}

export async function fetchFormatComparison(platform = 'youtube'): Promise<FormatComparisonData> {
  const res = await fetch(`${API_URL}/analytics/stats/format-comparison?platform=${platform}`);
  if (!res.ok) {
    throw new Error("Error al cargar comparativa de formatos.");
  }
  return res.json();
}

export async function fetchChannelHistory(channelId: string, platform = 'youtube'): Promise<HistoryItem[]> {
  const res = await fetch(`${API_URL}/analytics/channels/${channelId}/history?platform=${platform}`);
  if (!res.ok) {
    throw new Error("Error al cargar el historial del canal.");
  }
  return res.json();
}
