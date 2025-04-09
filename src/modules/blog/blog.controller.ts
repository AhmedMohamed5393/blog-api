import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
  Param,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { SuccessClass } from '@shared/classes/success.class';
import { BlogService } from './blog.service';
import { PageOptionsDto } from '@shared/pagination/pageOption.dto';
import { EditDto, AddDto } from './dtos/index.dto';
import { AuthenticatedUser } from '@shared/decorators/index.decorator';
import { Roles } from '@shared/decorators/index.decorator';
import { AuthGuard, RolesGuard } from '@shared/guards/index.guard';
import { AuthTypeEnum } from '@shared/enums/index.enum';
import {
  createBlogResponse,
  deleteBlogResponse,
  findBlogDetailsResponse,
  findBlogsListResponse,
  updateBlogResponse,
} from './constants/blogs-examples.constant';
import { AuthenticatedUserInterface } from '@shared/interfaces/index.interface';

const { ADMIN, EDITOR } = AuthTypeEnum;

@ApiTags('blogs') // Group endpoints under 'blogs' in Swagger UI
@ApiBearerAuth('access-token') // Add Bearer Auth to all endpoints
@UseInterceptors(ClassSerializerInterceptor)
@Controller('blogs')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(ADMIN, EDITOR)
  @ApiOperation({ summary: 'Create a new blog' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden resource' })
  @ApiResponse({
    status: 201,
    description: 'Blog is created successfully',
    example: createBlogResponse,
  })
  @ApiBody({ type: AddDto })
  @Post('/')
  async addBlog(
    @Body() newBlog: AddDto,
    @AuthenticatedUser() user: AuthenticatedUserInterface,
  ): Promise<SuccessClass> {
    const data = await this.blogService.saveNewBlog(newBlog, user);
    return new SuccessClass(data, 'blog is created successfully');
  }

  @ApiOperation({ summary: 'Get all blogs' })
  @ApiResponse({
    status: 200,
    description: 'List of blogs retrieved successfully',
    example: findBlogsListResponse,
  })
  @ApiQuery({ type: PageOptionsDto })
  @Get('/')
  async getBlogs(@Query() pageOptionsDto: PageOptionsDto): Promise<SuccessClass> {
    const blogs = await this.blogService.getBlogs(pageOptionsDto);
    return new SuccessClass(blogs);
  }

  @ApiOperation({ summary: 'Get a blog by ID' })
  @ApiResponse({
    status: 200,
    description: 'Blog retrieved successfully',
    example: findBlogDetailsResponse,
  })
  @ApiParam({ name: 'id', type: String, description: 'Blog ID' })
  @Get('/:id')
  async getBlogById(@Param('id') id: string): Promise<SuccessClass> {
    const blog = await this.blogService.getBlogById(id);
    return new SuccessClass(blog);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(ADMIN, EDITOR)
  @ApiOperation({ summary: 'Update a blog by ID' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden resource' })
  @ApiResponse({
    status: 200,
    description: 'Blog is updated successfully',
    example: updateBlogResponse,
  })
  @ApiParam({ name: 'id', type: String, description: 'Blog ID' })
  @ApiBody({ type: EditDto })
  @Put('/:id')
  async editBlog(
    @Param('id') id: string,
    @Body() blogToEdit: EditDto,
    @AuthenticatedUser() user: AuthenticatedUserInterface,
  ): Promise<SuccessClass> {
    await this.blogService.editBlog(id, blogToEdit, user);
    return new SuccessClass({ id }, 'blog is updated successfully');
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(ADMIN)
  @ApiOperation({ summary: 'Delete a blog by ID' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden resource' })
  @ApiResponse({
    status: 200,
    description: 'Blog is deleted successfully',
    example: deleteBlogResponse,
  })
  @ApiParam({ name: 'id', type: String, description: 'Blog ID' })
  @Delete('/:id')
  async deleteBlog(
    @Param('id') id: string,
    @AuthenticatedUser() user: AuthenticatedUserInterface,
  ): Promise<SuccessClass> {
    await this.blogService.deleteBlog(id, user);
    return new SuccessClass({}, 'blog is deleted successfully');
  }
}
