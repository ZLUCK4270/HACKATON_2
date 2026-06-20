import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('platos')
export class Plato {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'Pizza margarita', maxLength: 100 })
  @Column({ length: 100 })
  nombre: string;

  @ApiProperty({ example: 12.5 })
  @Column('decimal', { precision: 10, scale: 2 })
  precio: number;

  @ApiProperty({ example: true })
  @Column({ default: true })
  disponible: boolean;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
