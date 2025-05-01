import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateHomeDto {
  @ApiProperty({
    description: 'Nombre del hogar',
    example: 'Casa del Rio San Pedro',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre del hogar es obligatorio.' })
  @MaxLength(50, { message: 'El nombre no puede tener más de 50 caracteres.' })
  name: string;
}
