import { IsEnum, IsNotEmpty } from 'class-validator';
import { EstadoPedido } from '../entities/pedido.entity';

export class CambiarEstadoPedidoDto {
  @IsEnum(EstadoPedido)
  @IsNotEmpty()
  estado: EstadoPedido;
}
