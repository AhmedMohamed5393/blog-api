import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PageOptionsDto } from '@shared/pagination/pageOption.dto';
import { PageMetaDto } from '@shared/pagination/page-meta.dto';
import { AuthTypeEnum } from '@shared/enums/auth-type.enum';
import { AddDto, EditDto } from '../dtos/index.dto';
import { BlogService } from '../blog.service';
import { LoggingService } from '../../logging/logging.service';
import { Blog } from '../entities/blog.entity';
import { BlogRepository } from '../repositories/blog.repository';

describe('BlogService', () => {
  let blogService: BlogService;
  let blogRepository: BlogRepository;
  let loggingService: LoggingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlogService,
        {
          provide: BlogRepository,
          useValue: {
            save: jest.fn(),
            findAndCount: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            softDelete: jest.fn(),
            isExist: jest.fn(),
          },
        },
        {
          provide: LoggingService,
          useValue: {
            createLog: jest.fn(),
          },
        },
      ],
    }).compile();

    blogService = module.get<BlogService>(BlogService);
    blogRepository = module.get<BlogRepository>(BlogRepository);
    loggingService = module.get<LoggingService>(LoggingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(blogService).toBeDefined();
  });

  describe('saveNewBlog', () => {
    it('should save a new blog and create a log', async () => {
      const addDto: AddDto = {
        title: "New blog post",
        content: "Hi everyone",
        tags: ["Welcome_onboard"],
      };

      const user = {
        id: "550e8400-e29b-41d4-a716-446655440044",
        role: AuthTypeEnum.EDITOR,
      };
      const savedBlog = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        ...addDto,
        created_at: new Date(),
      } as Blog;

      jest.spyOn(blogRepository, 'save').mockResolvedValue(savedBlog);
      jest.spyOn(loggingService, 'createLog').mockResolvedValue(undefined);

      const result = await blogService.saveNewBlog(addDto, user);

      expect(blogRepository.save).toHaveBeenCalledWith(expect.any(Blog));
      expect(loggingService.createLog).toHaveBeenCalledWith({
        title: 'Added new blog',
        action: `Added new blog with title "${addDto.title}"`,
        entity: 'Blog',
        user_id: user.id,
        user_type: user.role,
      });
      expect(result).toEqual(savedBlog);
    });
  });

  describe('getBlogs', () => {
    it('should return a paginated list of blogs', async () => {
      const pageOptionsDto = {
        page: 1,
        take: 10,
        search: 'blog',
      } as PageOptionsDto;

      const blogs = [
        {
          id: "550e8400-e29b-41d4-a716-446655440000",
          title: "New blog post",
          content: "Hi everyone",
          tags: ["Welcome_onboard"],
          user: {
            id: "550e8400-e29b-41d4-a716-446655440044",
            email: "ahmedmohamedalex93@gmail.com",
          },
          created_at: new Date(),
        },
      ] as Blog[];

      const total = 1;
      const meta = new PageMetaDto({
        itemsPerPage: blogs.length,
        total,
        pageOptionsDto,
      });

      jest.spyOn(blogRepository, 'findAndCount').mockResolvedValue([blogs, total]);

      const result = await blogService.getBlogs(pageOptionsDto);

      expect(blogRepository.findAndCount).toHaveBeenCalledWith({
        select: {
          id: true,
          title: true,
          content: true,
          tags: true,
          user: { id: true, email: true },
          created_at: true,
        },
        relations: { user: true },
        take: pageOptionsDto.take,
        skip: 0,
        where: [
          { title: expect.any(Object) },
          { content: expect.any(Object) },
          { tags: expect.any(Object) },
        ],
        order: { created_at: 'DESC' },
      });
      expect(result).toEqual({ meta, blogs });
    });
  });

  describe('getBlogById', () => {
    it('should return a blog by ID', async () => {
      const blogId = "550e8400-e29b-41d4-a716-446655440000";
      const blog = {
        id: blogId,
        title: "New blog post",
        content: "Hi everyone",
        tags: ["Welcome_onboard"],
        user: {
          id: "550e8400-e29b-41d4-a716-446655440044",
          email: "ahmedmohamedalex93@gmail.com",
          role: AuthTypeEnum.EDITOR,
        },
        created_at: new Date(),
      } as Blog;

      jest.spyOn(blogRepository, 'findOne').mockResolvedValue(blog);

      const result = await blogService.getBlogById(blogId);

      expect(blogRepository.findOne).toHaveBeenCalledWith({
        select: {
          id: true,
          title: true,
          content: true,
          tags: true,
          user: { id: true, email: true, role: true },
          created_at: true,
        },
        relations: { user: true },
        where: { id: blogId },
      });
      expect(result).toEqual(blog);
    });

    it('should throw NotFoundException if blog is not found', async () => {
      const blogId = "550e8400-e29b-41d4-a716-446655440000";

      jest.spyOn(blogRepository, 'findOne').mockResolvedValue(null);

      await expect(blogService.getBlogById(blogId)).rejects.toThrow(
        new NotFoundException({ message: 'Blog is not found' }),
      );
    });
  });

  describe('editBlog', () => {
    it('should update a blog and create a log', async () => {
      const blogId = "550e8400-e29b-41d4-a716-446655440000";
      const user = {
        id: "550e8400-e29b-41d4-a716-446655440044",
        role: AuthTypeEnum.EDITOR,
      };
      const editDto: EditDto = {
        title: "New blog post",
      };

      const originalBlog = {
        id: blogId,
        title: "Blog post",
        content: "A great phone",
        tags: [],
      } as Blog;

      jest.spyOn(blogRepository, 'findOne').mockResolvedValue(originalBlog);
      jest.spyOn(blogRepository, 'update').mockResolvedValue(undefined);
      jest.spyOn(loggingService, 'createLog').mockResolvedValue(undefined);

      await blogService.editBlog(blogId, editDto, user);

      expect(blogRepository.findOne).toHaveBeenCalledWith({
        where: { id: blogId },
        select: {
          id: true,
          title: true,
          content: true,
          tags: true,
        },
      });
      expect(blogRepository.update).toHaveBeenCalledWith({
        where: { id: blogId },
        data: {
          title: editDto.title || originalBlog.title,
          content: editDto.content || originalBlog.content,
          tags: editDto.tags || originalBlog.tags,
        },
      });
      expect(loggingService.createLog).toHaveBeenCalledWith({
        title: 'Edited blog',
        action: `Edited blog with changes: title changed from "${originalBlog.title}" to "${editDto.title}"`,
        entity: 'Blog',
        user_id: user.id,
        user_type: user.role,
      });
    });

    it('should throw NotFoundException if blog is not found', async () => {
      const blogId = "550e8400-e29b-41d4-a716-446655440001";
      const user = {
        id: "550e8400-e29b-41d4-a716-446655440044",
        role: AuthTypeEnum.EDITOR,
      };
      const editDto: EditDto = {
        title: "New blog post",
      };

      jest.spyOn(blogRepository, 'findOne').mockResolvedValue(null);

      await expect(blogService.editBlog(blogId, editDto, user)).rejects.toThrow(
        new NotFoundException({ message: 'Blog is not found' }),
      );
    });
  });

  describe('deleteBlog', () => {
    it('should soft delete a blog and create a log', async () => {
      const blogId = "550e8400-e29b-41d4-a716-446655440000";
      const user = {
        id: "550e8400-e29b-41d4-a716-446655440044",
        role: AuthTypeEnum.EDITOR,
      };

      jest.spyOn(blogRepository, 'isExist').mockResolvedValue(true);
      jest.spyOn(blogRepository, 'softDelete').mockResolvedValue(undefined);
      jest.spyOn(loggingService, 'createLog').mockResolvedValue(undefined);

      await blogService.deleteBlog(blogId, user);

      expect(blogRepository.isExist).toHaveBeenCalledWith({ id: blogId });
      expect(blogRepository.softDelete).toHaveBeenCalledWith(blogId);
      expect(loggingService.createLog).toHaveBeenCalledWith({
        title: 'Deleted blog',
        action: `Deleted blog with ID: ${blogId}`,
        entity: 'Blog',
        user_id: user.id,
        user_type: user.role,
      });
    });

    it('should throw NotFoundException if blog is not found', async () => {
      const blogId = "550e8400-e29b-41d4-a716-446655440001";
      const user = {
        id: "550e8400-e29b-41d4-a716-446655440044",
        role: AuthTypeEnum.EDITOR,
      };

      jest.spyOn(blogRepository, 'isExist').mockResolvedValue(false);

      await expect(blogService.deleteBlog(blogId, user)).rejects.toThrow(
        new NotFoundException({ message: 'Blog is not found' }),
      );
    });
  });
});
