import { IsNumber, IsArray, IsPositive, ArrayMinSize } from 'class-validator';

export class CreatePedidoDto {
  @IsNumber()
  @IsPositive()
  mesaId!: number;

  @IsArray()
  @ArrayMinSize(1)
  @IsNumber({}, { each: true })
  platoIds!: number[];
}
