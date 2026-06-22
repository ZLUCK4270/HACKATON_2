import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket, TicketEstado } from './entities/ticket.entity';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { PagarTicketDto } from './dto/pagar-ticket.dto';
import { MesasService } from '../mesas/mesas.service';
import { Pedido } from '../pedidos/entities/pedido.entity';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    @InjectRepository(Pedido)
    private readonly pedidoRepository: Repository<Pedido>,
    private readonly mesasService: MesasService,
  ) {}

  async create(createTicketDto: CreateTicketDto): Promise<Ticket> {
    const { mesaId } = createTicketDto;

    await this.mesasService.findOne(mesaId);

    const pedidos = await this.pedidoRepository.find({
      where: { mesaId },
      relations: { platos: true },
    });

    if (pedidos.length === 0) {
      throw new BadRequestException(
        `La mesa con ID ${mesaId} no tiene pedidos`,
      );
    }

    const total = pedidos.reduce(
      (sum, pedido) => sum + Number(pedido.total),
      0,
    );

    const ticket = this.ticketRepository.create({
      mesaId,
      total,
      estado: TicketEstado.ABIERTO,
    });

    return await this.ticketRepository.save(ticket);
  }

  async findAll(): Promise<Ticket[]> {
    return await this.ticketRepository.find();
  }

  async findOne(id: number): Promise<Ticket> {
    const ticket = await this.ticketRepository.findOne({
      where: { id },
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket con ID ${id} no encontrado`);
    }

    return ticket;
  }

  async findOneWithPedidos(id: number) {
    const ticket = await this.findOne(id);

    const pedidos = await this.pedidoRepository.find({
      where: { mesaId: ticket.mesaId },
      relations: { platos: true },
    });

    return { ticket, pedidos };
  }

  async pagar(
    id: number,
    pagarTicketDto: PagarTicketDto,
  ): Promise<Ticket> {
    const ticket = await this.findOne(id);

    if (ticket.estado === TicketEstado.PAGADO) {
      throw new BadRequestException(
        `El ticket con ID ${id} ya está pagado`,
      );
    }

    ticket.estado = TicketEstado.PAGADO;
    ticket.metodoPago = pagarTicketDto.metodoPago;

    return await this.ticketRepository.save(ticket);
  }
}
