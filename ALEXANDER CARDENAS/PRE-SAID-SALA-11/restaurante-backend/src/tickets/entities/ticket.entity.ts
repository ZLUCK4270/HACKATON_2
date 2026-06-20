import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Mesa } from '../../mesas/entities/mesa.entity';
import { EstadoTicket } from './estado-ticket.enum';
import { MetodoPago } from './metodo-pago.enum';
import { Pedido } from '../../pedidos/entities/pedido.entity';

@Entity('tickets')
export class Ticket {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ type: () => Mesa })
  @ManyToOne(() => Mesa, { nullable: false })
  @JoinColumn({ name: 'mesaId' })
  mesa: Mesa;

  @ApiProperty({ example: 120.5 })
  @Column('decimal', { precision: 10, scale: 2 })
  total: number;

  @ApiProperty({
    enum: MetodoPago,
    example: MetodoPago.EFECTIVO,
    required: false,
  })
  @Column({
    type: 'text',
    enum: MetodoPago,
    nullable: true,
  })
  metodoPago: MetodoPago;

  @ApiProperty({ enum: EstadoTicket, example: EstadoTicket.ABIERTO })
  @Column({
    type: 'text',
    enum: EstadoTicket,
    default: EstadoTicket.ABIERTO,
  })
  estado: EstadoTicket;

  @ApiProperty({ type: () => Pedido, isArray: true })
  @OneToMany(() => Pedido, (pedido) => pedido.ticket)
  pedidos: Pedido[];

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;
}

