import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Ticket } from './entities/ticket.entity';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { PagarTicketDto } from './dto/pagar-ticket.dto';
import { Mesa } from '../mesas/entities/mesa.entity';
import { Pedido } from '../pedidos/entities/pedido.entity';
import { EstadoTicket } from './entities/estado-ticket.enum';
import { EstadoMesa } from '../mesas/entities/estado-mesa.enum';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    @InjectRepository(Mesa)
    private readonly mesaRepository: Repository<Mesa>,
    @InjectRepository(Pedido)
    private readonly pedidoRepository: Repository<Pedido>,
  ) {}

  async create(createTicketDto: CreateTicketDto): Promise<Ticket> {
    const mesa = await this.mesaRepository.findOne({
      where: { id: createTicketDto.mesaId },
    });

    if (!mesa) {
      throw new NotFoundException(
        `Mesa con ID ${createTicketDto.mesaId} no encontrada`,
      );
    }

    // Buscar solo pedidos de la mesa que no tengan un ticket asignado (no facturados)
    const pedidos = await this.pedidoRepository.find({
      where: { mesa: { id: mesa.id }, ticket: IsNull() },
    });

    if (pedidos.length === 0) {
      throw new BadRequestException(
        `La mesa con ID ${mesa.id} no tiene pedidos pendientes de facturar`,
      );
    }

    const total = pedidos.reduce(
      (acc, pedido) => acc + Number(pedido.total),
      0,
    );

    const newTicket = this.ticketRepository.create({
      mesa,
      total,
    });

    const savedTicket = await this.ticketRepository.save(newTicket);

    // Asociar todos los pedidos facturados al ticket recién creado
    for (const pedido of pedidos) {
      pedido.ticket = savedTicket;
      await this.pedidoRepository.save(pedido);
    }

    return savedTicket;
  }

  async findOne(id: number): Promise<any> {
    const ticket = await this.ticketRepository.findOne({
      where: { id },
      relations: { mesa: true },
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket con ID ${id} no encontrado`);
    }

    // Obtener los pedidos asociados a este ticket en particular
    const pedidos = await this.pedidoRepository.find({
      where: { ticket: { id: ticket.id } },
      relations: { platos: true },
    });

    return {
      ...ticket,
      pedidos,
    };
  }

  async pagar(id: number, pagarTicketDto: PagarTicketDto): Promise<Ticket> {
    const ticket = await this.ticketRepository.findOne({
      where: { id },
      relations: { mesa: true },
    });
    if (!ticket) {
      throw new NotFoundException(`Ticket con ID ${id} no encontrado`);
    }

    ticket.estado = EstadoTicket.PAGADO;
    ticket.metodoPago = pagarTicketDto.metodoPago;

    // Liberar la mesa automáticamente al pagar el ticket
    ticket.mesa.estado = EstadoMesa.DISPONIBLE;
    await this.mesaRepository.save(ticket.mesa);

    return this.ticketRepository.save(ticket);
  }
}

