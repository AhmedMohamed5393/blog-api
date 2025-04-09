// log.entity.ts
import { Base } from '@shared/entities/base.entity';
import { AuthTypeEnum } from '@shared/enums/auth-type.enum';
import { Entity, Column } from 'typeorm';

@Entity({ name: 'logs' })
export class Log extends Base {
  @Column()
  title: string;

  @Column()
  action: string;

  @Column()
  entity: string;

  @Column()
  user_id: string;

  @Column({ type: 'enum', enum: AuthTypeEnum, nullable: true })
  user_type: AuthTypeEnum;
}
