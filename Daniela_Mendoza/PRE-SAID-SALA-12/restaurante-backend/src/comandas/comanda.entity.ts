import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Pedido } from '../pedidos/pedido.entity';
import { EstadoComanda } from './comanda-estado.enum';

@Entity('comandas')
export class Comanda {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Pedido, { eager: true })
  @JoinColumn({ name: 'pedidoId' })
  pedido: Pedido;

  @Column({ type: 'text', default: EstadoComanda.RECIBIDA })
  estado: EstadoComanda;

  @Column({ type: 'text', nullable: true })
  observaciones: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}