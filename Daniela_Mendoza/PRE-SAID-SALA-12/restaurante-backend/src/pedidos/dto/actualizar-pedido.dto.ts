import { PartialType } from '@nestjs/mapped-types';
import { CrearPedidoDto } from './crear-pedido.dto';

export class ActualizarPedidoDto extends PartialType(CrearPedidoDto) {}
