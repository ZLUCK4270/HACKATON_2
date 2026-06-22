import { IsNumber, IsPositive } from 'class-validator';

export class CreateTicketDto {
  @IsNumber()
  @IsPositive()
  mesaId!: number;
}
