import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MemberHomeService } from './member_home.service';
import { CreateMemberHomeDto } from './dto/create-member_home.dto';
import { UpdateMemberHomeDto } from './dto/update-member_home.dto';

@Controller('member-home')
export class MemberHomeController {
  constructor(private readonly memberHomeService: MemberHomeService) {}

  // @Post()
  // create(@Body() createMemberHomeDto: CreateMemberHomeDto) {
  //   return this.memberHomeService.create(createMemberHomeDto);
  // }

  // @Get()
  // findAll() {
  //   return this.memberHomeService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.memberHomeService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateMemberHomeDto: UpdateMemberHomeDto) {
  //   return this.memberHomeService.update(+id, updateMemberHomeDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.memberHomeService.remove(+id);
  // }
}
