import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComandasService } from './comandas.service';
import { ComandasController } from './comandas.controller';
import { Comanda } from './entities/comanda.entity';
import { Pedido } from '../pedidos/entities/pedido.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Comanda, Pedido])],
  controllers: [ComandasController],
  providers: [ComandasService],
})
export class ComandasModule {}
