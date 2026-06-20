import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { PlatosService } from './platos.service';
import { CrearPlatoDto } from './dto/crear-plato.dto';
import { ActualizarPlatoDto } from './dto/actualizar-plato.dto';

@Controller('platos')
export class PlatosController {
  constructor(private readonly platosService: PlatosService) {}

  @Post()
  crear(@Body() crearPlatoDto: CrearPlatoDto) {
    return this.platosService.crear(crearPlatoDto);
  }

  @Get()
  encontrarTodos() {
    return this.platosService.encontrarTodos();
  }

  @Get(':id')
  encontrarUno(@Param('id', ParseIntPipe) id: number) {
    return this.platosService.encontrarUno(id);
  }

  @Patch(':id')
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() actualizarPlatoDto: ActualizarPlatoDto,
  ) {
    return this.platosService.actualizar(id, actualizarPlatoDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.platosService.eliminar(id);
  }
}
