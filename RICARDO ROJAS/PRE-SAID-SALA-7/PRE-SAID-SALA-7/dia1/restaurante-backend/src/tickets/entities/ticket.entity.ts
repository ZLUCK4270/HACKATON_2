import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Mesa } from '../../mesas/entities/mesa.entity';

export enum TicketEstado {
  ABIERTO = 'abierto',
  PAGADO = 'pagado',
}

@Entity('tickets')
export class Ticket {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Mesa, { eager: true })
  @JoinColumn({ name: 'mesaId' })
  mesa!: Mesa;

  @Column()
  mesaId!: number;

  @Column('decimal', { precision: 10, scale: 2 })
  total!: number;

  @Column({ type: 'varchar', nullable: true })
  metodoPago?: string;

  @Column({
    type: 'varchar',
    default: TicketEstado.ABIERTO,
  })
  estado!: TicketEstado;

  @CreateDateColumn()
  createdAt!: Date;
}
