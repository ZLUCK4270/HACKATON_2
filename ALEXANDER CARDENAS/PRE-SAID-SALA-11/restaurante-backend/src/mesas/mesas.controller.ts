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
import { ActualizarMesaDto } from './dto/actualizar-mesa.dto';
import { CambiarEstadoMesaDto } from './dto/cambiar-estado-mesa.dto';
import { CrearMesaDto } from './dto/crear-mesa.dto';
import { Mesa } from './entities/mesa.entity';
import { MesasService } from './mesas.service';

@ApiTags('mesas')
@Controller('mesas')
@UsePipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
)
export class MesasController {
  constructor(private readonly mesasService: MesasService) {}

  @Post()
  @ApiOperation({ summary: 'Crear mesa' })
  @ApiCreatedResponse({ type: Mesa })
  crear(@Body() crearMesaDto: CrearMesaDto): Promise<Mesa> {
    return this.mesasService.crear(crearMesaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las mesas' })
  @ApiOkResponse({ type: Mesa, isArray: true })
  encontrarTodos(): Promise<Mesa[]> {
    return this.mesasService.encontrarTodos();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener mesa por id' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: Mesa })
  encontrarUno(@Param('id', ParseIntPipe) id: number): Promise<Mesa> {
    return this.mesasService.encontrarUno(id);
  }

  @Patch(':id/estado')
  @ApiOperation({ summary: 'Cambiar estado de la mesa' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: Mesa })
  cambiarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() cambiarEstadoDto: CambiarEstadoMesaDto,
  ): Promise<Mesa> {
    return this.mesasService.cambiarEstado(id, cambiarEstadoDto.estado);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar mesa' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: Mesa })
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() actualizarMesaDto: ActualizarMesaDto,
  ): Promise<Mesa> {
    return this.mesasService.actualizar(id, actualizarMesaDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar mesa' })
  @ApiParam({ name: 'id', type: Number })
  @ApiNoContentResponse()
  eliminar(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.mesasService.eliminar(id);
  }
}
