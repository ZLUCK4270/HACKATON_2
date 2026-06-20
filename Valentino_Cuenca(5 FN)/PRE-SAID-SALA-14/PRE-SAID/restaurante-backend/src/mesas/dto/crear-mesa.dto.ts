import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  Min,
} from 'class-validator';
import { EstadoMesa } from '../entities/mesa.entity';

export class CrearMesaDto {
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  numero: number;

  @IsInt()
  @IsPositive()
  @Min(1)
  @IsNotEmpty()
  capacidad: number;

  @IsOptional()
  @IsEnum(EstadoMesa)
  estado?: EstadoMesa;
}
