import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Mesa } from '../../mesas/entities/mesa.entity';
import { Plato } from '../../platos/entities/plato.entity';
import { Comanda } from '../../comandas/entities/comanda.entity';

export enum EstadoPedido {
  PENDIENTE = 'pendiente',
  EN_PREPARACION = 'en_preparacion',
  LISTO = 'listo',
  ENTREGADO = 'entregado',
}

@Entity('pedidos')
export class Pedido {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', default: EstadoPedido.PENDIENTE })
  estado: EstadoPedido;

  @Column('decimal', { precision: 10, scale: 2, default: 0, transformer: { to: (v: number) => v, from: (v: string) => parseFloat(v) } })
  total: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Mesa, (mesa) => mesa.pedidos)
  @JoinColumn({ name: 'mesa_id' })
  mesa: Mesa;

  @ManyToMany(() => Plato, (plato) => plato.pedidos)
  @JoinTable({
    name: 'pedido_platos',
    joinColumn: { name: 'pedido_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'plato_id', referencedColumnName: 'id' },
  })
  platos: Plato[];

  @OneToMany(() => Comanda, (comanda) => comanda.pedido)
  comandas: Comanda[];
}
