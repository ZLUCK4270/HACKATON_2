import { IsEnum } from 'class-validator';

export enum MetodoPago {
  EFECTIVO = 'efectivo',
  TARJETA = 'tarjeta',
}

export class PagarTicketDto {
  @IsEnum(MetodoPago)
  metodoPago!: MetodoPago;
}
