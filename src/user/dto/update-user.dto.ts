import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({
    example: 'Jane Doe',
    description: 'Updated name of the user',
  })
  @IsOptional()
  @IsString()
  readonly name?: string;

  @ApiPropertyOptional({
    example: 'jane.doe@example.com',
    description: 'Updated email address',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Email must be valid' })
  readonly email?: string;

  @ApiPropertyOptional({
    example: 'newpassword123',
    description: 'Updated password (minimum 6 characters)',
    minLength: 6,
  })
  @IsOptional()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password?: string;

  @ApiPropertyOptional({
    example: '+34123456789',
    description: 'Updated phone number',
  })
  @IsOptional()
  @IsString()
  readonly phone?: string;

  @ApiPropertyOptional({
    example:
      'https://res.cloudinary.com/demo/image/upload/v1680000000/avatar.png',
    description: 'URL of the updated avatar image',
  })
  @IsOptional()
  @IsString()
  readonly avatar?: string;
}
