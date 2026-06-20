import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Mesa } from '../mesas/mesa.entity';
import { Plato } from '../platos/plato.entity';
import { EstadoPedido } from './pedido-estado.enum';

@Entity('pedidos')
export class Pedido {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Mesa)
  @JoinColumn({ name: 'mesaId' })
  mesa: Mesa;

  @ManyToMany(() => Plato)
  @JoinTable({
    name: 'pedido_platos',
    joinColumn: { name: 'pedidoId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'platoId', referencedColumnName: 'id' },
  })
  platos: Plato[];

  @Column({
    type: 'text',
    enum: EstadoPedido,
    default: EstadoPedido.PENDIENTE,
  })
  estado: EstadoPedido;

  @Column('decimal', { precision: 10, scale: 2 })
  total: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
