import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({
    example: 'Juan Pérezz',
    description: 'Nombre completo del usuario',
  })
  @IsOptional()
  @IsString()
  readonly name?: string;

  @ApiPropertyOptional({
    example: 'juan.perez@example.com',
    description: 'Dirección de correo electrónico del usuario',
  })
  @IsOptional()
  @IsEmail({}, { message: 'El email debe tener un formato válido' })
  readonly email?: string;

  @ApiPropertyOptional({
    example: 'nuevaPassword123',
    description: 'Contraseña nueva (mínimo 6 caracteres)',
    minLength: 6,
  })
  @IsOptional()
  @MinLength(6, {
    message: 'La contraseña debe tener al menos 6 caracteres',
  })
  password?: string;

  @ApiPropertyOptional({
    example: '123456789',
    description: 'Número de teléfono del usuario',
  })
  @IsOptional()
  @IsString()
  readonly phone?: string;

  @ApiPropertyOptional({
    example: 'https://res.cloudinary.com/demo/image/upload/v1680000000/avatar.png',
    description: 'URL of the updated avatar image',
  })
  @IsOptional()
  @IsString()
  readonly avatar?: string;
}
