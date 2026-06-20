import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
} from 'class-validator';

export class ActualizarPedidoDto {
  @IsOptional()
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  @Type(() => Number)
  mesaId?: number;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  @IsPositive({ each: true })
  @IsNotEmpty()
  platoIds?: number[];
}
