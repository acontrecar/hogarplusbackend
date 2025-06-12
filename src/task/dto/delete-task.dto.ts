import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class DeleteTaskDto {
  @ApiProperty({
    description: 'ID de la casa a la que pertenece la tarea',
    example: 2,
  })
  @IsNotEmpty()
  @IsNumber()
  houseId: number;

  @ApiProperty({
    description: 'ID de la tarea a eliminar',
    example: 2,
  })
  @IsNotEmpty()
  @IsNumber()
  taskId: number;
}
