import { ApiProperty } from '@nestjs/swagger';
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
import { Mesa } from '../../mesas/entities/mesa.entity';
import { Plato } from '../../platos/entities/plato.entity';
import { EstadoPedido } from './estado-pedido.enum';
import { Ticket } from '../../tickets/entities/ticket.entity';

@Entity('pedidos')
export class Pedido {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ type: () => Mesa })
  @ManyToOne(() => Mesa, { nullable: false })
  @JoinColumn({ name: 'mesaId' })
  mesa: Mesa;

  @ApiProperty({ type: () => Plato, isArray: true })
  @ManyToMany(() => Plato)
  @JoinTable({ name: 'pedido_platos' })
  platos: Plato[];

  @ApiProperty({ enum: EstadoPedido, example: EstadoPedido.PENDIENTE })
  @Column({
    type: 'text',
    enum: EstadoPedido,
    default: EstadoPedido.PENDIENTE,
  })
  estado: EstadoPedido;

  @ApiProperty({ example: 25.5 })
  @Column('decimal', { precision: 10, scale: 2 })
  total: number;

  @ApiProperty({ type: () => Ticket, required: false })
  @ManyToOne(() => Ticket, (ticket) => ticket.pedidos, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'ticketId' })
  ticket: Ticket;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}

