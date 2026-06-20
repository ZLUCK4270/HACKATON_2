import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { PagarTicketDto } from './dto/pagar-ticket.dto';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  crear(@Body() createTicketDto: CreateTicketDto) {
    return this.ticketsService.crear(createTicketDto);
  }

  @Get()
  encontrarTodos() {
    return this.ticketsService.encontrarTodos();
  }

  @Get(':id')
  encontrarUno(@Param('id', ParseIntPipe) id: number) {
    return this.ticketsService.encontrarUno(id);
  }

  @Patch(':id/pagar')
  pagar(
    @Param('id', ParseIntPipe) id: number,
    @Body() pagarTicketDto: PagarTicketDto,
  ) {
    return this.ticketsService.pagar(id, pagarTicketDto);
  }
}
