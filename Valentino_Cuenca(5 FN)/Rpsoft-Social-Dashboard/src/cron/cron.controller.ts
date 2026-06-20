import { Controller, Post } from '@nestjs/common';
import { CronService } from './cron.service';

@Controller('api/cron')
export class CronController {
  constructor(private cronService: CronService) {}

  @Post('run')
  async runManualFetch() {
    return this.cronService.runManualFetch();
  }
}
