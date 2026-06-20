import { PartialType } from '@nestjs/swagger';
import { CrearPlatoDto } from './crear-plato.dto';

export class ActualizarPlatoDto extends PartialType(CrearPlatoDto) {}
