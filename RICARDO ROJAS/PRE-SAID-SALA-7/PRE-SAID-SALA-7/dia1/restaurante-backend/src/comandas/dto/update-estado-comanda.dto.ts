import {
  IsEnum,
} from 'class-validator';

import { ComandaEstado } from '../entities/comanda.entity';

export class UpdateEstadoComandaDto {
  @IsEnum(ComandaEstado)
  estado!: ComandaEstado;
}