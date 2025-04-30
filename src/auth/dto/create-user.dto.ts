import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'Name of the user',
  })
  @IsNotEmpty({ message: 'Name is required' })
  readonly name: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'User email address',
  })
  @IsNotEmpty({ message: 'Email must be valid' })
  @IsEmail()
  readonly email: string;

  @ApiProperty({
    example: 'strongpassword',
    description: 'Password for the user (minimum 6 characters)',
    minLength: 6,
  })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  readonly password: string;
}
