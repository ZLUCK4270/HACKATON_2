import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comanda, EstadoComanda } from './entities/comanda.entity';
import { Pedido } from '../pedidos/entities/pedido.entity';
import { CreateComandaDto } from './dto/create-comanda.dto';

@Injectable()
export class ComandasService {
  constructor(
    @InjectRepository(Comanda)
    private readonly comandaRepository: Repository<Comanda>,

    @InjectRepository(Pedido)
    private readonly pedidoRepository: Repository<Pedido>,
  ) {}

  async create(createComandaDto: CreateComandaDto): Promise<Comanda> {
    const { pedidoId, observaciones, estado } = createComandaDto;

    // Validar que el pedido exista
    const pedido = await this.pedidoRepository.findOne({
      where: { id: pedidoId },
      relations: ['mesa', 'platos'],
    });
    if (!pedido) {
      throw new BadRequestException(
        `El pedido con id ${pedidoId} no existe. Por favor usa un pedidoId válido.`,
      );
    }

    const comanda = this.comandaRepository.create({
      pedido,
      pedidoId,
      observaciones,
      estado: estado ?? EstadoComanda.RECIBIDA,
    });

    return this.comandaRepository.save(comanda);
  }

  async findAll(): Promise<Comanda[]> {
    return this.comandaRepository.find({
      relations: ['pedido', 'pedido.mesa', 'pedido.platos'],
    });
  }

  async findOne(id: number): Promise<Comanda> {
    const comanda = await this.comandaRepository.findOne({
      where: { id },
      relations: ['pedido', 'pedido.mesa', 'pedido.platos'],
    });
    if (!comanda) {
      throw new NotFoundException(`Comanda con id ${id} no encontrada.`);
    }
    return comanda;
  }

  async cambiarEstado(id: number, nuevoEstado: EstadoComanda): Promise<Comanda> {
    const comanda = await this.findOne(id);

    if (!Object.values(EstadoComanda).includes(nuevoEstado)) {
      throw new BadRequestException(
        `Estado '${nuevoEstado}' no válido. Usa: recibida, en_preparacion, lista.`,
      );
    }

    comanda.estado = nuevoEstado;
    return this.comandaRepository.save(comanda);
  }

  async remove(id: number): Promise<{ message: string }> {
    const comanda = await this.findOne(id);
    await this.comandaRepository.remove(comanda);
    return { message: `Comanda ${id} eliminada correctamente.` };
  }
}
