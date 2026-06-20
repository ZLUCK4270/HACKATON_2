import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Pedido } from '../../pedidos/entities/pedido.entity';

export enum EstadoComanda {
  RECIBIDA = 'recibida',
  EN_PREPARACION = 'en_preparacion',
  LISTA = 'lista',
}

@Entity('comandas')
export class Comanda {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    default: EstadoComanda.RECIBIDA,
  })
  estado: EstadoComanda;

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @ManyToOne(() => Pedido, { eager: false, nullable: false })
  @JoinColumn({ name: 'pedidoId' })
  pedido: Pedido;

  @Column()
  pedidoId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
