import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  Min,
} from 'class-validator';
import { EstadoMesa } from '../mesa-estado.enum';

export class CrearMesaDto {
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  numero: number;

  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  capacidad: number;

  @IsOptional()
  @IsEnum(EstadoMesa)
  estado?: EstadoMesa;
}
