import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import {
  Comanda,
  ComandaEstado,
} from './entities/comanda.entity';

import { CreateComandaDto } from './dto/create-comanda.dto';

import { UpdateEstadoComandaDto } from './dto/update-estado-comanda.dto';

import { PedidosService } from '../pedidos/pedidos.service';

@Injectable()
export class ComandasService {
  constructor(
    @InjectRepository(Comanda)
    private readonly comandaRepository: Repository<Comanda>,

    private readonly pedidosService: PedidosService,
  ) {}

  async create(
    createComandaDto: CreateComandaDto,
  ): Promise<Comanda> {
    const { pedidoId, observaciones } = createComandaDto;

    try {
      await this.pedidosService.findOne(pedidoId);
    } catch {
      throw new BadRequestException(
        `Pedido con ID ${pedidoId} no existe`,
      );
    }

    const comanda = this.comandaRepository.create({
      pedidoId,
      observaciones,
      estado: ComandaEstado.RECIBIDA,
    });

    return await this.comandaRepository.save(comanda);
  }

  async findAll(): Promise<Comanda[]> {
    return await this.comandaRepository.find({
      relations: {
        pedido: {
          mesa: true,
          platos: true,
        },
      },
    });
  }

async findOne(id: number): Promise<Comanda> {
  try {
    const comanda = await this.comandaRepository.findOne({
      where: { id },
      relations: {
        pedido: {
          mesa: true,
          platos: true,
        },
      },
    });

    if (!comanda) {
      throw new NotFoundException(
        `Comanda con ID ${id} no encontrada`,
      );
    }

    return comanda;
  } catch (error) {
    console.error('ERROR REAL:', error);
    throw new NotFoundException(
      `Comanda con ID ${id} no encontrada`,
    );
  }
}

  async cambiarEstado(
    id: number,
    updateEstadoDto: UpdateEstadoComandaDto,
  ): Promise<Comanda> {
    const comanda = await this.findOne(id);

    comanda.estado = updateEstadoDto.estado;

    return await this.comandaRepository.save(comanda);
  }

async remove(id: number) {
  try {
    const result = await this.comandaRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(
        `Comanda con ID ${id} no existe`,
      );
    }

    return { message: 'Comanda eliminada correctamente' };
  } catch (error) {
    console.log('ERROR REAL DELETE:', error);
    throw error;
  }
}
}