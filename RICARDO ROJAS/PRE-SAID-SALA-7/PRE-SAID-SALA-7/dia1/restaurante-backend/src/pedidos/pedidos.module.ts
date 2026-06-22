import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PedidosService } from './pedidos.service';
import { PedidosController } from './pedidos.controller';
import { Pedido } from './entities/pedido.entity';
import { MesasModule } from '../mesas/mesas.module';
import { PlatosModule } from '../platos/platos.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Pedido]),
    MesasModule,
    PlatosModule,
  ],
  controllers: [PedidosController],
  providers: [PedidosService],
  exports: [PedidosService],
})
export class PedidosModule {}
