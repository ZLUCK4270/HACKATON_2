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
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { PagarTicketDto } from './dto/pagar-ticket.dto';

@ApiTags('tickets')
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  @ApiOperation({
    summary: 'Crear un nuevo ticket a partir de los pedidos de una mesa',
  })
  create(@Body() createTicketDto: CreateTicketDto) {
    return this.ticketsService.create(createTicketDto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener un ticket por ID con su mesa y pedidos incluidos',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ticketsService.findOne(id);
  }

  @Patch(':id/pagar')
  @ApiOperation({ summary: 'Pagar un ticket' })
  pagar(
    @Param('id', ParseIntPipe) id: number,
    @Body() pagarTicketDto: PagarTicketDto,
  ) {
    return this.ticketsService.pagar(id, pagarTicketDto);
  }
}
