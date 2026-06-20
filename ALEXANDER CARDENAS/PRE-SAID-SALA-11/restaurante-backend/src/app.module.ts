import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import * as dotenv from 'dotenv';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Mesa } from './mesas/entities/mesa.entity';
import { MesasModule } from './mesas/mesas.module';
import { Pedido } from './pedidos/entities/pedido.entity';
import { PedidosModule } from './pedidos/pedidos.module';
import { Plato } from './platos/entities/plato.entity';
import { PlatosModule } from './platos/platos.module';
import { Comanda } from './comandas/entities/comanda.entity';
import { ComandasModule } from './comandas/comandas.module';
import { Ticket } from './tickets/entities/ticket.entity';
import { TicketsModule } from './tickets/tickets.module';

// Cargar variables de entorno del archivo .env
dotenv.config();

const databaseUrl = process.env.DATABASE_URL;
const dbHost = process.env.DB_HOST;
const dbPort = process.env.DB_PORT;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbName = process.env.DB_NAME;

const isPostgres = !!(databaseUrl || (dbHost && dbUser && dbPassword && dbName));

const dbConfig: any = isPostgres
  ? {
      type: 'postgres',
      url: databaseUrl || undefined,
      host: dbHost || undefined,
      port: dbPort ? parseInt(dbPort, 10) : undefined,
      username: dbUser || undefined,
      password: dbPassword || undefined,
      database: dbName || undefined,
      entities: [Plato, Mesa, Pedido, Comanda, Ticket],
      synchronize: true,
      ssl: process.env.DB_SSL === 'true' || (databaseUrl && databaseUrl.includes('sslmode='))
        ? { rejectUnauthorized: false }
        : undefined,
    }
  : {
      type: 'better-sqlite3',
      database: join(process.cwd(), 'db.sqlite'),
      entities: [Plato, Mesa, Pedido, Comanda, Ticket],
      synchronize: true,
    };

@Module({
  imports: [
    TypeOrmModule.forRoot(dbConfig),
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

