import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comanda } from '../comandas/comanda.entity';
import { Ticket } from './ticket.entity';
import { TicketsController } from './tickets.controller';
import { TicketService } from './tickets.service';

@Module({
  imports: [TypeOrmModule.forFeature([Ticket, Comanda])],
  controllers: [TicketsController],
  providers: [TicketService],
  exports: [TypeOrmModule, TicketService],
})
export class TicketsModule { }
