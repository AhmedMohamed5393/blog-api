import { Injectable, NotFoundException } from '@nestjs/common';
import { PageOptionsDto } from '@shared/pagination/pageOption.dto';
import { PageMetaDto } from '@shared/pagination/page-meta.dto';
import { ILike } from 'typeorm';
import { AddDto, EditDto } from './dtos/index.dto';
import { LoggingService } from '../logging/logging.service';
import { AuthTypeEnum } from '@shared/enums/auth-type.enum';
import { Blog } from './entities/blog.entity';
import { BlogRepository } from './repositories/blog.repository';
import { User } from '../user/entities/user.entity';
import { AuthenticatedUserInterface } from '@shared/interfaces/index.interface';

@Injectable()
export class BlogService {
  constructor(
    private readonly blogRepository: BlogRepository,
    private readonly loggingService: LoggingService,
  ) {}

  async saveNewBlog(
    blogDto: AddDto,
    user: AuthenticatedUserInterface,
  ): Promise<Blog> {
    const newBlog = new Blog();
    newBlog.title = blogDto.title;
    newBlog.content = blogDto.content;
    newBlog.tags = blogDto.tags;
    newBlog.user = { id: user.id } as User;

    const blog = await this.blogRepository.save(newBlog);

    await this.loggingService.createLog({
      title: 'Added new blog',
      action: `Added new blog with title "${blog.title}"`,
      entity: 'Blog',
      user_id: user.id,
      user_type: user.role,
    });

    return blog;
  }

  async getBlogs(pageOptionsDto: PageOptionsDto) {
    const { page, take, search } = pageOptionsDto;
    const skip = (page - 1) * take || 0;

    const where = search
      ? [
          { title: ILike(`%${pageOptionsDto.search}%`) },
          { content: ILike(`%${pageOptionsDto.search}%`) },
          { tags: ILike(`%${pageOptionsDto.search}%`) },
        ]
      : {};

    const [blogs, total] = await this.blogRepository.findAndCount({
      select: {
        id: true,
        title: true,
        content: true,
        tags: true,
        user: { id: true, email: true },
        created_at: true,
      },
      relations: { user: true },
      take: take,
      skip: skip,
      where: where,
      order: { created_at: 'DESC' },
    });

    const meta = new PageMetaDto({
      itemsPerPage: blogs.length,
      total: total,
      pageOptionsDto,
    });

    return { meta, blogs };
  }

  async getBlogById(id: string): Promise<Blog> {
    const where = { id };

    const blog = await this.blogRepository.findOne({
      select: {
        id: true,
        title: true,
        content: true,
        tags: true,
        user: { id: true, email: true, role: true },
        created_at: true,
      },
      relations: { user: true },
      where: where,
    });
    if (!blog) {
      throw new NotFoundException({ message: 'Blog is not found' });
    }

    return blog;
  }

  async editBlog(
    id: string,
    blogToEdit: EditDto,
    user: AuthenticatedUserInterface,
  ): Promise<void> {
    const { title, content, tags } = blogToEdit;
    const blog = await this.blogRepository.findOne({
      where: { id },
      select: {
        id: true,
        title: true,
        content: true,
        tags: true,
      },
    });
    if (!blog) {
      throw new NotFoundException({ message: 'Blog is not found' });
    }

    await this.blogRepository.update({
      where: { id },
      data: {
        title: title || blog.title,
        content: content || blog.content,
        tags: tags || blog.tags,
      },
    });

    const changes = this.getChanges(blog, blogToEdit);
    if (changes) {
      await this.loggingService.createLog({
        title: 'Edited blog',
        action: `Edited blog with changes: ${changes}`,
        entity: 'Blog',
        user_id: user.id,
        user_type: user.role,
      });
    }
  }

  async deleteBlog(id: string, user: AuthenticatedUserInterface): Promise<void> {
    const where = { id };

    const blog = await this.blogRepository.isExist(where);
    if (!blog) {
      throw new NotFoundException({ message: 'Blog is not found' });
    }

    await this.blogRepository.softDelete(id);
    await this.loggingService.createLog({
      title: 'Deleted blog',
      action: `Deleted blog with ID: ${id}`,
      entity: 'Blog',
      user_id: user.id,
      user_type: user.role,
    });
  }

  private getChanges(original: Blog, updated: EditDto): string {
    const changes: string[] = [];

    if (updated.title && original.title !== updated.title) {
      changes.push(`title changed from "${original.title}" to "${updated.title}"`);
    }
    if (updated.content && original.content !== updated.content) {
      changes.push(`content changed from "${original.content}" to "${updated.content}"`);
    }

    return changes.join(', ');
  }
}
