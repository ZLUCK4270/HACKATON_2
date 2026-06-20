import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsPositive,
} from 'class-validator';

export class CreatePedidoDto {
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  mesaId: number;

  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  @IsPositive({ each: true })
  platoIds: number[];
}
