import { Injectable } from '@nestjs/common';
import { CreateMemberHomeDto } from './dto/create-member_home.dto';
import { UpdateMemberHomeDto } from './dto/update-member_home.dto';

@Injectable()
export class MemberHomeService {
  create(createMemberHomeDto: CreateMemberHomeDto) {
    return 'This action adds a new memberHome';
  }

  findAll() {
    return `This action returns all memberHome`;
  }

  findOne(id: number) {
    return `This action returns a #${id} memberHome`;
  }

  update(id: number, updateMemberHomeDto: UpdateMemberHomeDto) {
    return `This action updates a #${id} memberHome`;
  }

  remove(id: number) {
    return `This action removes a #${id} memberHome`;
  }
}
