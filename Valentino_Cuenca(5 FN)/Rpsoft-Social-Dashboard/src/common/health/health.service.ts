import { Injectable } from '@nestjs/common';

export interface HealthStatus {
  status: 'ok' | 'degraded' | 'error';
  timestamp: string;
  uptime: number;
  environment: string;
}

@Injectable()
export class HealthService {
  private startTime = Date.now();

  getHealth(): HealthStatus {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      environment: process.env.NODE_ENV || 'development',
    };
  }

  getReadiness(): HealthStatus {
    return this.getHealth();
  }

  getLiveness(): HealthStatus {
    return this.getHealth();
  }
}
