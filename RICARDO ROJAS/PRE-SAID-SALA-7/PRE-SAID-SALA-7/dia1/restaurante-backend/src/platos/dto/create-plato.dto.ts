import { IsString, IsNumber, IsBoolean, IsOptional, MinLength, IsPositive, IsNotEmpty } from 'class-validator';

export class CreatePlatoDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  nombre!: string;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  precio!: number;

  @IsBoolean()
  @IsOptional()
  disponible?: boolean;
}
