import { IsNotEmpty, IsDateString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTaskDto {
  @ApiProperty({
    description: 'Título de la tarea',
    example: 'Limpiar cocina',
  })
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Descripción adicional de la tarea',
    example: 'No olvides fregar detrás del microondas',
    required: false,
  })
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Fecha de la tarea (formato ISO)',
    example: '2025-06-15T00:00:00.000Z',
  })
  @IsDateString()
  date: Date;

  @ApiProperty({
    description: 'Hora estimada de inicio (opcional)',
    example: '16:30',
    required: false,
  })
  @IsOptional()
  time?: string;

  @ApiProperty({
    description: 'Duración estimada (opcional, formato libre)',
    example: '1h 30min',
    required: false,
  })
  @IsOptional()
  duration?: string;

  @ApiProperty({
    description: 'Prioridad de la tarea',
    enum: ['low', 'medium', 'high'],
    default: 'medium',
    required: false,
  })
  @IsOptional()
  @IsEnum(['low', 'medium', 'high'])
  priority?: string;

  @ApiProperty({
    description: 'IDs de los miembros asignados a la tarea',
    type: [Number],
    example: [2, 132],
  })
  @IsNotEmpty({ each: true })
  assignedTo: number[];

  @ApiProperty({
    description: 'ID de la casa a la que pertenece la tarea',
    example: 2,
  })
  @IsNotEmpty()
  houseId: number;
}
