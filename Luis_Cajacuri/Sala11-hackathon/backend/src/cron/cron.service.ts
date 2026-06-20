import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { ChannelsService } from '../channels/channels.service';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly channelsService: ChannelsService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailySnapshot() {
    this.logger.log('Iniciando job diario de captura de datos (snapshots)...');

    try {
      const canales = await this.prisma.canal.findMany();
      this.logger.log(`Se encontraron ${canales.length} canales para actualizar.`);

      for (const canal of canales) {
        try {
          this.logger.log(`Actualizando canal: ${canal.name || canal.channelId}`);
          await this.channelsService.getChannelDashboard(canal.channelId, true);
        } catch (error) {
          this.logger.error(`Error actualizando canal ${canal.channelId}: ${error.message}`);
        }
      }

      this.logger.log('Job diario de captura de datos finalizado con éxito.');
    } catch (error) {
      this.logger.error(`Error crítico en el job diario: ${error.message}`);
    }
  }
}
