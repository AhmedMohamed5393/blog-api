import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException, INestApplication, NotFoundException } from '@nestjs/common';
import * as request from 'supertest';
import { BlogController } from '../blog.controller';
import { BlogService } from '../blog.service';
import { AddDto, EditDto } from '../dtos/index.dto';
import { PageOptionsDto } from '@shared/pagination/pageOption.dto';
import { AuthGuard, RolesGuard } from '@shared/guards/index.guard';
import { AuthTypeEnum } from '@shared/enums/index.enum';
import { Reflector } from '@nestjs/core';
import { SuccessClass } from '@shared/classes/success.class';
import { PageMetaDto } from '@shared/pagination/page-meta.dto';
import { Blog } from '../entities/blog.entity';

describe('BlogController (e2e)', () => {
  let app: INestApplication;
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
      const requiredRoles = [AuthTypeEnum.ADMIN, AuthTypeEnum.EDITOR]; // Simulate required roles
      const req = context.switchToHttp().getRequest();
      if (!requiredRoles.includes(req.user.role as AuthTypeEnum)) {
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

    app = module.createNestApplication();
    await app.init();

    blogService = module.get<BlogService>(BlogService);
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /blogs', () => {
    it('should create a new blog and return a success response', async () => {
      const addDto: AddDto = {
        title: "New blog post",
        content: "Hi everyone",
        tags: ["Welcome_onboard"],
      };

      const savedBlog = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        ...addDto,
      } as Blog;

      jest.spyOn(blogService, 'saveNewBlog').mockResolvedValue(savedBlog);

      const response = await request(app.getHttpServer())
        .post('/blogs')
        .send(addDto)
        .expect(201);

      expect(response.body).toEqual(
        new SuccessClass(savedBlog, 'blog is created successfully'),
      );
    });
  });

  describe('GET /blogs', () => {
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
            role: AuthTypeEnum.EDITOR,
          },
          created_at: new Date().toISOString(),
        },
      ] as any[];

      const meta = {
        itemsPerPage: blogs.length,
        total: 1,
        pageOptionsDto,
      } as unknown as PageMetaDto;

      jest.spyOn(blogService, 'getBlogs').mockResolvedValue({ meta, blogs });

      const response = await request(app.getHttpServer())
        .get('/blogs')
        .query(pageOptionsDto)
        .expect(200);

      expect(response.body).toEqual(new SuccessClass({ meta, blogs }));
    });
  });

  describe('GET /blogs/:id', () => {
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
        created_at: new Date().toISOString(),
      } as any as Blog;

      jest.spyOn(blogService, 'getBlogById').mockResolvedValue(blog);

      const response = await request(app.getHttpServer())
        .get(`/blogs/${blogId}`)
        .expect(200);

      expect(response.body).toEqual(new SuccessClass(blog));
    });

    it('should return 404 if blog is not found', async () => {
      const blogId = "550e8400-e29b-41d4-a716-446655440001";

      jest.spyOn(blogService, 'getBlogById').mockImplementationOnce(() => {
        throw new NotFoundException('Blog is not found');
      });

      const response = await request(app.getHttpServer())
        .get(`/blogs/${blogId}`)
        .expect(404);

      expect(response.body.message).toBe('Blog is not found');
    });
  });

  describe('PUT /blogs/:id', () => {
    it('should update a blog and return a success response', async () => {
      const blogId = "550e8400-e29b-41d4-a716-446655440000";
      const editDto: EditDto = {
        title: "New blog post",
      };

      jest.spyOn(blogService, 'editBlog').mockResolvedValue(undefined);

      const response = await request(app.getHttpServer())
        .put(`/blogs/${blogId}`)
        .send(editDto)
        .expect(200);

      expect(response.body).toEqual(
        new SuccessClass({ id: blogId }, 'blog is updated successfully'),
      );
    });

    it('should return 404 if blog is not found', async () => {
      const blogId = "550e8400-e29b-41d4-a716-446655440001";
      const editDto: EditDto = {
        title: "New blog post",
      };

      jest.spyOn(blogService, 'editBlog').mockRejectedValue(new NotFoundException('Blog is not found'));

      const response = await request(app.getHttpServer())
        .put(`/blogs/${blogId}`)
        .send(editDto)
        .expect(404);

      expect(response.body.message).toBe('Blog is not found');
    });
  });

  describe('DELETE /blogs/:id', () => {
    it('should delete a blog and return a success response', async () => {
      const blogId = "550e8400-e29b-41d4-a716-446655440000";

      jest.spyOn(blogService, 'deleteBlog').mockResolvedValue(undefined);

      const response = await request(app.getHttpServer())
        .delete(`/blogs/${blogId}`)
        .expect(200);

      expect(response.body).toEqual(
        new SuccessClass({}, 'blog is deleted successfully'),
      );
    });

    it('should return 404 if blog is not found', async () => {
      const blogId = "550e8400-e29b-41d4-a716-446655440001";

      jest.spyOn(blogService, 'deleteBlog').mockRejectedValue(new NotFoundException('Blog is not found'));

      const response = await request(app.getHttpServer())
        .delete(`/blogs/${blogId}`)
        .expect(404);

      expect(response.body.message).toBe('Blog is not found');
    });
  });
});
