import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { Ticket } from './entities/ticket.entity';
import { Pedido } from '../pedidos/entities/pedido.entity';
import { MesasModule } from '../mesas/mesas.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ticket, Pedido]),
    MesasModule,
  ],
  controllers: [TicketsController],
  providers: [TicketsService],
})
export class TicketsModule {}
