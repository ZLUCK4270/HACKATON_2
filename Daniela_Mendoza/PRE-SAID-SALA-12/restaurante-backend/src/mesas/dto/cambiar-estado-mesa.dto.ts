import { IsEnum, IsNotEmpty } from 'class-validator';
import { EstadoMesa } from '../mesa-estado.enum';

export class CambiarEstadoMesaDto {
  // Estado al que cambiará la mesa
  @IsEnum(EstadoMesa)
  @IsNotEmpty()
  estado: EstadoMesa;
}
