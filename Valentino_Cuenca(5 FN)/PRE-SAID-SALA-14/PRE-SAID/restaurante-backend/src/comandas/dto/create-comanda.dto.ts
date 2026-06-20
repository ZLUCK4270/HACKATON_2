import { IsInt, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateComandaDto {
  @IsInt()
  @IsPositive()
  pedidoId: number;

  @IsString()
  @IsOptional()
  observaciones?: string;
}
