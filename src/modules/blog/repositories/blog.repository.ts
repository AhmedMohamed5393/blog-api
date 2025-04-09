import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Blog } from '../entities/blog.entity';
import { BlogRepositoryInterface } from './interfaces/blog.repository.interface';
import { BaseRepository } from '@shared/repositories/base.repository';

@Injectable()
export class BlogRepository
  extends BaseRepository<Blog>
  implements BlogRepositoryInterface
{
  constructor(@InjectRepository(Blog) blogRepository: Repository<Blog>) {
    super(blogRepository);
  }
}
