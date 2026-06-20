import { Mesa } from '../../mesas/entities/mesa.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum EstadoTicket {
  ABIERTO = 'abierto',
  PAGADO = 'pagado',
}

export enum MetodoPago {
  EFECTIVO = 'efectivo',
  TARJETA = 'tarjeta',
}

@Entity('tickets')
export class Ticket {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Mesa)
  @JoinColumn({ name: 'mesa_id' })
  mesa: Mesa;

  @Column('decimal', { precision: 10, scale: 2, default: 0, transformer: { to: (v: number) => v, from: (v: string) => parseFloat(v) } })
  total: number;

  @Column({ type: 'text', nullable: true })
  metodoPago: MetodoPago;

  @Column({ type: 'text', default: EstadoTicket.ABIERTO })
  estado: EstadoTicket;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
