import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EstadoComanda } from '../entities/estado-comanda.enum';

export class UpdateEstadoComandaDto {
  @ApiProperty({ enum: EstadoComanda })
  @IsEnum(EstadoComanda)
  estado: EstadoComanda;
}
