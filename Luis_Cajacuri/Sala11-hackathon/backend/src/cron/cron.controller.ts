import { Controller, Get } from '@nestjs/common';
import { CronService } from './cron.service';

@Controller('cron')
export class CronController {
  constructor(private readonly cronService: CronService) {}

  @Get('trigger')
  async triggerCronManually() {
    // Se invoca sin await para no bloquear la respuesta si demora mucho
    this.cronService.handleDailySnapshot();
    return { success: true, message: 'Cron job manual execution started in background' };
  }
}
