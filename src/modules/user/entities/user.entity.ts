import { Column, Entity, OneToMany } from 'typeorm';
import { Exclude } from 'class-transformer';
import { AuthTypeEnum } from '@shared/enums/index.enum';
import { Base } from '@shared/entities/base.entity';
import { Blog } from '../../blog/entities/blog.entity';

@Entity({ name: 'users' })
export class User extends Base {
  @Column({ type: 'enum', enum: AuthTypeEnum, default: AuthTypeEnum.EDITOR })
  role: string;

  @Exclude()
  @Column({ type: 'varchar', length: 100, nullable: true })
  password: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  email: string;

  @OneToMany(() => Blog, (blog) => blog.user, { cascade: true })
  blogs: Blog[];
}
