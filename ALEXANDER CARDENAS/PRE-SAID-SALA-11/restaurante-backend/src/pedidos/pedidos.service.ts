import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Mesa } from '../mesas/entities/mesa.entity';
import { Plato } from '../platos/entities/plato.entity';
import { ActualizarPedidoDto } from './dto/actualizar-pedido.dto';
import { CrearPedidoDto } from './dto/crear-pedido.dto';
import { EstadoPedido } from './entities/estado-pedido.enum';
import { Pedido } from './entities/pedido.entity';
import { Comanda } from '../comandas/entities/comanda.entity';
import { EstadoComanda } from '../comandas/entities/estado-comanda.enum';

@Injectable()
export class PedidosService {
  private readonly relaciones = { relations: { mesa: true, platos: true } };

  constructor(
    @InjectRepository(Pedido)
    private readonly pedidosRepository: Repository<Pedido>,
    @InjectRepository(Mesa)
    private readonly mesasRepository: Repository<Mesa>,
    @InjectRepository(Plato)
    private readonly platosRepository: Repository<Plato>,
    @InjectRepository(Comanda)
    private readonly comandasRepository: Repository<Comanda>,
  ) {}

  async crear(crearPedidoDto: CrearPedidoDto): Promise<Pedido> {
    const mesa = await this.validarMesa(crearPedidoDto.mesaId);
    const platos = await this.validarYObtenerPlatos(crearPedidoDto.platoIds);
    const total = this.calcularTotal(platos);

    const pedido = this.pedidosRepository.create({
      mesa,
      platos,
      total,
      estado: EstadoPedido.PENDIENTE,
    });
    const guardado = await this.pedidosRepository.save(pedido);
    return this.encontrarUno(guardado.id);
  }


  async encontrarTodos(): Promise<Pedido[]> {
    return this.pedidosRepository.find(this.relaciones);
  }

  async encontrarUno(id: number): Promise<Pedido> {
    const pedido = await this.pedidosRepository.findOne({
      where: { id },
      ...this.relaciones,
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
    const pedido = await this.encontrarUno(id);

    if (actualizarPedidoDto.mesaId !== undefined) {
      pedido.mesa = await this.validarMesa(actualizarPedidoDto.mesaId);
    }

    if (actualizarPedidoDto.platoIds !== undefined) {
      pedido.platos = await this.validarYObtenerPlatos(
        actualizarPedidoDto.platoIds,
      );
      pedido.total = this.calcularTotal(pedido.platos);
    }

    await this.pedidosRepository.save(pedido);
    return this.encontrarUno(id);
  }

  async eliminar(id: number): Promise<void> {
    const pedido = await this.encontrarUno(id);
    await this.pedidosRepository.remove(pedido);
  }

  async cambiarEstado(id: number, nuevoEstado: EstadoPedido): Promise<Pedido> {
    const pedido = await this.encontrarUno(id);
    pedido.estado = nuevoEstado;
    await this.pedidosRepository.save(pedido);
    return this.encontrarUno(id);
  }

  private async validarMesa(mesaId: number): Promise<Mesa> {
    const mesa = await this.mesasRepository.findOne({ where: { id: mesaId } });
    if (!mesa) {
      throw new BadRequestException(`Mesa con id ${mesaId} no existe`);
    }
    return mesa;
  }

  private async validarYObtenerPlatos(platoIds: number[]): Promise<Plato[]> {
    const idsUnicos = [...new Set(platoIds)];
    const platosEncontrados = await this.platosRepository.find({
      where: { id: In(idsUnicos) },
    });
    const platosPorId = new Map(
      platosEncontrados.map((plato) => [plato.id, plato]),
    );
    const idsFaltantes = idsUnicos.filter((id) => !platosPorId.has(id));

    if (idsFaltantes.length > 0) {
      throw new BadRequestException(
        `Plato(s) con id ${idsFaltantes.join(', ')} no existe(n)`,
      );
    }

    return platoIds.map((id) => platosPorId.get(id)!);
  }

  private calcularTotal(platos: Plato[]): number {
    return platos.reduce((suma, plato) => suma + Number(plato.precio), 0);
  }
}
