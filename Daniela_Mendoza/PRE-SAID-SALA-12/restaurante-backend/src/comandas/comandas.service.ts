import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Comanda } from './comanda.entity';
import { EstadoComanda } from './comanda-estado.enum';
import { Pedido } from '../pedidos/pedido.entity';
import { CrearComandaDto } from './dto/crear-comanda.dto';

@Injectable()
export class ComandasService {
  constructor(
    @InjectRepository(Comanda)
    private readonly comandasRepository: Repository<Comanda>,

    @InjectRepository(Pedido)
    private readonly pedidoRepository: Repository<Pedido>,
  ) { }

  // 🧾 CREAR COMANDA
  async crear(crearComandaDto: CrearComandaDto): Promise<Comanda> {
    const pedido = await this.pedidoRepository.findOne({
      where: { id: crearComandaDto.pedidoId },
      relations: { mesa: true, platos: true },
    });

    if (!pedido) {
      throw new BadRequestException('Pedido no encontrado');
    }

    const comanda = this.comandasRepository.create({
      pedido: pedido,
      observaciones: crearComandaDto.observaciones ?? '',
      estado: EstadoComanda.RECIBIDA,
    });

    const guardada = await this.comandasRepository.save(comanda);

    return this.obtenerPorId(guardada.id);
  }

  // 📄 OBTENER TODOS
  async obtenerTodos(): Promise<Comanda[]> {
    return this.comandasRepository.find({
      relations: {
        pedido: {
          mesa: true,
          platos: true,
        },
      },
    });
  }

  // 🔍 OBTENER POR ID
  async obtenerPorId(id: number): Promise<Comanda> {
    const comanda = await this.comandasRepository.findOne({
      where: { id },
      relations: {
        pedido: {
          mesa: true,
          platos: true,
        },
      },
    });

    if (!comanda) {
      throw new NotFoundException(`Comanda con id ${id} no encontrada`);
    }

    return comanda;
  }

  // 🔁 CAMBIAR ESTADO
  async cambiarEstado(id: number, nuevoEstado: EstadoComanda): Promise<Comanda> {
    const comanda = await this.obtenerPorId(id);

    comanda.estado = nuevoEstado;

    await this.comandasRepository.save(comanda);

    return this.obtenerPorId(id);
  }
}