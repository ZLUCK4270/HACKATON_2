import { Controller, Get } from '@nestjs/common';
import { HealthService, HealthStatus } from './health.service';

@Controller('api/health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  checkHealth() {
    return this.healthService.getHealth();
  }

  @Get('ready')
  readiness() {
    return this.healthService.getReadiness();
  }

  @Get('live')
  liveness() {
    return this.healthService.getLiveness();
  }
}
