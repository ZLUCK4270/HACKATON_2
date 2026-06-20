import { Pedido } from '../../pedidos/entities/pedido.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum EstadoComanda {
  RECIBIDA = 'recibida',
  EN_PREPARACION = 'en_preparacion',
  LISTA = 'lista',
}

@Entity('comandas')
export class Comanda {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Pedido, (pedido) => pedido.comandas)
  @JoinColumn({ name: 'pedido_id' })
  pedido: Pedido;

  @Column({ type: 'text', default: EstadoComanda.RECIBIDA })
  estado: EstadoComanda;

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
