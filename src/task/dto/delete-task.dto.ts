import { IsNotEmpty, IsNumber } from 'class-validator';

export class DeleteTaskDto {
  @IsNotEmpty()
  @IsNumber()
  houseId: number;

  @IsNotEmpty()
  @IsNumber()
  taskId: number;
}
