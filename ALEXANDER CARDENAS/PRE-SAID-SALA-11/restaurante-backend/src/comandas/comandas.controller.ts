import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ComandasService } from './comandas.service';
import { CreateComandaDto } from './dto/create-comanda.dto';
import { UpdateEstadoComandaDto } from './dto/update-estado-comanda.dto';

@ApiTags('comandas')
@Controller('comandas')
export class ComandasController {
  constructor(private readonly comandasService: ComandasService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva comanda' })
  create(@Body() createComandaDto: CreateComandaDto) {
    return this.comandasService.create(createComandaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las comandas' })
  findAll() {
    return this.comandasService.findAll();
  }

  @Patch(':id/estado')
  @ApiOperation({ summary: 'Actualizar el estado de una comanda' })
  updateEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEstadoComandaDto: UpdateEstadoComandaDto,
  ) {
    return this.comandasService.updateEstado(id, updateEstadoComandaDto);
  }
}
