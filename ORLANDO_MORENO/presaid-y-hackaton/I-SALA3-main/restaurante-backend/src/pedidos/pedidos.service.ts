import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pedido, EstadoPedido } from './entities/pedido.entity';
import { Plato } from '../platos/entities/plato.entity';
import { Mesa } from '../mesas/entities/mesa.entity';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';

@Injectable()
export class PedidosService {
  constructor(
    @InjectRepository(Pedido)
    private readonly pedidoRepository: Repository<Pedido>,

    @InjectRepository(Plato)
    private readonly platoRepository: Repository<Plato>,

    @InjectRepository(Mesa)
    private readonly mesaRepository: Repository<Mesa>,
  ) {}

  async create(createPedidoDto: CreatePedidoDto): Promise<Pedido> {
    const { mesaId, platoIds } = createPedidoDto;

    // Validar que la mesa existe
    const mesa = await this.mesaRepository.findOne({ where: { id: mesaId } });
    if (!mesa) {
      throw new BadRequestException(
        `La mesa con id ${mesaId} no existe. Por favor usa un mesaId válido.`,
      );
    }

    // Validar que todos los platos existen
    const platos: Plato[] = [];
    for (const platoId of platoIds) {
      const plato = await this.platoRepository.findOne({ where: { id: platoId } });
      if (!plato) {
        throw new BadRequestException(
          `El plato con id ${platoId} no existe. Por favor usa platoIds válidos.`,
        );
      }
      platos.push(plato);
    }

    // Calcular total sumando precios de los platos
    const total = platos.reduce((sum, plato) => sum + Number(plato.precio), 0);

    const pedido = this.pedidoRepository.create({
      mesa,
      mesaId,
      platos,
      total,
      estado: createPedidoDto.estado ?? EstadoPedido.PENDIENTE,
    });

    return this.pedidoRepository.save(pedido);
  }

  async findAll(): Promise<Pedido[]> {
    return this.pedidoRepository.find({
      relations: ['mesa', 'platos'],
    });
  }

  async findOne(id: number): Promise<Pedido> {
    const pedido = await this.pedidoRepository.findOne({
      where: { id },
      relations: ['mesa', 'platos'],
    });
    if (!pedido) {
      throw new NotFoundException(`Pedido con id ${id} no encontrado.`);
    }
    return pedido;
  }

  async update(id: number, updatePedidoDto: UpdatePedidoDto): Promise<Pedido> {
    const pedido = await this.findOne(id);

    if (updatePedidoDto.mesaId !== undefined) {
      const mesa = await this.mesaRepository.findOne({
        where: { id: updatePedidoDto.mesaId },
      });
      if (!mesa) {
        throw new BadRequestException(
          `La mesa con id ${updatePedidoDto.mesaId} no existe.`,
        );
      }
      pedido.mesa = mesa;
      pedido.mesaId = mesa.id;
    }

    if (updatePedidoDto.platoIds !== undefined) {
      const platos: Plato[] = [];
      for (const platoId of updatePedidoDto.platoIds) {
        const plato = await this.platoRepository.findOne({ where: { id: platoId } });
        if (!plato) {
          throw new BadRequestException(
            `El plato con id ${platoId} no existe.`,
          );
        }
        platos.push(plato);
      }
      pedido.platos = platos;
      pedido.total = platos.reduce((sum, p) => sum + Number(p.precio), 0);
    }

    if (updatePedidoDto.estado !== undefined) {
      pedido.estado = updatePedidoDto.estado;
    }

    return this.pedidoRepository.save(pedido);
  }

  async cambiarEstado(id: number, nuevoEstado: EstadoPedido): Promise<Pedido> {
    const pedido = await this.findOne(id);

    if (!Object.values(EstadoPedido).includes(nuevoEstado)) {
      throw new BadRequestException(
        `Estado '${nuevoEstado}' no válido. Usa: pendiente, en_preparacion, listo, entregado.`,
      );
    }

    pedido.estado = nuevoEstado;
    return this.pedidoRepository.save(pedido);
  }

  async remove(id: number): Promise<{ message: string }> {
    const pedido = await this.findOne(id);
    await this.pedidoRepository.remove(pedido);
    return { message: `Pedido ${id} eliminado correctamente.` };
  }
}
