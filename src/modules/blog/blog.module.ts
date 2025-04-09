import { Module } from '@nestjs/common';
import { LoggingModule } from '../logging/logging.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogController } from './blog.controller';
import { BlogService } from './blog.service';
import { BlogRepository } from './repositories/blog.repository';

@Module({
  imports: [TypeOrmModule.forFeature([BlogRepository]), LoggingModule],
  controllers: [BlogController],
  providers: [BlogService],
  exports: [BlogService],
})
export class BlogModule {}
