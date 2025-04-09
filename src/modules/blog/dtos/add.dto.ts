import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class AddDto {
  @ApiProperty({
    example: 'Title of the new blog',
    description: 'The title of the blog',
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    example: 'Blog Content',
    description: 'The content of the blog',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty({
    example: ["Welcome_onboard"],
    description: 'The tags of the blog',
  })
  @IsOptional()
  @IsArray()
  tags?: string[];
}
