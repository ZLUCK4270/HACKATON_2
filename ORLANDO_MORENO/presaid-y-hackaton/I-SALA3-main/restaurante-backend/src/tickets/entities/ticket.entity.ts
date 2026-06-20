import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Mesa } from '../../mesas/entities/mesa.entity';
import { Pedido } from '../../pedidos/entities/pedido.entity';

export enum MetodoPago {
  EFECTIVO = 'efectivo',
  TARJETA = 'tarjeta',
}

export enum EstadoTicket {
  ABIERTO = 'abierto',
  PAGADO = 'pagado',
}

@Entity('tickets')
export class Ticket {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total: number;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  metodoPago: MetodoPago;

  @Column({
    type: 'varchar',
    default: EstadoTicket.ABIERTO,
  })
  estado: EstadoTicket;

  @ManyToOne(() => Mesa, { eager: false, nullable: false })
  @JoinColumn({ name: 'mesaId' })
  mesa: Mesa;

  @Column()
  mesaId: number;

  @ManyToMany(() => Pedido, { eager: false })
  @JoinTable({
    name: 'ticket_pedidos',
    joinColumn: { name: 'ticketId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'pedidoId', referencedColumnName: 'id' },
  })
  pedidos: Pedido[];

  @CreateDateColumn()
  createdAt: Date;
}
