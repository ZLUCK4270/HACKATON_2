import { IsInt, IsEnum, IsOptional, IsPositive } from 'class-validator';
import { EstadoMesa } from '../entities/mesa.entity';

export class CreateMesaDto {
  @IsInt()
  @IsPositive()
  numero: number;

  @IsInt()
  @IsPositive()
  capacidad: number;

  @IsOptional()
  @IsEnum(EstadoMesa)
  estado?: EstadoMesa;
}
