import { IsEnum, IsNotEmpty } from 'class-validator';
import { EstadoMesa } from '../entities/estado-mesa.enum';

export class CambiarEstadoMesaDto {
  @IsEnum(EstadoMesa)
  @IsNotEmpty()
  estado: EstadoMesa;
}
