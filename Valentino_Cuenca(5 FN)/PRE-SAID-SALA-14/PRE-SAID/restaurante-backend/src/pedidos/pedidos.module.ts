import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pedido } from './entities/pedido.entity';
import { PedidosController } from './pedidos.controller';
import { PedidosService } from './pedidos.service';
import { PlatosModule } from '../platos/platos.module';
import { MesasModule } from '../mesas/mesas.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Pedido]),
    PlatosModule,
    MesasModule,
  ],
  controllers: [PedidosController],
  providers: [PedidosService],
})
export class PedidosModule {}
