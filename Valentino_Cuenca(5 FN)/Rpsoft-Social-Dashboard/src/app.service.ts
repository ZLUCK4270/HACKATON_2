import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getStatus(): string {
    return 'Dashboard Unificado de Redes Sociales — v1 YouTube — RPSoft Hackathon';
  }
}
