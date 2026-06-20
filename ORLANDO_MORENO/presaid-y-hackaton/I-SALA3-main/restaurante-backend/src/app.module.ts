import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get<string>('DATABASE_URL');
        
        if (databaseUrl) {
          // Producción: PostgreSQL
          return {
            type: 'postgres',
            url: databaseUrl,
            entities: [Plato, Mesa, Pedido, Comanda, Ticket],
            synchronize: true, // NOTA: En un proyecto real esto sería false en producción
            ssl: {
              rejectUnauthorized: false, // Requerido por muchos servicios cloud como Render
            },
          };
        }
        
        // Desarrollo local: SQLite
        return {
          type: 'sqlite',
          database: 'db.sqlite',
          entities: [Plato, Mesa, Pedido, Comanda, Ticket],
          synchronize: true,
        };
      },
    }),
    PlatosModule,
    MesasModule,
    PedidosModule,
    ComandasModule,
    TicketsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
