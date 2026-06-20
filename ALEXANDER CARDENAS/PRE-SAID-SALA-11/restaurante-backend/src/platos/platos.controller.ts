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
import { ActualizarPlatoDto } from './dto/actualizar-plato.dto';
import { CrearPlatoDto } from './dto/crear-plato.dto';
import { Plato } from './entities/plato.entity';
import { PlatosService } from './platos.service';

@ApiTags('platos')
@Controller('platos')
@UsePipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
)
export class PlatosController {
  constructor(private readonly platosService: PlatosService) {}

  @Post()
  @ApiOperation({ summary: 'Crear plato' })
  @ApiCreatedResponse({ type: Plato })
  crear(@Body() crearPlatoDto: CrearPlatoDto): Promise<Plato> {
    return this.platosService.crear(crearPlatoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los platos' })
  @ApiOkResponse({ type: Plato, isArray: true })
  encontrarTodos(): Promise<Plato[]> {
    return this.platosService.encontrarTodos();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener plato por id' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: Plato })
  encontrarUno(@Param('id', ParseIntPipe) id: number): Promise<Plato> {
    return this.platosService.encontrarUno(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar plato' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: Plato })
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() actualizarPlatoDto: ActualizarPlatoDto,
  ): Promise<Plato> {
    return this.platosService.actualizar(id, actualizarPlatoDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar plato' })
  @ApiParam({ name: 'id', type: Number })
  @ApiNoContentResponse()
  eliminar(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.platosService.eliminar(id);
  }
}
