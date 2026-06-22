import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PlatosModule } from './platos/platos.module';
import { MesasModule } from './mesas/mesas.module';
import { PedidosModule } from './pedidos/pedidos.module';
import { Plato } from './platos/entities/plato.entity';
import { Mesa } from './mesas/entities/mesa.entity';
import { Pedido } from './pedidos/entities/pedido.entity';
import { ComandasModule } from './comandas/comandas.module';
import { TicketsModule } from './tickets/tickets.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(
      process.env.DATABASE_URL
        ? {
            type: 'postgres',
            url: process.env.DATABASE_URL,
            autoLoadEntities: true,
            synchronize: true,
            ssl: process.env.NODE_ENV === 'production'
              ? { rejectUnauthorized: false }
              : false,
          }
        : {
            type: 'sqljs',
            autoSave: true,
            location: 'db.sqlite',
            autoLoadEntities: true,
            synchronize: true,
          },
    ),
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