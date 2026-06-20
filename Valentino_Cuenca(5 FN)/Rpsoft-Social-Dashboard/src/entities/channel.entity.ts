import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class Channel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  channelId: string;

  @Column()
  title: string;

  @Column({ default: 'Default' })
  brand: string;

  @Column({ nullable: true })
  thumbnailUrl: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ nullable: true })
  publishedAt: string;

  @CreateDateColumn()
  createdAt: Date;
}
