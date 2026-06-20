import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('channel_snapshots')
export class ChannelSnapshot {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  channelId: string;

  @Column({ type: 'date' })
  date: string;

  @Column()
  subscribers: number;

  @Column()
  totalViews: number;

  @Column()
  videoCount: number;
}
