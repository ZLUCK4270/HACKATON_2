import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Patch,
  Delete,
} from '@nestjs/common';

import { ComandasService } from './comandas.service';

import { CreateComandaDto } from './dto/create-comanda.dto';

import { UpdateEstadoComandaDto } from './dto/update-estado-comanda.dto';

@Controller('comandas')
export class ComandasController {
  constructor(
    private readonly comandasService: ComandasService,
  ) {}

  @Post()
  create(
    @Body() createComandaDto: CreateComandaDto,
  ) {
    return this.comandasService.create(createComandaDto);
  }

  @Get()
  findAll() {
    return this.comandasService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.comandasService.findOne(id);
  }

  @Patch(':id/estado')
  cambiarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEstadoDto: UpdateEstadoComandaDto,
  ) {
    return this.comandasService.cambiarEstado(
      id,
      updateEstadoDto,
    );
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.comandasService.remove(id);
  }
}