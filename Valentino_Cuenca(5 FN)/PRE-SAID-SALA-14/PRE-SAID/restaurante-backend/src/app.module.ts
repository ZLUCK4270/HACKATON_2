import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PlatosModule } from './platos/platos.module';
import { Plato } from './platos/entities/plato.entity';
import { MesasModule } from './mesas/mesas.module';
import { Mesa } from './mesas/entities/mesa.entity';
import { PedidosModule } from './pedidos/pedidos.module';
import { Pedido } from './pedidos/entities/pedido.entity';
import { ComandasModule } from './comandas/comandas.module';
import { Comanda } from './comandas/entities/comanda.entity';
import { TicketsModule } from './tickets/tickets.module';
import { Ticket } from './tickets/entities/ticket.entity';

const databaseConfig = process.env.DATABASE_URL
  ? {
      type: 'postgres' as const,
      url: process.env.DATABASE_URL,
      entities: [Plato, Mesa, Pedido, Comanda, Ticket],
      synchronize: true,
      ssl: { rejectUnauthorized: false },
    }
  : {
      type: 'better-sqlite3' as const,
      database: process.env.DB_PATH || 'db.sqlite',
      entities: [Plato, Mesa, Pedido, Comanda, Ticket],
      synchronize: true,
    };

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(databaseConfig),
    PlatosModule,
    MesasModule,
    PedidosModule,
    ComandasModule,
    TicketsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
