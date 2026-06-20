import { Controller, Get, Post, Patch, Body, Param, ParseIntPipe } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { TicketService } from './tickets.service';
import { CrearTicketDto } from './dto/crear-ticket.dto';
import { PagarTicketDto } from './dto/pagar-ticket.dto';

@ApiTags('tickets')
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketService: TicketService) { }

  @Post()
  @ApiOperation({ summary: 'Generar ticket a partir de una comanda' })
  generar(@Body() crearTicketDto: CrearTicketDto) {
    return this.ticketService.crear(crearTicketDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los tickets' })
  findAll() {
    return this.ticketService.findAll();
  }

  // Frontend sends PATCH /tickets/:id/pagar with { metodoPago, estado }
  @Patch(':id/pagar')
  @ApiOperation({ summary: 'Pagar un ticket' })
  @ApiParam({ name: 'id', example: 1 })
  pagar(
    @Param('id', ParseIntPipe) id: number,
    @Body() pagarTicketDto: PagarTicketDto,
  ) {
    return this.ticketService.pagar(id, pagarTicketDto);
  }
}