import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { EstadoComanda } from '../comanda-estado.enum';

export class CambiarEstadoComandaDto {
  @ApiProperty({
    enum: EstadoComanda,
    example: EstadoComanda.EN_PREPARACION,
  })
  @IsEnum(EstadoComanda)
  @IsNotEmpty()
  estado: EstadoComanda;
}
