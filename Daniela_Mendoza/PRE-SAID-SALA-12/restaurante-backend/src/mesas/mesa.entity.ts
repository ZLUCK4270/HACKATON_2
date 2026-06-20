import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

import { EstadoMesa } from './mesa-estado.enum';
import { Ticket } from '../tickets/ticket.entity';

@Entity('mesas')
export class Mesa {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  numero: number;

  @Column()
  capacidad: number;

  // 🧾 RELACIÓN CON TICKETS
  @OneToMany(() => Ticket, (ticket) => ticket.mesa)
  tickets: Ticket[];

  @Column({
    type: 'enum',
    enum: EstadoMesa,
    default: EstadoMesa.DISPONIBLE,
  })
  estado: EstadoMesa;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}