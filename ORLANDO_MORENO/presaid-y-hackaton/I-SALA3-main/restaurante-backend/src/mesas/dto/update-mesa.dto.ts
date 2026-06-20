import { IsInt, IsEnum, IsOptional, IsPositive } from 'class-validator';
import { EstadoMesa } from '../entities/mesa.entity';

export class UpdateMesaDto {
  @IsOptional()
  @IsInt()
  @IsPositive()
  numero?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  capacidad?: number;

  @IsOptional()
  @IsEnum(EstadoMesa)
  estado?: EstadoMesa;
}
