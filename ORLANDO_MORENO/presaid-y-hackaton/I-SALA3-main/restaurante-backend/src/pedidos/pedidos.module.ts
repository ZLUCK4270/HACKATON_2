import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PedidosService } from './pedidos.service';
import { PedidosController } from './pedidos.controller';
import { Pedido } from './entities/pedido.entity';
import { Plato } from '../platos/entities/plato.entity';
import { Mesa } from '../mesas/entities/mesa.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Pedido, Plato, Mesa])],
  controllers: [PedidosController],
  providers: [PedidosService],
})
export class PedidosModule {}
