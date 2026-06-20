import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from './entities/ticket.entity';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { PagarTicketDto } from './dto/pagar-ticket.dto';
import { Mesa } from '../mesas/entities/mesa.entity';
import { Pedido } from '../pedidos/entities/pedido.entity';

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

  async crear(createTicketDto: CreateTicketDto): Promise<Ticket> {
    const mesa = await this.mesaRepository.findOne({
      where: { id: createTicketDto.mesaId },
    });
    if (!mesa) {
      throw new BadRequestException(
        `La mesa con id ${createTicketDto.mesaId} no existe`,
      );
    }

    const pedidos = await this.pedidoRepository.find({
      where: { mesa: { id: createTicketDto.mesaId } },
    });
    if (pedidos.length === 0) {
      throw new BadRequestException(
        `La mesa ${createTicketDto.mesaId} no tiene pedidos`,
      );
    }

    const total = pedidos.reduce((sum, p) => sum + Number(p.total), 0);

    const ticket = this.ticketRepository.create({
      mesa,
      total,
    });

    return this.ticketRepository.save(ticket);
  }

  async encontrarTodos(): Promise<Ticket[]> {
    return this.ticketRepository.find({
      relations: { mesa: true },
      order: { createdAt: 'DESC' },
    });
  }

  async encontrarUno(id: number): Promise<Ticket> {
    const ticket = await this.ticketRepository.findOne({
      where: { id },
      relations: { mesa: true },
    });
    if (!ticket) {
      throw new NotFoundException(`Ticket con id ${id} no encontrado`);
    }
    return ticket;
  }

  async pagar(
    id: number,
    pagarTicketDto: PagarTicketDto,
  ): Promise<Ticket> {
    const ticket = await this.encontrarUno(id);
    if (ticket.estado === 'pagado') {
      throw new BadRequestException('El ticket ya está pagado');
    }
    ticket.metodoPago = pagarTicketDto.metodoPago;
    ticket.estado = 'pagado' as any;
    return this.ticketRepository.save(ticket);
  }
}
