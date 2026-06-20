import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mesa } from '../mesas/entities/mesa.entity';
import { MesasModule } from '../mesas/mesas.module';
import { Plato } from '../platos/entities/plato.entity';
import { PlatosModule } from '../platos/platos.module';
import { Pedido } from './entities/pedido.entity';
import { PedidosController } from './pedidos.controller';
import { PedidosService } from './pedidos.service';
import { Comanda } from '../comandas/entities/comanda.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Pedido, Mesa, Plato, Comanda]),
    MesasModule,
    PlatosModule,
  ],
  controllers: [PedidosController],
  providers: [PedidosService],
})
export class PedidosModule {}

