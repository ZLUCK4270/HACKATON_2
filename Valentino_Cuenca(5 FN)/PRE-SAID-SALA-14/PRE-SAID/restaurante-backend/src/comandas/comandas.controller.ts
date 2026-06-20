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
import { ComandasService } from './comandas.service';
import { CreateComandaDto } from './dto/create-comanda.dto';
import { UpdateComandaDto } from './dto/update-comanda.dto';
import { CambiarEstadoComandaDto } from './dto/cambiar-estado-comanda.dto';

@Controller('comandas')
export class ComandasController {
  constructor(private readonly comandasService: ComandasService) {}

  @Post()
  crear(@Body() createComandaDto: CreateComandaDto) {
    return this.comandasService.crear(createComandaDto);
  }

  @Get()
  encontrarTodos() {
    return this.comandasService.encontrarTodos();
  }

  @Get(':id')
  encontrarUno(@Param('id', ParseIntPipe) id: number) {
    return this.comandasService.encontrarUno(id);
  }

  @Patch(':id')
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateComandaDto: UpdateComandaDto,
  ) {
    return this.comandasService.actualizar(id, updateComandaDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.comandasService.eliminar(id);
  }

  @Patch(':id/estado')
  cambiarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() cambiarEstadoComandaDto: CambiarEstadoComandaDto,
  ) {
    return this.comandasService.cambiarEstado(id, cambiarEstadoComandaDto);
  }
}
