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
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ActualizarPedidoDto } from './dto/actualizar-pedido.dto';
import { CambiarEstadoPedidoDto } from './dto/cambiar-estado-pedido.dto';
import { CrearPedidoDto } from './dto/crear-pedido.dto';
import { Pedido } from './entities/pedido.entity';
import { PedidosService } from './pedidos.service';

@ApiTags('pedidos')
@Controller('pedidos')
@UsePipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
)
export class PedidosController {
  constructor(private readonly pedidosService: PedidosService) {}

  @Post()
  @ApiOperation({ summary: 'Crear pedido' })
  @ApiCreatedResponse({ type: Pedido })
  crear(@Body() crearPedidoDto: CrearPedidoDto): Promise<Pedido> {
    return this.pedidosService.crear(crearPedidoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los pedidos' })
  @ApiOkResponse({ type: Pedido, isArray: true })
  encontrarTodos(): Promise<Pedido[]> {
    return this.pedidosService.encontrarTodos();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener pedido por id' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: Pedido })
  encontrarUno(@Param('id', ParseIntPipe) id: number): Promise<Pedido> {
    return this.pedidosService.encontrarUno(id);
  }

  @Patch(':id/estado')
  @ApiOperation({ summary: 'Cambiar estado del pedido' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: Pedido })
  cambiarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() cambiarEstadoDto: CambiarEstadoPedidoDto,
  ): Promise<Pedido> {
    return this.pedidosService.cambiarEstado(id, cambiarEstadoDto.estado);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar pedido' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: Pedido })
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() actualizarPedidoDto: ActualizarPedidoDto,
  ): Promise<Pedido> {
    return this.pedidosService.actualizar(id, actualizarPedidoDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar pedido' })
  @ApiParam({ name: 'id', type: Number })
  @ApiNoContentResponse()
  eliminar(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.pedidosService.eliminar(id);
  }
}
