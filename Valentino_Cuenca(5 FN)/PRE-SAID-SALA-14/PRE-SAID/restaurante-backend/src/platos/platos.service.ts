import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plato } from './entities/plato.entity';
import { CrearPlatoDto } from './dto/crear-plato.dto';
import { ActualizarPlatoDto } from './dto/actualizar-plato.dto';

@Injectable()
export class PlatosService {
  constructor(
    @InjectRepository(Plato)
    private readonly platoRepository: Repository<Plato>,
  ) {}

  async crear(crearPlatoDto: CrearPlatoDto): Promise<Plato> {
    const plato = this.platoRepository.create(crearPlatoDto);
    return this.platoRepository.save(plato);
  }

  async encontrarTodos(): Promise<Plato[]> {
    return this.platoRepository.find({
      order: { nombre: 'ASC' },
    });
  }

  async encontrarUno(id: number): Promise<Plato> {
    const plato = await this.platoRepository.findOne({ where: { id } });
    if (!plato) {
      throw new NotFoundException(`Plato con id ${id} no encontrado`);
    }
    return plato;
  }

  async actualizar(
    id: number,
    actualizarPlatoDto: ActualizarPlatoDto,
  ): Promise<Plato> {
    const plato = await this.encontrarUno(id);
    Object.assign(plato, actualizarPlatoDto);
    return this.platoRepository.save(plato);
  }

  async eliminar(id: number): Promise<void> {
    const plato = await this.encontrarUno(id);
    await this.platoRepository.remove(plato);
  }
}
