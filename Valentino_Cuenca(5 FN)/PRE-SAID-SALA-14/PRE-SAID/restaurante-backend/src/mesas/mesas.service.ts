import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EstadoMesa, Mesa } from './entities/mesa.entity';
import { CrearMesaDto } from './dto/crear-mesa.dto';
import { ActualizarMesaDto } from './dto/actualizar-mesa.dto';
import { CambiarEstadoDto } from './dto/cambiar-estado.dto';

@Injectable()
export class MesasService {
  constructor(
    @InjectRepository(Mesa)
    private readonly mesaRepository: Repository<Mesa>,
  ) {}

  async crear(crearMesaDto: CrearMesaDto): Promise<Mesa> {
    const existente = await this.mesaRepository.findOne({
      where: { numero: crearMesaDto.numero },
    });
    if (existente) {
      throw new BadRequestException(
        `Ya existe una mesa con el número ${crearMesaDto.numero}`,
      );
    }
    const mesa = this.mesaRepository.create(crearMesaDto);
    return this.mesaRepository.save(mesa);
  }

  async encontrarTodos(): Promise<Mesa[]> {
    return this.mesaRepository.find({
      order: { numero: 'ASC' },
    });
  }

  async encontrarUno(id: number): Promise<Mesa> {
    const mesa = await this.mesaRepository.findOne({ where: { id } });
    if (!mesa) {
      throw new NotFoundException(`Mesa con id ${id} no encontrada`);
    }
    return mesa;
  }

  async actualizar(
    id: number,
    actualizarMesaDto: ActualizarMesaDto,
  ): Promise<Mesa> {
    const mesa = await this.encontrarUno(id);
    if (
      actualizarMesaDto.numero &&
      actualizarMesaDto.numero !== mesa.numero
    ) {
      const existente = await this.mesaRepository.findOne({
        where: { numero: actualizarMesaDto.numero },
      });
      if (existente) {
        throw new BadRequestException(
          `Ya existe una mesa con el número ${actualizarMesaDto.numero}`,
        );
      }
    }
    Object.assign(mesa, actualizarMesaDto);
    return this.mesaRepository.save(mesa);
  }

  async eliminar(id: number): Promise<void> {
    const mesa = await this.encontrarUno(id);
    await this.mesaRepository.remove(mesa);
  }

  async cambiarEstado(
    id: number,
    cambiarEstadoDto: CambiarEstadoDto,
  ): Promise<Mesa> {
    const mesa = await this.encontrarUno(id);
    mesa.estado = cambiarEstadoDto.estado;
    return this.mesaRepository.save(mesa);
  }
}
