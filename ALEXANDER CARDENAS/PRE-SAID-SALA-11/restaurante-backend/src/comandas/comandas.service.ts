import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comanda } from './entities/comanda.entity';
import { CreateComandaDto } from './dto/create-comanda.dto';
import { UpdateEstadoComandaDto } from './dto/update-estado-comanda.dto';
import { Pedido } from '../pedidos/entities/pedido.entity';

@Injectable()
export class ComandasService {
  constructor(
    @InjectRepository(Comanda)
    private readonly comandaRepository: Repository<Comanda>,
    @InjectRepository(Pedido)
    private readonly pedidoRepository: Repository<Pedido>,
  ) {}

  async create(createComandaDto: CreateComandaDto): Promise<Comanda> {
    const pedido = await this.pedidoRepository.findOne({
      where: { id: createComandaDto.pedidoId },
    });

    if (!pedido) {
      throw new NotFoundException(
        `Pedido con ID ${createComandaDto.pedidoId} no encontrado`,
      );
    }

    const newComanda = this.comandaRepository.create({
      pedido,
      observaciones: createComandaDto.observaciones,
    });

    return this.comandaRepository.save(newComanda);
  }

  async findAll(): Promise<Comanda[]> {
    return this.comandaRepository.find({
      relations: {
        pedido: {
          platos: true,
        },
      },
    });
  }

  async updateEstado(
    id: number,
    updateEstadoComandaDto: UpdateEstadoComandaDto,
  ): Promise<Comanda> {
    const comanda = await this.comandaRepository.findOne({ where: { id } });
    if (!comanda) {
      throw new NotFoundException(`Comanda con ID ${id} no encontrada`);
    }

    comanda.estado = updateEstadoComandaDto.estado;
    return this.comandaRepository.save(comanda);
  }
}
