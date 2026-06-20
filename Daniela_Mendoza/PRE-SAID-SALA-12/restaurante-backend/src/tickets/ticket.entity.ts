import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinColumn,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Mesa } from '../mesas/mesa.entity';
import { Pedido } from '../pedidos/pedido.entity';
import { EstadoTicket } from './ticket-estado.enum';
import { MetodoPago } from './metodo-pago.enum';

@Entity('tickets')
export class Ticket {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Mesa, (mesa) => mesa.tickets, { eager: true })
  @JoinColumn({ name: 'mesa_id' })
  mesa: Mesa;

  @ManyToMany(() => Pedido)
  @JoinTable({
    name: 'ticket_pedidos',
    joinColumn: { name: 'ticketId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'pedidoId', referencedColumnName: 'id' },
  })
  pedidos: Pedido[];

  @Column({ type: 'text', default: EstadoTicket.ABIERTO })
  estado: EstadoTicket;

  @Column({ type: 'text', nullable: true })
  metodoPago: MetodoPago | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}