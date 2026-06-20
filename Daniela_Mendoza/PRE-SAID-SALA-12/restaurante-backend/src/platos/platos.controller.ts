import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ActualizarPlatoDto } from './dto/actualizar-plato.dto';
import { CrearPlatoDto } from './dto/crear-plato.dto';
import { PlatosService } from './platos.service';

@ApiTags('platos')
@Controller('platos')
export class PlatosController {
  constructor(private readonly platosService: PlatosService) {}

  @Post()
  crear(@Body() crearPlatoDto: CrearPlatoDto) {
    return this.platosService.crear(crearPlatoDto);
  }

  @Get()
  obtenerTodos() {
    return this.platosService.obtenerTodos();
  }

  @Get(':id')
  obtenerPorId(@Param('id', ParseIntPipe) id: number) {
    return this.platosService.obtenerPorId(id);
  }

  @Patch(':id')
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() actualizarPlatoDto: ActualizarPlatoDto,
  ) {
    return this.platosService.actualizar(id, actualizarPlatoDto);
  }

  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.platosService.eliminar(id);
  }
}
