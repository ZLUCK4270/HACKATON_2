import { IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, IsEnum } from 'class-validator';
import { EstadoComanda } from '../entities/comanda.entity';

export class CreateComandaDto {
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  pedidoId: number;

  @IsString()
  @IsOptional()
  observaciones?: string;

  @IsEnum(EstadoComanda)
  @IsOptional()
  estado?: EstadoComanda;
}
