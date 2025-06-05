import { ArrayNotEmpty, IsArray, IsNumber, IsString, Min } from 'class-validator';

export class CreateDebtDto {
  @IsString()
  description: string;

  @IsNumber()
  @Min(0.01, { message: 'Amount must be greater than 0.01' })
  amount: number;

  @IsNumber()
  homeId: number;

  @IsArray()
  @ArrayNotEmpty()
  affectedMemberIds: number[];
}
