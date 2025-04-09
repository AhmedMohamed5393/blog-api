import { Test, TestingModule } from '@nestjs/testing';
import { BlogController } from '../blog.controller';
import { BlogService } from '../blog.service';
import { SuccessClass } from '@shared/classes/success.class';
import { AddDto, EditDto } from '../dtos/index.dto';
import { PageOptionsDto } from '@shared/pagination/pageOption.dto';
import { AuthGuard, RolesGuard } from '@shared/guards/index.guard';
import { AuthTypeEnum } from '@shared/enums/index.enum';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PageMetaDto } from '@shared/pagination/page-meta.dto';
import { Blog } from '../entities/blog.entity';

describe('BlogController', () => {
  let blogController: BlogController;
  let blogService: BlogService;

  const mockAuthGuard = {
    canActivate: (context: ExecutionContext) => {
      const req = context.switchToHttp().getRequest();
      req.user = { id: '550e8400-e29b-41d4-a716-446655440044', role: AuthTypeEnum.EDITOR }; // Simulate authenticated user
      return true;
    },
  };

  const mockRolesGuard = {
    canActivate: (context: ExecutionContext) => {
      const requiredRoles = [AuthTypeEnum.ADMIN]; // Simulate required roles
      const req = context.switchToHttp().getRequest();
      if (!requiredRoles.includes(req.user.role)) {
        throw new ForbiddenException('Forbidden resource');
      }
      return true;
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BlogController],
      providers: [
        {
          provide: BlogService,
          useValue: {
            saveNewBlog: jest.fn(),
            getBlogs: jest.fn(),
            getBlogById: jest.fn(),
            editBlog: jest.fn(),
            deleteBlog: jest.fn(),
          },
        },
        Reflector,
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    blogController = module.get<BlogController>(BlogController);
    blogService = module.get<BlogService>(BlogService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(blogController).toBeDefined();
  });

  describe('addBlog', () => {
    it('should create a new blog and return a success response', async () => {
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

      jest.spyOn(blogService, 'saveNewBlog').mockResolvedValue(savedBlog);

      const result = await blogController.addBlog(addDto, user);

      expect(blogService.saveNewBlog).toHaveBeenCalledWith(addDto, user);
      expect(result).toEqual(
        new SuccessClass(savedBlog, 'blog is created successfully'),
      );
    });
  });

  describe('getBlogs', () => {
    it('should return a paginated list of blogs', async () => {
      const pageOptionsDto = {
        page: 1,
        take: 10,
        search: 'Samsung',
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

      const meta = {
        itemsPerPage: blogs.length,
        total: 1,
        pageOptionsDto,
      } as unknown as PageMetaDto;

      jest.spyOn(blogService, 'getBlogs').mockResolvedValue({ meta, blogs });

      const result = await blogController.getBlogs(pageOptionsDto);

      expect(blogService.getBlogs).toHaveBeenCalledWith(pageOptionsDto);
      expect(result).toEqual(new SuccessClass({ meta, blogs }));
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

      jest.spyOn(blogService, 'getBlogById').mockResolvedValue(blog);

      const result = await blogController.getBlogById(blogId);

      expect(blogService.getBlogById).toHaveBeenCalledWith(blogId);
      expect(result).toEqual(new SuccessClass(blog));
    });
  });

  describe('editBlog', () => {
    it('should update a blog and return a success response', async () => {
      const blogId = "550e8400-e29b-41d4-a716-446655440000";
      const user = {
        id: "550e8400-e29b-41d4-a716-446655440044",
        role: AuthTypeEnum.EDITOR,
      };
      const editDto: EditDto = {
        title: "New blog post",
      };

      jest.spyOn(blogService, 'editBlog').mockResolvedValue(undefined);

      const result = await blogController.editBlog(blogId, editDto, user);

      expect(blogService.editBlog).toHaveBeenCalledWith(blogId, editDto, user);
      expect(result).toEqual(
        new SuccessClass({ id: blogId }, 'blog is updated successfully'),
      );
    });
  });

  describe('deleteBlog', () => {
    it('should delete a blog and return a success response', async () => {
      const blogId = "550e8400-e29b-41d4-a716-446655440000";
      const user = {
        id: "550e8400-e29b-41d4-a716-446655440044",
        role: AuthTypeEnum.EDITOR,
      };

      jest.spyOn(blogService, 'deleteBlog').mockResolvedValue(undefined);

      const result = await blogController.deleteBlog(blogId, user);

      expect(blogService.deleteBlog).toHaveBeenCalledWith(blogId, user);
      expect(result).toEqual(new SuccessClass({}, 'blog is deleted successfully'));
    });
  });
});
