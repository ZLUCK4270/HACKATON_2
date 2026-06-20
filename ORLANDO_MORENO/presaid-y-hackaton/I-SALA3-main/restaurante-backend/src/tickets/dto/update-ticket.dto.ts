import { IsEnum, IsNotEmpty } from 'class-validator';
import { MetodoPago } from '../entities/ticket.entity';

export class UpdateTicketDto {
  @IsEnum(MetodoPago)
  @IsNotEmpty()
  metodoPago: MetodoPago;
}
