import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateComandaDto {
  @IsInt()
  @IsNotEmpty()
  pedidoId!: number;

  @IsOptional()
  @IsString()
  observaciones?: string;
}