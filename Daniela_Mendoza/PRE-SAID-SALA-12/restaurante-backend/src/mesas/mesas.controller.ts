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
import { ActualizarMesaDto } from './dto/actualizar-mesa.dto';
import { CambiarEstadoMesaDto } from './dto/cambiar-estado-mesa.dto';
import { CrearMesaDto } from './dto/crear-mesa.dto';
import { MesasService } from './mesas.service';

@Controller('mesas')
export class MesasController {
  constructor(private readonly mesasService: MesasService) {}

  @Post()
  crear(@Body() crearMesaDto: CrearMesaDto) {
    return this.mesasService.crear(crearMesaDto);
  }

  @Get()
  obtenerTodos() {
    return this.mesasService.obtenerTodos();
  }

  @Get(':id')
  obtenerPorId(@Param('id', ParseIntPipe) id: number) {
    return this.mesasService.obtenerPorId(id);
  }

  @Patch(':id/estado')
  cambiarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() cambiarEstadoMesaDto: CambiarEstadoMesaDto,
  ) {
    return this.mesasService.cambiarEstado(id, cambiarEstadoMesaDto.estado);
  }

  @Patch(':id')
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() actualizarMesaDto: ActualizarMesaDto,
  ) {
    return this.mesasService.actualizar(id, actualizarMesaDto);
  }

  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.mesasService.eliminar(id);
  }
}
