import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Pedido, PedidoEstado } from './entities/pedido.entity';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';
import { MesasService } from '../mesas/mesas.service';
import { PlatosService } from '../platos/platos.service';

@Injectable()
export class PedidosService {
  constructor(
    @InjectRepository(Pedido)
    private readonly pedidoRepository: Repository<Pedido>,
    private readonly mesasService: MesasService,
    private readonly platosService: PlatosService,
  ) {}

  async create(createPedidoDto: CreatePedidoDto): Promise<Pedido> {
    const { mesaId, platoIds } = createPedidoDto;

    // Validar que mesaId existe
    try {
      await this.mesasService.findOne(mesaId);
    } catch (error) {
      throw new BadRequestException(
        `Mesa con ID ${mesaId} no existe`,
      );
    }

    // Validar que todos los platoIds existen
    const platos = [];
    let totalPrice = 0;

    for (const platoId of platoIds) {
      try {
        const plato = await this.platosService.findOne(platoId);
        platos.push(plato);
        totalPrice += Number(plato.precio);
      } catch (error) {
        throw new BadRequestException(
          `Plato con ID ${platoId} no existe`,
        );
      }
    }

    // Crear nuevo pedido
    const nuevoPedido = this.pedidoRepository.create({
      mesaId,
      platos,
      total: totalPrice,
      estado: PedidoEstado.PENDIENTE,
    });

    return await this.pedidoRepository.save(nuevoPedido);
  }

  async findAll(): Promise<Pedido[]> {
    return await this.pedidoRepository.find({
      relations: {
        mesa: true,
        platos: true,
      },
    });
  }

  async findOne(id: number): Promise<Pedido> {
    const pedido = await this.pedidoRepository.findOne({
      where: { id },
      relations: {
        mesa: true,
        platos: true,
      },
    });

    if (!pedido) {
      throw new NotFoundException(`Pedido con ID ${id} no encontrado`);
    }

    return pedido;
  }

  async update(
    id: number,
    updatePedidoDto: UpdatePedidoDto,
  ): Promise<Pedido> {
    const pedido = await this.findOne(id);

    // Si se actualizan los platoIds, recalcular total
    if (updatePedidoDto.platoIds) {
      const platos = [];
      let totalPrice = 0;

      for (const platoId of updatePedidoDto.platoIds) {
        try {
          const plato = await this.platosService.findOne(platoId);
          platos.push(plato);
          totalPrice += Number(plato.precio);
        } catch (error) {
          throw new BadRequestException(
            `Plato con ID ${platoId} no existe`,
          );
        }
      }

      pedido.platos = platos;
      pedido.total = totalPrice;
    }

    // Si se actualiza mesaId, validar que existe
    if (updatePedidoDto.mesaId && updatePedidoDto.mesaId !== pedido.mesaId) {
      try {
        await this.mesasService.findOne(updatePedidoDto.mesaId);
        pedido.mesaId = updatePedidoDto.mesaId;
      } catch (error) {
        throw new BadRequestException(
          `Mesa con ID ${updatePedidoDto.mesaId} no existe`,
        );
      }
    }

    const pedidoActualizado = this.pedidoRepository.merge(
      pedido,
      updatePedidoDto,
    );
    return await this.pedidoRepository.save(pedidoActualizado);
  }

  async remove(id: number): Promise<void> {
    const pedido = await this.findOne(id);
    await this.pedidoRepository.remove(pedido);
  }

  async cambiarEstado(
    id: number,
    nuevoEstado: PedidoEstado,
  ): Promise<Pedido> {
    const pedido = await this.findOne(id);
    pedido.estado = nuevoEstado;
    return await this.pedidoRepository.save(pedido);
  }
}
