import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EstadoMesa } from './estado-mesa.enum';

@Entity('mesas')
export class Mesa {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 5 })
  @Column({ unique: true })
  numero: number;

  @ApiProperty({ example: 4 })
  @Column()
  capacidad: number;

  @ApiProperty({ enum: EstadoMesa, example: EstadoMesa.DISPONIBLE })
  @Column({
    type: 'text',
    enum: EstadoMesa,
    default: EstadoMesa.DISPONIBLE,
  })
  estado: EstadoMesa;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
