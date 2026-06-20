import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Pedido } from './entities/pedido.entity';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';
import { CambiarEstadoPedidoDto } from './dto/cambiar-estado-pedido.dto';
import { Mesa } from '../mesas/entities/mesa.entity';
import { Plato } from '../platos/entities/plato.entity';

@Injectable()
export class PedidosService {
  constructor(
    @InjectRepository(Pedido)
    private readonly pedidoRepository: Repository<Pedido>,
    @InjectRepository(Mesa)
    private readonly mesaRepository: Repository<Mesa>,
    @InjectRepository(Plato)
    private readonly platoRepository: Repository<Plato>,
  ) {}

  async crear(createPedidoDto: CreatePedidoDto): Promise<Pedido> {
    const mesa = await this.mesaRepository.findOne({
      where: { id: createPedidoDto.mesaId },
    });
    if (!mesa) {
      throw new BadRequestException(
        `La mesa con id ${createPedidoDto.mesaId} no existe`,
      );
    }

    const platos = await this.platoRepository.find({
      where: { id: In(createPedidoDto.platoIds) },
    });
    if (platos.length !== createPedidoDto.platoIds.length) {
      const encontrados = platos.map((p) => p.id);
      const faltantes = createPedidoDto.platoIds.filter(
        (id) => !encontrados.includes(id),
      );
      throw new BadRequestException(
        `Los siguientes platos no existen: ${faltantes.join(', ')}`,
      );
    }

    const total = Number(
      platos.reduce((sum, plato) => sum + Number(plato.precio), 0).toFixed(2),
    );

    const pedido = this.pedidoRepository.create({
      mesa,
      platos,
      total,
    });

    return this.pedidoRepository.save(pedido);
  }

  async encontrarTodos(): Promise<Pedido[]> {
    return this.pedidoRepository.find({
      relations: { mesa: true, platos: true },
      order: { createdAt: 'DESC' },
    });
  }

  async encontrarUno(id: number): Promise<Pedido> {
    const pedido = await this.pedidoRepository.findOne({
      where: { id },
      relations: { mesa: true, platos: true },
    });
    if (!pedido) {
      throw new NotFoundException(`Pedido con id ${id} no encontrado`);
    }
    return pedido;
  }

  async actualizar(
    id: number,
    updatePedidoDto: UpdatePedidoDto,
  ): Promise<Pedido> {
    const pedido = await this.encontrarUno(id);

    if (updatePedidoDto.mesaId) {
      const mesa = await this.mesaRepository.findOne({
        where: { id: updatePedidoDto.mesaId },
      });
      if (!mesa) {
        throw new BadRequestException(
          `La mesa con id ${updatePedidoDto.mesaId} no existe`,
        );
      }
      pedido.mesa = mesa;
    }

    if (updatePedidoDto.platoIds) {
      const platos = await this.platoRepository.find({
        where: { id: In(updatePedidoDto.platoIds) },
      });
      if (platos.length !== updatePedidoDto.platoIds.length) {
        const encontrados = platos.map((p) => p.id);
        const faltantes = updatePedidoDto.platoIds.filter(
          (id) => !encontrados.includes(id),
        );
        throw new BadRequestException(
          `Los siguientes platos no existen: ${faltantes.join(', ')}`,
        );
      }
      pedido.platos = platos;
      pedido.total = Number(
        platos
          .reduce((sum, plato) => sum + Number(plato.precio), 0)
          .toFixed(2),
      );
    }

    return this.pedidoRepository.save(pedido);
  }

  async eliminar(id: number): Promise<void> {
    const pedido = await this.encontrarUno(id);
    await this.pedidoRepository.remove(pedido);
  }

  async cambiarEstado(
    id: number,
    cambiarEstadoPedidoDto: CambiarEstadoPedidoDto,
  ): Promise<Pedido> {
    const pedido = await this.encontrarUno(id);
    pedido.estado = cambiarEstadoPedidoDto.estado;
    return this.pedidoRepository.save(pedido);
  }
}
