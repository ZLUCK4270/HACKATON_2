import { IsEnum, IsNotEmpty } from 'class-validator';
import { EstadoMesa } from '../entities/mesa.entity';

export class CambiarEstadoDto {
  @IsEnum(EstadoMesa)
  @IsNotEmpty()
  estado: EstadoMesa;
}
