import { BaseRepositoryInterface } from '@shared/repositories/interfaces/base.repository.interface';
import { User } from '../../entities/user.entity';

export type UserRepositoryInterface = BaseRepositoryInterface<User>;
