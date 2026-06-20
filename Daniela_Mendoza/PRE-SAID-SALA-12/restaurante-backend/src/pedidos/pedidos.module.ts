import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mesa } from '../mesas/mesa.entity';
import { MesasModule } from '../mesas/mesas.module';
import { Plato } from '../platos/plato.entity';
import { PlatosModule } from '../platos/platos.module';
import { Pedido } from './pedido.entity';
import { PedidosController } from './pedidos.controller';
import { PedidosService } from './pedidos.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Pedido, Mesa, Plato]),
    MesasModule,
    PlatosModule,
  ],
  controllers: [PedidosController],
  providers: [PedidosService],
  exports: [PedidosService],
})
export class PedidosModule {}
