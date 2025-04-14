import { PartialType } from '@nestjs/mapped-types';
import { CreateMemberHomeDto } from './create-member_home.dto';

export class UpdateMemberHomeDto extends PartialType(CreateMemberHomeDto) {}
