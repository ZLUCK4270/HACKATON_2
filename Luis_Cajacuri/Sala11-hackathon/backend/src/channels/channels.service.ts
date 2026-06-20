import { Injectable } from '@nestjs/common';
import { YoutubeService } from '../youtube/youtube.service';
import { PrismaService } from '../prisma/prisma.service';
import { CalculadoraMetricas } from './utils/calculadora-metricas';

@Injectable()
export class ChannelsService {
  constructor(
    private readonly youtubeService: YoutubeService,
    private readonly prisma: PrismaService,
  ) {}

  async getChannelDashboard(channelId: string, forceRefresh = false) {
    const hoy = new Date().toLocaleDateString('sv-SE'); // produce "YYYY-MM-DD" localmente

    // 1. Intentar buscar el canal en la base de datos
    let canal = await this.prisma.canal.findUnique({
      where: {
        platform_channelId: {
          platform: 'youtube',
          channelId,
        },
      },
      include: {
        snapshots: {
          where: { fetchedDate: hoy },
          take: 1,
        },
      },
    });

    // 2. Si el canal existe, tiene snapshot para hoy y no estamos forzando refresh, lo devolvemos
    if (canal && canal.snapshots.length > 0 && !forceRefresh) {
      const snapshot = canal.snapshots[0];
      
      // Obtener los videos y sus últimos snapshots
      const videosDb = await this.prisma.video.findMany({
        where: { canalId: canal.id },
        include: {
          snapshots: {
            where: { fetchedDate: hoy },
            take: 1,
          },
        },
      });

      return {
        id: canal.channelId,
        name: canal.name,
        subscriberCount: snapshot.subscriberCount,
        totalViews: Number(snapshot.totalViews),
        videoCount: snapshot.videoCount,
        engagementPromedio: snapshot.engagementPromedio,
        customImageUrl: canal.customImageUrl,
        videos: videosDb.map((v) => {
          const vs = v.snapshots[0];
          return {
            id: v.videoId,
            title: v.title,
            publishedAt: v.publishedDate,
            durationSeconds: v.durationSeconds,
            isShort: v.isShort,
            views: vs ? vs.views : 0,
            likes: vs ? vs.likes : 0,
            comments: vs ? vs.comments : 0,
            engagement: vs ? vs.engagement : null,
          };
        }),
      };
    }

    // 3. De lo contrario, hacemos fetch del conector (YouTube por ahora)
    const externalData = await this.youtubeService.getChannelData(channelId);

    // 4. Asegurar la existencia del registro Canal
    if (!canal) {
      canal = await this.prisma.canal.create({
        data: {
          channelId,
          platform: 'youtube',
          name: externalData.name,
          customImageUrl: externalData.customImageUrl || null,
        },
        include: {
          snapshots: {
            where: { fetchedDate: hoy },
            take: 1,
          },
        },
      });
    } else {
      canal = await this.prisma.canal.update({
        where: { id: canal.id },
        data: {
          name: externalData.name,
          customImageUrl: externalData.customImageUrl || null,
        },
        include: {
          snapshots: {
            where: { fetchedDate: hoy },
            take: 1,
          },
        },
      });
    }

    // 5. Calcular engagement por video y engagement promedio
    let totalEngagement = 0;
    let validVideosCount = 0;

    const formattedVideos = externalData.videos.map((v) => {
      const engagement = CalculadoraMetricas.calcularEngagement({
        views: v.views,
        likes: v.likes,
        comments: v.comments,
      });

      if (engagement !== null) {
        totalEngagement += engagement;
        validVideosCount++;
      }

      return {
        ...v,
        engagement,
      };
    });

    const engagementPromedio = validVideosCount > 0
      ? parseFloat((totalEngagement / validVideosCount).toFixed(2))
      : null;

    // 6. Guardar/Actualizar el CanalSnapshot
    await this.prisma.canalSnapshot.upsert({
      where: {
        canalId_fetchedDate: {
          canalId: canal.id,
          fetchedDate: hoy,
        },
      },
      update: {
        subscriberCount: externalData.subscriberCount,
        totalViews: externalData.totalViews,
        videoCount: externalData.videoCount,
        engagementPromedio,
      },
      create: {
        canalId: canal.id,
        subscriberCount: externalData.subscriberCount,
        totalViews: externalData.totalViews,
        videoCount: externalData.videoCount,
        engagementPromedio,
        fetchedDate: hoy,
      },
    });

    // 7. Guardar/Actualizar Videos y sus VideoSnapshots
    for (const v of formattedVideos) {
      const dbVideo = await this.prisma.video.upsert({
        where: {
          canalId_videoId: {
            canalId: canal.id,
            videoId: v.videoId,
          },
        },
        update: {
          title: v.title,
          durationSeconds: v.durationSeconds,
          isShort: v.isShort,
          publishedDate: v.publishedDate,
        },
        create: {
          canalId: canal.id,
          videoId: v.videoId,
          title: v.title,
          durationSeconds: v.durationSeconds,
          isShort: v.isShort,
          publishedDate: v.publishedDate,
        },
      });

      await this.prisma.videoSnapshot.upsert({
        where: {
          videoId_fetchedDate: {
            videoId: dbVideo.id,
            fetchedDate: hoy,
          },
        },
        update: {
          views: v.views,
          likes: v.likes,
          comments: v.comments,
          engagement: v.engagement,
        },
        create: {
          videoId: dbVideo.id,
          views: v.views,
          likes: v.likes,
          comments: v.comments,
          engagement: v.engagement,
          fetchedDate: hoy,
        },
      });
    }

    return {
      id: canal.channelId,
      name: externalData.name,
      subscriberCount: externalData.subscriberCount,
      totalViews: Number(externalData.totalViews),
      videoCount: externalData.videoCount,
      engagementPromedio,
      customImageUrl: externalData.customImageUrl || null,
      videos: formattedVideos.map((v) => ({
        id: v.videoId,
        title: v.title,
        publishedAt: v.publishedDate,
        durationSeconds: v.durationSeconds,
        isShort: v.isShort,
        views: v.views,
        likes: v.likes,
        comments: v.comments,
        engagement: v.engagement,
      })),
    };
  }

  async getAllChannels() {
    const canales = await this.prisma.canal.findMany({
      include: {
        snapshots: {
          orderBy: {
            fetchedDate: 'desc',
          },
          take: 1,
        },
      },
    });

    return canales.map((canal) => {
      const latestSnapshot = canal.snapshots[0];
      return {
        id: canal.channelId,
        name: canal.name,
        subscriberCount: latestSnapshot ? latestSnapshot.subscriberCount : 0,
        totalViews: latestSnapshot ? Number(latestSnapshot.totalViews) : 0,
        videoCount: latestSnapshot ? latestSnapshot.videoCount : 0,
        engagementPromedio: latestSnapshot ? latestSnapshot.engagementPromedio : null,
        fetchedDate: latestSnapshot ? latestSnapshot.fetchedDate : null,
        customImageUrl: canal.customImageUrl,
      };
    });
  }
}
