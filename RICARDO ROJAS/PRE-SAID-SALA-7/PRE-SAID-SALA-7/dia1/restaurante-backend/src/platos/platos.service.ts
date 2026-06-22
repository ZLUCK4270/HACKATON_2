import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plato } from './entities/plato.entity';
import { CreatePlatoDto } from './dto/create-plato.dto';
import { UpdatePlatoDto } from './dto/update-plato.dto';

@Injectable()
export class PlatosService {
  constructor(
    @InjectRepository(Plato)
    private readonly platoRepository: Repository<Plato>,
  ) {}

  async create(createPlatoDto: CreatePlatoDto): Promise<Plato> {
    const nuevoPlato = this.platoRepository.create(createPlatoDto);
    return await this.platoRepository.save(nuevoPlato);
  }

  async findAll(): Promise<Plato[]> {
    return await this.platoRepository.find();
  }

  async findOne(id: number): Promise<Plato> {
    const plato = await this.platoRepository.findOneBy({ id });
    if (!plato) {
      throw new NotFoundException(`Plato con ID ${id} no encontrado`);
    }
    return plato;
  }

  async update(id: number, updatePlatoDto: UpdatePlatoDto): Promise<Plato> {
    const plato = await this.findOne(id);
    const platoActualizado = this.platoRepository.merge(plato, updatePlatoDto);
    return await this.platoRepository.save(platoActualizado);
  }

  async remove(id: number): Promise<void> {
    const plato = await this.findOne(id);
    await this.platoRepository.remove(plato);
  }
}
