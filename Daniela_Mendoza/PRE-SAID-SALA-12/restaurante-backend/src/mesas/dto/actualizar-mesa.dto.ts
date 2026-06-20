import { PartialType } from '@nestjs/mapped-types';
import { CrearMesaDto } from './crear-mesa.dto';

export class ActualizarMesaDto extends PartialType(CrearMesaDto) {}
