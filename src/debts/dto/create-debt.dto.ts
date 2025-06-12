import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsNumber, IsString, Min } from 'class-validator';

export class CreateDebtDto {
  @ApiProperty({ example: 'Compra del súper' })
  @IsString()
  description: string;

  @ApiProperty({ example: 60 })
  @IsNumber()
  @Min(0.01, { message: 'La deuda debe ser mayor a 0.01' })
  amount: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  homeId: number;

  @ApiProperty({ example: [3, 4], description: 'IDs de los miembros afectados' })
  @IsArray()
  @ArrayNotEmpty()
  affectedMemberIds: number[];
}
