import { IsString, IsNumber, IsBoolean, IsOptional, Min } from 'class-validator';

export class CreatePlatoDto {
  @IsString()
  nombre: string;

  @IsNumber()
  @Min(0)
  precio: number;

  @IsOptional()
  @IsBoolean()
  disponible?: boolean;
}
