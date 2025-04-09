import { Base } from '@shared/entities/base.entity';
import { User } from '../../user/entities/user.entity';
import { Entity, Column, ManyToOne } from 'typeorm';

@Entity({ name: 'blogs' })
export class Blog extends Base {
  @Column({ type: 'varchar', length: 100, nullable: false })
  title: string;

  @Column({ type: 'text', nullable: false })
  content: string;

  @Column({ type: 'simple-array', default: [] })
  tags: string[];

  @ManyToOne(() => User, (user) => user.blogs)
  user: User;
}
