import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { CambiarEstadoComandaDto } from './dto/cambiar-estado-comanda.dto';
import { CrearComandaDto } from './dto/crear-comanda.dto';
import { ComandasService } from './comandas.service';

@ApiTags('comandas')
@Controller('comandas')
export class ComandasController {
  constructor(private readonly comandasService: ComandasService) {}

  @Post()
  @ApiOperation({ summary: 'Crear comanda a partir de un pedido' })
  crear(@Body() crearComandaDto: CrearComandaDto) {
    return this.comandasService.crear(crearComandaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar comandas con pedido y platos' })
  obtenerTodos() {
    return this.comandasService.obtenerTodos();
  }

  // Frontend sends PATCH /comandas/:id with { estado }
  @Patch(':id')
  @ApiOperation({ summary: 'Cambiar estado de una comanda' })
  @ApiParam({ name: 'id', example: 1 })
  cambiarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() cambiarEstadoComandaDto: CambiarEstadoComandaDto,
  ) {
    return this.comandasService.cambiarEstado(
      id,
      cambiarEstadoComandaDto.estado,
    );
  }
}
