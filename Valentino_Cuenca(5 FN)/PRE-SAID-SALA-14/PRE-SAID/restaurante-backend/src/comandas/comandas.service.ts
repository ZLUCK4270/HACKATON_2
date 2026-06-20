import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comanda } from './entities/comanda.entity';
import { CreateComandaDto } from './dto/create-comanda.dto';
import { UpdateComandaDto } from './dto/update-comanda.dto';
import { CambiarEstadoComandaDto } from './dto/cambiar-estado-comanda.dto';
import { Pedido } from '../pedidos/entities/pedido.entity';

@Injectable()
export class ComandasService {
  constructor(
    @InjectRepository(Comanda)
    private readonly comandaRepository: Repository<Comanda>,
    @InjectRepository(Pedido)
    private readonly pedidoRepository: Repository<Pedido>,
  ) {}

  async crear(createComandaDto: CreateComandaDto): Promise<Comanda> {
    const pedido = await this.pedidoRepository.findOne({
      where: { id: createComandaDto.pedidoId },
    });
    if (!pedido) {
      throw new BadRequestException(
        `El pedido con id ${createComandaDto.pedidoId} no existe`,
      );
    }

    const comanda = this.comandaRepository.create({
      pedido,
      observaciones: createComandaDto.observaciones,
    });

    return this.comandaRepository.save(comanda);
  }

  async encontrarTodos(): Promise<Comanda[]> {
    return this.comandaRepository.find({
      relations: { pedido: { mesa: true, platos: true } },
      order: { createdAt: 'DESC' },
    });
  }

  async encontrarUno(id: number): Promise<Comanda> {
    const comanda = await this.comandaRepository.findOne({
      where: { id },
      relations: { pedido: { mesa: true, platos: true } },
    });
    if (!comanda) {
      throw new NotFoundException(`Comanda con id ${id} no encontrada`);
    }
    return comanda;
  }

  async actualizar(id: number, updateComandaDto: UpdateComandaDto): Promise<Comanda> {
    const comanda = await this.encontrarUno(id);

    if (updateComandaDto.pedidoId) {
      const pedido = await this.pedidoRepository.findOne({
        where: { id: updateComandaDto.pedidoId },
      });
      if (!pedido) {
        throw new BadRequestException(
          `El pedido con id ${updateComandaDto.pedidoId} no existe`,
        );
      }
      comanda.pedido = pedido;
    }

    if (updateComandaDto.observaciones !== undefined) {
      comanda.observaciones = updateComandaDto.observaciones;
    }

    return this.comandaRepository.save(comanda);
  }

  async eliminar(id: number): Promise<void> {
    const comanda = await this.encontrarUno(id);
    await this.comandaRepository.remove(comanda);
  }

  async cambiarEstado(
    id: number,
    cambiarEstadoComandaDto: CambiarEstadoComandaDto,
  ): Promise<Comanda> {
    const comanda = await this.encontrarUno(id);
    comanda.estado = cambiarEstadoComandaDto.estado;
    return this.comandaRepository.save(comanda);
  }
}
