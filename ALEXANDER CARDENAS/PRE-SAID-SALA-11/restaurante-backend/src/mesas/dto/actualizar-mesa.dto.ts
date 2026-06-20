import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
} from 'class-validator';
import { EstadoMesa } from '../entities/estado-mesa.enum';

export class ActualizarMesaDto {
  @IsOptional()
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  @Type(() => Number)
  numero?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  @Type(() => Number)
  capacidad?: number;

  @IsOptional()
  @IsEnum(EstadoMesa)
  estado?: EstadoMesa;
}
