import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserRepositoryInterface } from './interfaces/user.repository.interface';
import { BaseRepository } from '@shared/repositories/base.repository';

@Injectable()
export class UserRepository
  extends BaseRepository<User>
  implements UserRepositoryInterface
{
  constructor(@InjectRepository(User) userRepository: Repository<User>) {
    super(userRepository);
  }
}
