import { IsNotEmpty, IsDateString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTaskDto {
  @ApiProperty()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ required: false })
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsDateString()
  date: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  time?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  duration?: string;

  @ApiProperty({ enum: ['low', 'medium', 'high'], default: 'medium' })
  @IsOptional()
  @IsEnum(['low', 'medium', 'high'])
  priority?: string;

  @ApiProperty({ type: [Number] })
  @IsNotEmpty({ each: true })
  assignedTo: number[];

  @ApiProperty()
  @IsNotEmpty()
  houseId: number;
}
