import { Pedido } from '../../pedidos/entities/pedido.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum EstadoMesa {
  DISPONIBLE = 'disponible',
  OCUPADA = 'ocupada',
  RESERVADA = 'reservada',
}

@Entity('mesas')
export class Mesa {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  numero: number;

  @Column()
  capacidad: number;

  @Column({
    type: 'text',
    default: EstadoMesa.DISPONIBLE,
  })
  estado: EstadoMesa;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Pedido, (pedido) => pedido.mesa)
  pedidos: Pedido[];
}
