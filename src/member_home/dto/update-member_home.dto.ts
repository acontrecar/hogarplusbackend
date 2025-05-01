import { PartialType } from '@nestjs/swagger';
import { CreateMemberHomeDto } from './create-member_home.dto';

export class UpdateMemberHomeDto extends PartialType(CreateMemberHomeDto) {}
