import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Mesa } from '../mesas/mesa.entity';
import { Plato } from '../platos/plato.entity';
import { ActualizarPedidoDto } from './dto/actualizar-pedido.dto';
import { CrearPedidoDto } from './dto/crear-pedido.dto';
import { EstadoPedido } from './pedido-estado.enum';
import { Pedido } from './pedido.entity';

@Injectable()
export class PedidosService {
  constructor(
    @InjectRepository(Pedido)
    private readonly pedidosRepository: Repository<Pedido>,
    @InjectRepository(Mesa)
    private readonly mesasRepository: Repository<Mesa>,
    @InjectRepository(Plato)
    private readonly platosRepository: Repository<Plato>,
  ) { }

  async crear(crearPedidoDto: CrearPedidoDto): Promise<Pedido> {
    const mesa = await this.obtenerMesaValida(crearPedidoDto.mesaId);
    const platos = await this.obtenerPlatosValidos(crearPedidoDto.platoIds);
    const total = this.calcularTotal(platos);

    const pedido = this.pedidosRepository.create({
      mesa,
      platos,
      total,
    });

    const guardado = await this.pedidosRepository.save(pedido);
    return this.obtenerPorId(guardado.id);
  }

  async obtenerTodos(): Promise<Pedido[]> {
    return this.pedidosRepository.find({
      relations: {
        mesa: true,
        platos: true,
      },
    });
  }

  async obtenerPorId(id: number): Promise<Pedido> {
    const pedido = await this.pedidosRepository.findOne({
      where: { id },
      relations: {
        mesa: true,
        platos: true,
      },
    });

    if (!pedido) {
      throw new NotFoundException(`Pedido con id ${id} no encontrado`);
    }

    return pedido;
  }

  async actualizar(
    id: number,
    actualizarPedidoDto: ActualizarPedidoDto,
  ): Promise<Pedido> {
    const pedido = await this.obtenerPorId(id);

    if (actualizarPedidoDto.mesaId !== undefined) {
      pedido.mesa = await this.obtenerMesaValida(actualizarPedidoDto.mesaId);
    }

    if (actualizarPedidoDto.platoIds !== undefined) {
      pedido.platos = await this.obtenerPlatosValidos(
        actualizarPedidoDto.platoIds,
      );
      pedido.total = this.calcularTotal(pedido.platos);
    }

    await this.pedidosRepository.save(pedido);
    return this.obtenerPorId(id);
  }

  async eliminar(id: number): Promise<void> {
    const pedido = await this.obtenerPorId(id);
    await this.pedidosRepository.remove(pedido);
  }

  async cambiarEstado(
    id: number,
    nuevoEstado: EstadoPedido,
  ): Promise<Pedido> {
    const pedido = await this.obtenerPorId(id);
    pedido.estado = nuevoEstado;
    await this.pedidosRepository.save(pedido);
    return this.obtenerPorId(id);
  }

  private async obtenerMesaValida(mesaId: number): Promise<Mesa> {
    const mesa = await this.mesasRepository.findOne({ where: { id: mesaId } });
    if (!mesa) {
      throw new BadRequestException(`Mesa con id ${mesaId} no encontrada`);
    }
    return mesa;
  }

  private async obtenerPlatosValidos(platoIds: number[]): Promise<Plato[]> {
    const platosPorId = await this.obtenerPlatosPorId(platoIds);
    return platoIds.map((id) => platosPorId.get(id)!);
  }

  private async obtenerPlatosPorId(
    platoIds: number[],
  ): Promise<Map<number, Plato>> {
    const idsUnicos = [...new Set(platoIds)];
    const platos = await this.platosRepository.findBy({ id: In(idsUnicos) });

    if (platos.length !== idsUnicos.length) {
      const encontrados = new Set(platos.map((plato) => plato.id));
      const faltantes = idsUnicos.filter((id) => !encontrados.has(id));
      throw new BadRequestException(
        `Platos no encontrados: ${faltantes.join(', ')}`,
      );
    }

    return new Map(platos.map((plato) => [plato.id, plato]));
  }

  private calcularTotal(platos: Plato[]): number {
    return platos.reduce((suma, plato) => suma + Number(plato.precio), 0);
  }
}
