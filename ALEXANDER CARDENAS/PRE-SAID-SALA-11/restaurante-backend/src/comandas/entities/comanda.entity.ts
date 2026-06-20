import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Pedido } from '../../pedidos/entities/pedido.entity';
import { EstadoComanda } from './estado-comanda.enum';

@Entity('comandas')
export class Comanda {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ type: () => Pedido })
  @ManyToOne(() => Pedido, { nullable: false })
  @JoinColumn({ name: 'pedidoId' })
  pedido: Pedido;

  @ApiProperty({ enum: EstadoComanda, example: EstadoComanda.RECIBIDA })
  @Column({
    type: 'text',
    enum: EstadoComanda,
    default: EstadoComanda.RECIBIDA,
  })
  estado: EstadoComanda;

  @ApiProperty({ example: 'Sin sal', required: false })
  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
