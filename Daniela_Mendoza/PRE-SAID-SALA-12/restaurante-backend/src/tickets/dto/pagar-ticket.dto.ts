import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { MetodoPago } from '../metodo-pago.enum';

export class PagarTicketDto {
  @ApiProperty({ enum: MetodoPago, example: MetodoPago.EFECTIVO })
  @IsEnum(MetodoPago)
  @IsNotEmpty()
  metodoPago: MetodoPago;
}
