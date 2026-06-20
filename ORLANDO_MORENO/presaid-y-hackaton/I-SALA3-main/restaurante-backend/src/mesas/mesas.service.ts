import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mesa, EstadoMesa } from './entities/mesa.entity';
import { CreateMesaDto } from './dto/create-mesa.dto';
import { UpdateMesaDto } from './dto/update-mesa.dto';

@Injectable()
export class MesasService {
  constructor(
    @InjectRepository(Mesa)
    private readonly mesaRepository: Repository<Mesa>,
  ) {}

  async create(createMesaDto: CreateMesaDto) {
    const existe = await this.mesaRepository.findOne({ where: { numero: createMesaDto.numero } });
    if (existe) {
      throw new BadRequestException(`La mesa número ${createMesaDto.numero} ya existe`);
    }
    const nuevaMesa = this.mesaRepository.create(createMesaDto);
    return await this.mesaRepository.save(nuevaMesa);
  }

  async findAll() {
    return await this.mesaRepository.find();
  }

  async findOne(id: number) {
    const mesa = await this.mesaRepository.findOne({ where: { id } });
    if (!mesa) throw new NotFoundException(`Mesa con ID ${id} no encontrada`);
    return mesa;
  }

  async update(id: number, updateMesaDto: UpdateMesaDto) {
    const mesa = await this.findOne(id);
    if (updateMesaDto.numero && updateMesaDto.numero !== mesa.numero) {
      const existe = await this.mesaRepository.findOne({ where: { numero: updateMesaDto.numero } });
      if (existe) throw new BadRequestException(`La mesa número ${updateMesaDto.numero} ya existe`);
    }
    Object.assign(mesa, updateMesaDto);
    return await this.mesaRepository.save(mesa);
  }

  async cambiarEstado(id: number, nuevoEstado: EstadoMesa) {
    const mesa = await this.findOne(id);
    mesa.estado = nuevoEstado;
    return await this.mesaRepository.save(mesa);
  }

  async remove(id: number) {
    const mesa = await this.findOne(id);
    return await this.mesaRepository.remove(mesa);
  }
}
