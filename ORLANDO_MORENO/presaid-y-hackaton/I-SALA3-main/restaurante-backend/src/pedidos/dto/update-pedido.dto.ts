import { PartialType } from '@nestjs/mapped-types';
import { CreatePedidoDto } from './create-pedido.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { EstadoPedido } from '../entities/pedido.entity';

export class UpdatePedidoDto extends PartialType(CreatePedidoDto) {
  @IsOptional()
  @IsEnum(EstadoPedido)
  estado?: EstadoPedido;
}
