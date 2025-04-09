import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  Matches,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'ahmedmohamedalex93@gmail.com',
    description: 'The email of the user',
    required: true,
  })
  @IsNotEmpty({ message: 'email_IS_REQUIRED' })
  @IsEmail({}, { message: 'email_IS_INVALID' })
  email: string;

  @ApiProperty({
    example: 'Hamada_5393',
    description: 'The password of the user',
    required: true,
  })
  @IsNotEmpty({ message: 'password_IS_REQUIRED' })
  @Matches(/^[\w!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]{8,16}$/, { message: 'password_IS_INVALID' })
  password: string;
}
