import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Ticket } from './ticket.entity';
import { EstadoTicket } from './ticket-estado.enum';
import { MetodoPago } from './metodo-pago.enum';
import { Comanda } from '../comandas/comanda.entity';
import { CrearTicketDto } from './dto/crear-ticket.dto';
import { PagarTicketDto } from './dto/pagar-ticket.dto';

@Injectable()
export class TicketService {
  constructor(
    @InjectRepository(Ticket)
    private ticketRepo: Repository<Ticket>,

    @InjectRepository(Comanda)
    private comandaRepo: Repository<Comanda>,
  ) { }

  // 🧾 Crear ticket a partir de una comanda
  async crear(crearTicketDto: CrearTicketDto) {
    const comanda = await this.comandaRepo.findOne({
      where: { id: crearTicketDto.comandaId },
      relations: {
        pedido: {
          mesa: true,
          platos: true,
        },
      },
    });

    if (!comanda) {
      throw new NotFoundException('Comanda no encontrada');
    }

    const pedido = comanda.pedido;

    const ticket = this.ticketRepo.create({
      mesa: pedido.mesa,
      pedidos: [pedido],
      estado: EstadoTicket.ABIERTO,
      total: pedido.total,
    });

    return this.ticketRepo.save(ticket);
  }

  // 📄 Listar tickets
  async findAll() {
    return this.ticketRepo.find({
      relations: {
        mesa: true,
        pedidos: {
          platos: true,
        },
      },
    });
  }

  // 💳 Pagar ticket
  async pagar(id: number, pagarTicketDto: PagarTicketDto) {
    const ticket = await this.ticketRepo.findOne({
      where: { id },
      relations: {
        mesa: true,
        pedidos: true,
      },
    });

    if (!ticket) throw new NotFoundException('Ticket no encontrado');

    ticket.estado = EstadoTicket.PAGADO;
    ticket.metodoPago = pagarTicketDto.metodoPago as MetodoPago;

    return this.ticketRepo.save(ticket);
  }
}