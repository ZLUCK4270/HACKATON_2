import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsNotEmpty,
  Min,
} from 'class-validator';

export class CrearPedidoDto {
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  mesaId: number;

  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  @Min(1, { each: true })
  platoIds: number[];
}
