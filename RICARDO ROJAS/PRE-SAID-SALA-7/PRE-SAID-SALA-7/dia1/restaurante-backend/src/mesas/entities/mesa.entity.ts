import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum MesaEstado {
  DISPONIBLE = 'disponible',
  OCUPADA = 'ocupada',
  RESERVADA = 'reservada',
}

@Entity('mesas')
export class Mesa {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  numero!: number;

  @Column()
  capacidad!: number;

  @Column({
    type: 'varchar',
    default: MesaEstado.DISPONIBLE,
  })
  estado!: MesaEstado;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
