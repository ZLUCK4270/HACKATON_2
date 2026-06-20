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
import { MesasService } from './mesas.service';
import { CrearMesaDto } from './dto/crear-mesa.dto';
import { ActualizarMesaDto } from './dto/actualizar-mesa.dto';
import { CambiarEstadoDto } from './dto/cambiar-estado.dto';

@Controller('mesas')
export class MesasController {
  constructor(private readonly mesasService: MesasService) {}

  @Post()
  crear(@Body() crearMesaDto: CrearMesaDto) {
    return this.mesasService.crear(crearMesaDto);
  }

  @Get()
  encontrarTodos() {
    return this.mesasService.encontrarTodos();
  }

  @Get(':id')
  encontrarUno(@Param('id', ParseIntPipe) id: number) {
    return this.mesasService.encontrarUno(id);
  }

  @Patch(':id')
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() actualizarMesaDto: ActualizarMesaDto,
  ) {
    return this.mesasService.actualizar(id, actualizarMesaDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.mesasService.eliminar(id);
  }

  @Patch(':id/estado')
  cambiarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() cambiarEstadoDto: CambiarEstadoDto,
  ) {
    return this.mesasService.cambiarEstado(id, cambiarEstadoDto);
  }
}
