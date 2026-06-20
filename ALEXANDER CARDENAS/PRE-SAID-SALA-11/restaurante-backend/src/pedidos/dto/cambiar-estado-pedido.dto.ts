import { IsEnum, IsNotEmpty } from 'class-validator';
import { EstadoPedido } from '../entities/estado-pedido.enum';

export class CambiarEstadoPedidoDto {
  @IsEnum(EstadoPedido)
  @IsNotEmpty()
  estado: EstadoPedido;
}
