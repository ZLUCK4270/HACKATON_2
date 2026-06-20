import { PartialType } from '@nestjs/mapped-types';
import { CreateComandaDto } from './create-comanda.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { EstadoComanda } from '../entities/comanda.entity';

export class UpdateComandaDto extends PartialType(CreateComandaDto) {
  @IsEnum(EstadoComanda)
  @IsOptional()
  estado?: EstadoComanda;
}
