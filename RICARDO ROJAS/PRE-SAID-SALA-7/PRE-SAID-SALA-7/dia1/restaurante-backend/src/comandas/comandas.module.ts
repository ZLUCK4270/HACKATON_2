import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { ComandasController } from './comandas.controller';

import { ComandasService } from './comandas.service';

import { Comanda } from './entities/comanda.entity';

import { PedidosModule } from '../pedidos/pedidos.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comanda]),
    PedidosModule,
  ],
  controllers: [ComandasController],
  providers: [ComandasService],
})
export class ComandasModule {}