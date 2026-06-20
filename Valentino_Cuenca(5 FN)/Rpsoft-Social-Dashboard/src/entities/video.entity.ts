import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Video {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  videoId: string;

  @Column()
  channelId: string;

  @Column()
  title: string;

  @Column()
  publishedAt: Date;

  @Column()
  durationSec: number;

  @Column()
  views: number;

  @Column()
  likes: number;

  @Column()
  comments: number;

  @Column({ type: 'date' })
  snapshotDate: string;
}
