import { IsNumber, IsPositive, IsOptional, IsEnum, Min, IsNotEmpty } from 'class-validator';
import { MesaEstado } from '../entities/mesa.entity';

export class CreateMesaDto {
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @Min(1)
  numero!: number;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @Min(1)
  capacidad!: number;

  @IsEnum(MesaEstado)
  @IsOptional()
  estado?: MesaEstado;
}
