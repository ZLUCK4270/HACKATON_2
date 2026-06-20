import { IsInt, IsNotEmpty, IsPositive } from 'class-validator';

export class CreateTicketDto {
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  mesaId: number;
}
