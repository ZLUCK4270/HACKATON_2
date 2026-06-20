import { PartialType } from '@nestjs/mapped-types';
import { CrearPlatoDto } from './crear-plato.dto';

export class ActualizarPlatoDto extends PartialType(CrearPlatoDto) {}
