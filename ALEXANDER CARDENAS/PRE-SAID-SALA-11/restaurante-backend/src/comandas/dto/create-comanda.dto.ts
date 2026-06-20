import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateComandaDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  pedidoId: number;

  @ApiProperty({ required: false, example: 'Sin sal' })
  @IsOptional()
  @IsString()
  observaciones?: string;
}
