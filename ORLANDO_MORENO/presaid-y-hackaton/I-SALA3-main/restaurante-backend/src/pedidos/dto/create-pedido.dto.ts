import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  ArrayMinSize,
} from 'class-validator';
import { EstadoPedido } from '../entities/pedido.entity';

export class CreatePedidoDto {
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  mesaId: number;

  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  @IsPositive({ each: true })
  platoIds: number[];

  @IsOptional()
  @IsEnum(EstadoPedido)
  estado?: EstadoPedido;
}
