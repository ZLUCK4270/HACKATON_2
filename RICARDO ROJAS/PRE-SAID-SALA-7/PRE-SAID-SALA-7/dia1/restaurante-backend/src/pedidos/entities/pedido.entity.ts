import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinColumn,
  JoinTable,
} from 'typeorm';
import { Mesa } from '../../mesas/entities/mesa.entity';
import { Plato } from '../../platos/entities/plato.entity';

export enum PedidoEstado {
  PENDIENTE = 'pendiente',
  EN_PREPARACION = 'en_preparacion',
  LISTO = 'listo',
  ENTREGADO = 'entregado',
}

@Entity('pedidos')
export class Pedido {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Mesa, { eager: true })
  @JoinColumn({ name: 'mesaId' })
  mesa!: Mesa;

  @Column()
  mesaId!: number;

  @ManyToMany(() => Plato, { eager: true })
  @JoinTable({
    name: 'pedido_platos',
    joinColumn: { name: 'pedidoId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'platoId', referencedColumnName: 'id' },
  })
  platos!: Plato[];

  @Column({
    type: 'varchar',
    default: PedidoEstado.PENDIENTE,
  })
  estado!: PedidoEstado;

  @Column('decimal', { precision: 10, scale: 2 })
  total!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
