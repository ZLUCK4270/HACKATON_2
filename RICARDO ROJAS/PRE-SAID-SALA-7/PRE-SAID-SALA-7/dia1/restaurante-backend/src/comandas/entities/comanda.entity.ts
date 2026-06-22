import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { Pedido } from '../../pedidos/entities/pedido.entity';

export enum ComandaEstado {
  RECIBIDA = 'recibida',
  EN_PREPARACION = 'en_preparacion',
  LISTA = 'lista',
}

@Entity('comandas')
export class Comanda {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Pedido, { eager: true })
  @JoinColumn({ name: 'pedidoId' })
  pedido!: Pedido;

  @Column()
  pedidoId!: number;

  @Column({
    type: 'varchar',
    default: ComandaEstado.RECIBIDA,
  })
  estado!: ComandaEstado;

  @Column({
    nullable: true,
  })
  observaciones?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}