import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActualizarPlatoDto } from './dto/actualizar-plato.dto';
import { CrearPlatoDto } from './dto/crear-plato.dto';
import { Plato } from './entities/plato.entity';

@Injectable()
export class PlatosService {
  constructor(
    @InjectRepository(Plato)
    private readonly platosRepository: Repository<Plato>,
  ) {}

  async crear(crearPlatoDto: CrearPlatoDto): Promise<Plato> {
    const plato = this.platosRepository.create({
      ...crearPlatoDto,
      disponible: crearPlatoDto.disponible ?? true,
    });
    return this.platosRepository.save(plato);
  }

  async encontrarTodos(): Promise<Plato[]> {
    return this.platosRepository.find();
  }

  async encontrarUno(id: number): Promise<Plato> {
    const plato = await this.platosRepository.findOne({ where: { id } });
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
    return this.platosRepository.save(plato);
  }

  async eliminar(id: number): Promise<void> {
    const plato = await this.encontrarUno(id);
    await this.platosRepository.remove(plato);
  }
}
