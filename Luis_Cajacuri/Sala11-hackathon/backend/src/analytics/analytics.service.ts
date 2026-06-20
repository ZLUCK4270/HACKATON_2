import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CalculadoraMetricas } from '../channels/utils/calculadora-metricas';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 1. Ranking de canales que crecen más rápido (por tasa %)
   */
  async getGrowthRanking(platform = 'youtube') {
    const canales = await this.prisma.canal.findMany({
      where: { platform },
      include: {
        snapshots: {
          orderBy: { fetchedDate: 'asc' }, // Del más antiguo al más reciente
        },
      },
    });

    const ranking = canales.map((canal) => {
      const snapshots = canal.snapshots;
      if (snapshots.length < 2) {
        return {
          id: canal.channelId,
          name: canal.name,
          customImageUrl: canal.customImageUrl,
          crecimientoNeto: 0,
          tasaCrecimiento: 0,
          snapshotsCount: snapshots.length,
          videoCount: snapshots[0]?.videoCount || 0,
        };
      }

      const anterior = snapshots[0];
      const actual = snapshots[snapshots.length - 1];
      const crecimiento = CalculadoraMetricas.calcularCrecimiento(anterior, actual);

      return {
        id: canal.channelId,
        name: canal.name,
        customImageUrl: canal.customImageUrl,
        crecimientoNeto: crecimiento.neto,
        tasaCrecimiento: crecimiento.tasa,
        snapshotsCount: snapshots.length,
        videoCount: actual.videoCount,
      };
    });

    // Ordenar de mayor a menor tasa de crecimiento %
    return ranking.sort((a, b) => b.tasaCrecimiento - a.tasaCrecimiento);
  }

  /**
   * 2. Video más exitoso (interacciones: likes + comments, desempate por engagement)
   */
  async getMostSuccessfulVideo(platform = 'youtube') {
    // Buscar los últimos snapshots de todos los videos de la plataforma
    const videos = await this.prisma.video.findMany({
      where: {
        canal: { platform },
      },
      include: {
        snapshots: {
          orderBy: { fetchedDate: 'desc' },
          take: 1,
        },
        canal: true,
      },
    });

    const videosWithStats = videos
      .filter((v) => v.snapshots.length > 0)
      .map((v) => {
        const snap = v.snapshots[0];
        const interacciones = snap.likes + snap.comments;
        return {
          id: v.videoId,
          title: v.title,
          isShort: v.isShort,
          publishedDate: v.publishedDate,
          views: snap.views,
          likes: snap.likes,
          comments: snap.comments,
          engagement: snap.engagement || 0,
          interacciones,
          channelName: v.canal.name,
        };
      });

    // Ordenar por interacciones desc, y luego por engagement desc
    return videosWithStats.sort((a, b) => {
      if (b.interacciones !== a.interacciones) {
        return b.interacciones - a.interacciones;
      }
      return b.engagement - a.engagement;
    });
  }

  /**
   * 3. Comparación de interacción: ¿Shorts o videos largos generan más interacción?
   */
  async getFormatComparison(platform = 'youtube') {
    const videos = await this.prisma.video.findMany({
      where: {
        canal: { platform },
      },
      include: {
        snapshots: {
          orderBy: { fetchedDate: 'desc' },
          take: 1,
        },
      },
    });

    let shortsCount = 0;
    let shortsInteractions = 0;
    let shortsEngagementSum = 0;
    let shortsViewsSum = 0;

    let longsCount = 0;
    let longsInteractions = 0;
    let longsEngagementSum = 0;
    let longsViewsSum = 0;

    for (const v of videos) {
      if (v.snapshots.length === 0) continue;
      const snap = v.snapshots[0];
      const interacciones = snap.likes + snap.comments;

      if (v.isShort) {
        shortsCount++;
        shortsInteractions += interacciones;
        shortsEngagementSum += snap.engagement || 0;
        shortsViewsSum += snap.views;
      } else {
        longsCount++;
        longsInteractions += interacciones;
        longsEngagementSum += snap.engagement || 0;
        longsViewsSum += snap.views;
      }
    }

    return {
      shorts: {
        count: shortsCount,
        promedioInteracciones: shortsCount > 0 ? parseFloat((shortsInteractions / shortsCount).toFixed(2)) : 0,
        promedioEngagement: shortsCount > 0 ? parseFloat((shortsEngagementSum / shortsCount).toFixed(2)) : 0,
        promedioVistas: shortsCount > 0 ? parseFloat((shortsViewsSum / shortsCount).toFixed(2)) : 0,
      },
      longs: {
        count: longsCount,
        promedioInteracciones: longsCount > 0 ? parseFloat((longsInteractions / longsCount).toFixed(2)) : 0,
        promedioEngagement: longsCount > 0 ? parseFloat((longsEngagementSum / longsCount).toFixed(2)) : 0,
        promedioVistas: longsCount > 0 ? parseFloat((longsViewsSum / longsCount).toFixed(2)) : 0,
      },
      conclusion: shortsInteractions / (shortsCount || 1) > longsInteractions / (longsCount || 1)
        ? 'Los Shorts generan más interacciones promedio.'
        : 'Los videos largos generan más interacciones promedio.',
    };
  }

  /**
   * 4. Evolución de suscriptores e interacciones históricas de un canal específico
   */
  async getChannelHistory(channelId: string, platform = 'youtube') {
    const canal = await this.prisma.canal.findUnique({
      where: {
        platform_channelId: {
          platform,
          channelId,
        },
      },
      include: {
        snapshots: {
          orderBy: { fetchedDate: 'asc' }, // Orden cronológico para gráficas
        },
      },
    });

    if (!canal) {
      throw new Error(`Canal no encontrado: ${channelId}`);
    }

    return canal.snapshots.map((snap) => ({
      date: snap.fetchedDate,
      subscriberCount: snap.subscriberCount,
      totalViews: Number(snap.totalViews),
      videoCount: snap.videoCount,
      engagementPromedio: snap.engagementPromedio,
    }));
  }
}
