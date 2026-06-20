import { IsEnum, IsNotEmpty } from 'class-validator';
import { EstadoPedido } from '../pedido-estado.enum';

export class CambiarEstadoPedidoDto {
  @IsEnum(EstadoPedido)
  @IsNotEmpty()
  estado: EstadoPedido;
}
