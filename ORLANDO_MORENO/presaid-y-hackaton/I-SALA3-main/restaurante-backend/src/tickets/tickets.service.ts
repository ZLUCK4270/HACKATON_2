import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket, EstadoTicket, MetodoPago } from './entities/ticket.entity';
import { Mesa } from '../mesas/entities/mesa.entity';
import { Pedido } from '../pedidos/entities/pedido.entity';
import { CreateTicketDto } from './dto/create-ticket.dto';

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
    const { mesaId } = createTicketDto;

    // Validar que la mesa existe
    const mesa = await this.mesaRepository.findOne({ where: { id: mesaId } });
    if (!mesa) {
      throw new BadRequestException(
        `La mesa con id ${mesaId} no existe. Por favor usa un mesaId válido.`,
      );
    }

    // Buscar todos los pedidos de la mesa
    const pedidos = await this.pedidoRepository.find({
      where: { mesaId },
      relations: ['platos'],
    });

    if (pedidos.length === 0) {
      throw new BadRequestException(
        `La mesa con id ${mesaId} no tiene ningún pedido registrado. No se puede generar un ticket.`,
      );
    }

    // Calcular el total
    const total = pedidos.reduce((sum, pedido) => sum + Number(pedido.total), 0);

    const ticket = this.ticketRepository.create({
      mesa,
      mesaId,
      total,
      pedidos,
      estado: EstadoTicket.ABIERTO,
    });

    return this.ticketRepository.save(ticket);
  }

  async findOne(id: number): Promise<Ticket> {
    const ticket = await this.ticketRepository.findOne({
      where: { id },
      relations: ['mesa', 'pedidos', 'pedidos.platos'],
    });
    if (!ticket) {
      throw new NotFoundException(`Ticket con id ${id} no encontrado.`);
    }
    return ticket;
  }

  async findAll(): Promise<Ticket[]> {
    return this.ticketRepository.find({
      relations: ['mesa', 'pedidos'],
    });
  }

  async pagar(id: number, metodoPago: MetodoPago): Promise<Ticket> {
    const ticket = await this.findOne(id);

    if (!Object.values(MetodoPago).includes(metodoPago)) {
      throw new BadRequestException(
        `Método de pago '${metodoPago}' no válido. Usa: efectivo, tarjeta.`,
      );
    }

    ticket.estado = EstadoTicket.PAGADO;
    ticket.metodoPago = metodoPago;

    return this.ticketRepository.save(ticket);
  }

  async remove(id: number): Promise<{ message: string }> {
    const ticket = await this.findOne(id);
    await this.ticketRepository.remove(ticket);
    return { message: `Ticket ${id} eliminado correctamente.` };
  }
}
