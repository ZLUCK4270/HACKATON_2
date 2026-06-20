import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pedido } from '../pedidos/pedido.entity';
import { Comanda } from './comanda.entity';
import { ComandasController } from './comandas.controller';
import { ComandasService } from './comandas.service';

@Module({
  imports: [TypeOrmModule.forFeature([Comanda, Pedido])],
  controllers: [ComandasController],
  providers: [ComandasService],
  exports: [TypeOrmModule, ComandasService],
})
export class ComandasModule { }
