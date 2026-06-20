import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActualizarMesaDto } from './dto/actualizar-mesa.dto';
import { CrearMesaDto } from './dto/crear-mesa.dto';
import { EstadoMesa } from './mesa-estado.enum';
import { Mesa } from './mesa.entity';

@Injectable()
export class MesasService {
  constructor(
    @InjectRepository(Mesa)
    private readonly mesasRepository: Repository<Mesa>,
  ) {}

  async crear(crearMesaDto: CrearMesaDto): Promise<Mesa> {
    await this.validarNumeroUnico(crearMesaDto.numero);
    const mesa = this.mesasRepository.create(crearMesaDto);
    return this.mesasRepository.save(mesa);
  }

  async obtenerTodos(): Promise<Mesa[]> {
    return this.mesasRepository.find();
  }

  async obtenerPorId(id: number): Promise<Mesa> {
    const mesa = await this.mesasRepository.findOne({ where: { id } });
    if (!mesa) {
      throw new NotFoundException(`Mesa con id ${id} no encontrada`);
    }
    return mesa;
  }

  async actualizar(
    id: number,
    actualizarMesaDto: ActualizarMesaDto,
  ): Promise<Mesa> {
    const mesa = await this.obtenerPorId(id);
    if (actualizarMesaDto.numero !== undefined) {
      await this.validarNumeroUnico(actualizarMesaDto.numero, id);
    }
    Object.assign(mesa, actualizarMesaDto);
    return this.mesasRepository.save(mesa);
  }

  async eliminar(id: number): Promise<void> {
    const mesa = await this.obtenerPorId(id);
    await this.mesasRepository.remove(mesa);
  }

  async cambiarEstado(id: number, nuevoEstado: EstadoMesa): Promise<Mesa> {
    const mesa = await this.obtenerPorId(id);
    mesa.estado = nuevoEstado;
    return this.mesasRepository.save(mesa);
  }

  private async validarNumeroUnico(
    numero: number,
    excluirId?: number,
  ): Promise<void> {
    const existente = await this.mesasRepository.findOne({
      where: { numero },
    });
    if (existente && existente.id !== excluirId) {
      throw new ConflictException(
        `Ya existe una mesa con el número ${numero}`,
      );
    }
  }
}
