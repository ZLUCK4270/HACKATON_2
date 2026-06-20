import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MetodoPago } from '../entities/metodo-pago.enum';

export class PagarTicketDto {
  @ApiProperty({ enum: MetodoPago })
  @IsEnum(MetodoPago)
  metodoPago: MetodoPago;
}
