import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Comanda } from './comandas/comanda.entity';
import { ComandasModule } from './comandas/comandas.module';
import { Mesa } from './mesas/mesa.entity';
import { MesasModule } from './mesas/mesas.module';
import { Pedido } from './pedidos/pedido.entity';
import { PedidosModule } from './pedidos/pedidos.module';
import { Plato } from './platos/plato.entity';
import { PlatosModule } from './platos/platos.module';
import { Ticket } from './tickets/ticket.entity';
import { TicketsModule } from './tickets/tickets.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres1025',
      database: 'restaurante',
      entities: [Plato, Mesa, Pedido, Comanda, Ticket],
      synchronize: true,
    }),
    PlatosModule,
    MesasModule,
    PedidosModule,
    ComandasModule,
    TicketsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
