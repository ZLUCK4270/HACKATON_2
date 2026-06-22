import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mesa, MesaEstado } from './entities/mesa.entity';
import { CreateMesaDto } from './dto/create-mesa.dto';
import { UpdateMesaDto } from './dto/update-mesa.dto';

@Injectable()
export class MesasService {
  constructor(
    @InjectRepository(Mesa)
    private readonly mesaRepository: Repository<Mesa>,
  ) {}

  async create(createMesaDto: CreateMesaDto): Promise<Mesa> {
    const mesaExistente = await this.mesaRepository.findOneBy({
      numero: createMesaDto.numero,
    });

    if (mesaExistente) {
      throw new ConflictException(
        `Ya existe una mesa con el número ${createMesaDto.numero}`,
      );
    }

    const nuevaMesa = this.mesaRepository.create(createMesaDto);
    return await this.mesaRepository.save(nuevaMesa);
  }

  async findAll(): Promise<Mesa[]> {
    return await this.mesaRepository.find();
  }

  async findOne(id: number): Promise<Mesa> {
    const mesa = await this.mesaRepository.findOneBy({ id });
    if (!mesa) {
      throw new NotFoundException(`Mesa con ID ${id} no encontrada`);
    }
    return mesa;
  }

  async update(id: number, updateMesaDto: UpdateMesaDto): Promise<Mesa> {
    const mesa = await this.findOne(id);

    if (
      'numero' in updateMesaDto &&
      updateMesaDto.numero &&
      updateMesaDto.numero !== mesa.numero
    ) {
      const mesaExistente = await this.mesaRepository.findOneBy({
        numero: updateMesaDto.numero,
      });

      if (mesaExistente) {
        throw new ConflictException(
          `Ya existe una mesa con el número ${updateMesaDto.numero}`,
        );
      }
    }

    const mesaActualizada = this.mesaRepository.merge(mesa, updateMesaDto);
    return await this.mesaRepository.save(mesaActualizada);
  }

  async remove(id: number): Promise<void> {
    const mesa = await this.findOne(id);
    await this.mesaRepository.remove(mesa);
  }

  async cambiarEstado(id: number, nuevoEstado: MesaEstado): Promise<Mesa> {
    const mesa = await this.findOne(id);
    mesa.estado = nuevoEstado;
    return await this.mesaRepository.save(mesa);
  }
}
